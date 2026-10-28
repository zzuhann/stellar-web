import { expect, test, type Page, type Route } from '@playwright/test';

// Store submission, 3-step form (venue-tags §D, qa.md TC-086 and the E2E-only history cases).
// jsdom cannot traverse real cross-entry history, so back/forward/reload land here.

const IMAGE = {
  name: 'venue.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64'
  ),
};

const DRAFT_KEY = 'stellar:venue-submit-draft';
const FAILED_BANNER =
  '送出場地投稿失敗，請確認錯誤訊息及網路連線狀態後再次送出，若持續失敗，請私訊 STELLAR IG 或是 Threads 帳號。';
// A light static page stands in for "the page before the form" so tests stay hermetic
const BEFORE = '/about';

function expectPublicRequest(route: Route) {
  expect(route.request().headers().authorization).toBeUndefined();
}

async function mockPlaces(page: Page) {
  await page.route('**/api/venue-submissions/places/autocomplete', async (route) => {
    expectPublicRequest(route);
    await route.fulfill({
      json: {
        predictions: [
          {
            place_id: 'place-1',
            description: '測試場地，台北市',
            structured_formatting: { main_text: '測試場地', secondary_text: '台北市' },
          },
        ],
      },
    });
  });
  await page.route('**/api/venue-submissions/places/place-1', async (route) => {
    expectPublicRequest(route);
    await route.fulfill({
      json: {
        name: '測試場地',
        formatted_address: '台北市中山區測試路 1 號',
        city: '台北市',
        types: ['establishment'],
        geometry: { location: { lat: 25.05, lng: 121.52 } },
      },
    });
  });
}

async function mockUploads(page: Page) {
  await page.route('**/api/venue-submissions/images', async (route) => {
    expectPublicRequest(route);
    await route.fulfill({ json: { success: true, filename: 'venue-test.jpg' } });
  });
}

function mockSubmissions(page: Page, responses: number[] = [201]) {
  const state = { count: 0, payloads: [] as Record<string, unknown>[] };
  void page.route('**/api/venue-submissions', async (route) => {
    expectPublicRequest(route);
    state.payloads.push(route.request().postDataJSON());
    const status = responses[Math.min(state.count, responses.length - 1)];
    state.count += 1;
    await route.fulfill(
      status === 201
        ? { status: 201, json: { id: 'venue-1' } }
        : { status, json: { error: '投稿暫時失敗' } }
    );
  });
  return state;
}

const heading = (page: Page) => page.getByRole('heading', { level: 1 });
const stepLabel = (page: Page, step: number) => page.getByText(new RegExp(`^第 ${step} 步・`));

async function expectStep(page: Page, step: number) {
  await expect(stepLabel(page, step)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`step=${step}`));
}

async function choose(page: Page, label: string, option: string) {
  await page.getByRole('button', { name: new RegExp(`^${label}：`) }).click();
  await page.getByRole('option', { name: option }).click();
}

const pick = (page: Page, text: string) =>
  page
    .locator('label', { has: page.getByText(text, { exact: true }) })
    .first()
    .click();

async function fillStep1(page: Page) {
  await page.getByRole('combobox', { name: '搜尋地點' }).fill('測試場地');
  await page.getByRole('option', { name: /測試場地/ }).click();
  await expect(page.getByLabel('場地名稱')).toHaveValue('測試場地');
  await choose(page, '地區', '台北');
  await choose(page, '場地大約可以容納多少人？', '20-40人');
}

async function fillStep2(page: Page) {
  await pick(page, '發放應援物');
  await pick(page, '客製餐點');
  await pick(page, '咖啡廳');
}

async function fillStep3(page: Page) {
  await pick(page, 'Instagram 私訊');
  await page.getByLabel('Instagram 帳號').fill('stellar');
  await page.getByTestId('cover-file-input').setInputFiles(IMAGE);
  await expect(page.getByAltText('封面照片')).toBeVisible();
  await expect(page.getByRole('button', { name: '送出投稿' })).toBeEnabled();
}

async function next(page: Page, to: number) {
  await page.getByRole('button', { name: '下一步' }).click();
  await expectStep(page, to);
}

// Enter the form from another page so "back" has somewhere to leave to
async function enterForm(page: Page) {
  await page.goto(BEFORE);
  await page.goto('/submit-venue');
  await expectStep(page, 1);
}

async function toStep3(page: Page) {
  await enterForm(page);
  await fillStep1(page);
  await next(page, 2);
  await fillStep2(page);
  await next(page, 3);
}

const depthOf = (page: Page) =>
  page.evaluate(() => (window.history.state ?? {}).venueSubmitDepth as number | undefined);
const draftOf = (page: Page) =>
  page.evaluate((key) => window.sessionStorage.getItem(key), DRAFT_KEY);

const expectLeftForm = (page: Page) => expect(page).toHaveURL(new RegExp(`${BEFORE}$`));

test.beforeEach(async ({ page }) => {
  await mockPlaces(page);
  await mockUploads(page);
});

test.describe('TC-086 公開場地投稿（3 步）', () => {
  test('走完 3 步送出；送出前重新整理一次（TC-124）；成功後 reload 是空白第 1 步、不重送', async ({
    page,
  }) => {
    const submissions = mockSubmissions(page);
    await toStep3(page);
    await fillStep3(page);
    await page.reload();
    await expectStep(page, 3);
    await expect(page.getByLabel('Instagram 帳號')).toHaveValue('stellar');
    await page.getByRole('button', { name: '送出投稿' }).click();

    await expect(page.getByRole('heading', { name: '已收到場地投稿' })).toBeVisible();
    const payload = submissions.payloads[0];
    expect(payload).toMatchObject({
      name: '測試場地',
      address: '台北市中山區測試路 1 號',
      region: '台北',
      capacityRange: '20-40',
      coverPhoto: expect.stringContaining('venue-test.jpg'),
      placeId: 'place-1',
      lat: 25.05,
      lng: 121.52,
      preferredContact: 'instagram',
      socialMedia: { instagram: 'stellar' },
      transitStops: [],
      venueConditions: {
        uses: { options: ['goods_distribution'] },
        services: { options: ['custom_menu'] },
        spaceTypes: { options: ['cafe'] },
      },
    });
    expect(payload).not.toHaveProperty('hostTags');

    await page.reload();
    await expect(heading(page)).toHaveText('輸入你的場地名稱或地點');
    await expect(page.getByLabel('場地名稱')).toHaveCount(0);
    expect(submissions.count).toBe(1);
  });

  test('第 1 步空白按「下一步」只顯示第 1 步的錯誤', async ({ page }) => {
    const submissions = mockSubmissions(page);
    await enterForm(page);
    await page.getByRole('button', { name: '下一步' }).click();
    await expect(page.getByText('請從搜尋結果選擇你的店家')).toBeVisible();
    await expect(page.getByText('請選擇地區')).toBeVisible();
    await expect(page.getByText('請選擇容納人數', { exact: true })).toBeVisible();
    await expect(page.getByText('請填寫場地名稱')).toHaveCount(0);
    await expect(page.getByText('請選擇偏好的聯絡方式')).toHaveCount(0);
    await expect(page.getByText('請上傳封面圖片')).toHaveCount(0);
    expect(submissions.count).toBe(0);
  });

  test('第 1、2 步填好、第 3 步空白按「送出投稿」', async ({ page }) => {
    const submissions = mockSubmissions(page);
    await toStep3(page);
    await page.getByRole('button', { name: '送出投稿' }).click();
    await expect(page.getByText('請選擇偏好的聯絡方式')).toBeVisible();
    await expect(page.getByText('請上傳封面圖片')).toBeVisible();
    expect(submissions.count).toBe(0);
  });

  test('第 3 步圖片上傳失敗後可重試成功', async ({ page }) => {
    let uploadCount = 0;
    await page.unroute('**/api/venue-submissions/images');
    await page.route('**/api/venue-submissions/images', async (route) => {
      expectPublicRequest(route);
      uploadCount += 1;
      if (uploadCount === 1) {
        await route.fulfill({ status: 500, json: { error: '暫時無法上傳' } });
      } else {
        await route.fulfill({ json: { success: true, filename: 'retry-success.jpg' } });
      }
    });
    await toStep3(page);
    await page.getByTestId('cover-file-input').setInputFiles(IMAGE);
    await page.getByRole('button', { name: '點擊重新上傳圖片' }).click();
    await expect(page.getByAltText('封面照片')).toBeVisible();
    // Unlocked = every upload settled (the retry is in flight until then)
    await expect(page.getByRole('button', { name: '送出投稿' })).toBeEnabled();
    await expect(page.getByRole('button', { name: '點擊重新上傳圖片' })).toHaveCount(0);
    expect(uploadCount).toBe(2);
  });

  test('送出失敗保留資料；重新整理後還在（TC-143）；重送成功且內容相同', async ({ page }) => {
    const submissions = mockSubmissions(page, [500, 201]);
    await toStep3(page);
    await fillStep3(page);
    await page.getByRole('button', { name: '送出投稿' }).click();
    await expect(page.getByText(FAILED_BANNER)).toBeVisible();
    await expect(page.getByText('投稿暫時失敗')).toBeVisible();
    await expect(page.getByLabel('Instagram 帳號')).toHaveValue('stellar');
    expect(await draftOf(page)).not.toBeNull();

    await page.reload();
    await expectStep(page, 3);
    await expect(page.getByText(FAILED_BANNER)).toHaveCount(0);
    await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);
    await page.getByRole('button', { name: '送出投稿' }).click();
    await expect(page.getByRole('heading', { name: '已收到場地投稿' })).toBeVisible();
    expect(submissions.count).toBe(2);
    expect(submissions.payloads[1]).toEqual(submissions.payloads[0]);
  });

  test('頁面設定 noindex 與 nofollow', async ({ page }) => {
    await page.goto('/submit-venue');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex.*nofollow|nofollow.*noindex/
    );
  });
});

test.describe('進入表單與暫存', () => {
  test('TC-101 a：沒有暫存直接開 ?step=3 → 第 1 步，返回一次就離開', async ({ page }) => {
    await page.goto(BEFORE);
    await page.goto('/submit-venue?step=3');
    await expectStep(page, 1);
    await page.goBack();
    await expectLeftForm(page);
  });

  test('TC-105 另開新分頁是空白的；原分頁重新整理仍還原', async ({ page, context }) => {
    await enterForm(page);
    await fillStep1(page);
    await next(page, 2);

    const other = await context.newPage();
    await mockPlaces(other);
    await other.goto('/submit-venue');
    await expect(stepLabel(other, 1)).toBeVisible();
    await expect(other.getByRole('combobox', { name: '搜尋地點' })).toBeVisible();
    await expect(other.getByLabel('場地名稱')).toHaveCount(0);
    await other.close();

    await page.reload();
    await expectStep(page, 2);
    await page.getByRole('button', { name: '上一步' }).click();
    await expect(page.getByLabel('場地名稱')).toHaveValue('測試場地');
  });

  test('TC-110 步行分鐘貼上「步行10分鐘」顯示「10」，沒有 maxlength', async ({ page }) => {
    await enterForm(page);
    const walk = page.getByLabel('交通方式 1 步行分鐘');
    await expect(walk).not.toHaveAttribute('maxlength', /.*/);
    await walk.fill('步行10分鐘');
    await expect(walk).toHaveValue('10');
  });
});

test.describe('上一頁紀錄', () => {
  test('TC-128 返回鍵回到上一步、前進回來資料都在；頁首「上一步」一樣', async ({ page }) => {
    await toStep3(page);
    await page.goBack();
    await expectStep(page, 2);
    await page.goBack();
    await expectStep(page, 1);
    await page.goForward();
    await expectStep(page, 2);
    await expect(page.getByRole('checkbox', { name: '發放應援物' })).toBeChecked();

    await page.goForward();
    await expectStep(page, 3);
    await page.getByRole('button', { name: '上一步' }).click();
    await expectStep(page, 2);
    await page.getByRole('button', { name: '上一步' }).click();
    await expectStep(page, 1);
  });

  test('TC-129 第 1 步按返回就離開；暫存不清，再進來會還原', async ({ page }) => {
    await enterForm(page);
    await fillStep1(page);
    await next(page, 2);
    await page.goBack();
    await expectStep(page, 1);
    await page.goBack();
    await expectLeftForm(page);

    await page.goto('/submit-venue');
    await expect(page.getByLabel('場地名稱')).toHaveValue('測試場地');
  });

  test('TC-119 a：第 1 步改壞後前進到第 3 步送出 → 退回第 1 步、不 push；再返回就離開', async ({
    page,
  }) => {
    const submissions = mockSubmissions(page);
    await toStep3(page);
    await fillStep3(page);
    await page.getByRole('button', { name: '上一步' }).click();
    await expectStep(page, 2);
    await page.getByRole('button', { name: '上一步' }).click();
    await expectStep(page, 1);
    await page.getByLabel('場地名稱').fill('');
    await page.goForward();
    await expectStep(page, 2);
    await page.goForward();
    await expectStep(page, 3);
    const lengthBefore = await page.evaluate(() => window.history.length);

    await page.getByRole('button', { name: '送出投稿' }).click();
    await expectStep(page, 1);
    const name = page.getByLabel('場地名稱');
    await expect(page.getByText('請填寫場地名稱')).toBeVisible();
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toBeFocused();
    expect(await page.evaluate(() => window.history.length)).toBe(lengthBefore);
    expect(submissions.count).toBe(0);

    await page.goBack();
    await expectLeftForm(page);
  });

  test('TC-119 b：只有第 2 步有錯（過期日期）→ 退到第 2 步；返回 → 第 1 步；再返回 → 離開', async ({
    page,
  }) => {
    const submissions = mockSubmissions(page);
    await toStep3(page);
    await fillStep3(page);
    // Expire the limited-offer date in the draft, as if the tab sat past midnight
    await page.evaluate((key) => {
      const draft = JSON.parse(window.sessionStorage.getItem(key) ?? '{}');
      draft.form.uses.options = ['can_decorate'];
      draft.form.fees = {
        venueFee: 'free',
        freeVenueLimited: true,
        freeVenueUntil: '2020-01-01',
        guarantee: '',
        deposit: '',
        discussable: false,
      };
      window.sessionStorage.setItem(key, JSON.stringify(draft));
    }, DRAFT_KEY);
    await page.reload();
    await expectStep(page, 3);

    await page.getByRole('button', { name: '送出投稿' }).click();
    await expectStep(page, 2);
    await expect(page.getByText('請重新選擇日期')).toBeVisible();
    expect(submissions.count).toBe(0);
    await page.goBack();
    await expectStep(page, 1);
    await page.goBack();
    await expectLeftForm(page);
  });

  test('TC-130 d：走到第 3 步再退回第 1 步，按「×」→「離開」，返回不會經過表單步驟', async ({
    page,
  }) => {
    await toStep3(page);
    await page.getByRole('button', { name: '上一步' }).click();
    await expectStep(page, 2);
    await page.getByRole('button', { name: '上一步' }).click();
    await expectStep(page, 1);
    await page.getByRole('button', { name: '離開投稿' }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: '離開' }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(await draftOf(page)).toBeNull();
    await page.goBack();
    await expectLeftForm(page);
  });

  test('TC-142 暫存失效後重新整理 → 退回進表單那一筆（depth 0），返回一次就離開', async ({
    page,
  }) => {
    for (const corrupt of ['version', 'json'] as const) {
      await toStep3(page);
      expect(await depthOf(page)).toBe(2);
      await page.evaluate(
        ([key, mode]) => {
          const raw = window.sessionStorage.getItem(key) ?? '{}';
          window.sessionStorage.setItem(
            key,
            mode === 'json' ? raw.slice(0, 10) : JSON.stringify({ ...JSON.parse(raw), version: 1 })
          );
        },
        [DRAFT_KEY, corrupt] as const
      );
      await page.reload();
      await expectStep(page, 1);
      await expect(page.getByLabel('場地名稱')).toHaveCount(0);
      await expect.poll(() => depthOf(page)).toBe(0);
      await page.goBack();
      await expectLeftForm(page);
    }
  });
});

test.describe('送出成功後', () => {
  test('TC-120 a、c／TC-121：成功後網址沒有 step、暫存清空；返回一次就離開；前進回來是空白第 1 步', async ({
    page,
  }) => {
    const submissions = mockSubmissions(page);
    await toStep3(page);
    await fillStep3(page);
    await page.getByRole('button', { name: '送出投稿' }).click();
    await expect(page.getByRole('heading', { name: '已收到場地投稿' })).toBeVisible();
    await expect(page).toHaveURL(/\/submit-venue$/);
    expect(await draftOf(page)).toBeNull();

    await page.goBack();
    await expectLeftForm(page);
    await page.goForward();
    await page.goForward();
    await expect(stepLabel(page, 1)).toBeVisible();
    await expect(page.getByLabel('場地名稱')).toHaveCount(0);
    expect(submissions.count).toBe(1);

    await page.goto('/submit-venue');
    await expect(page.getByLabel('場地名稱')).toHaveCount(0);
  });

  test('TC-120 b：第 3 步重新整理後送出成功，返回一次就離開', async ({ page }) => {
    mockSubmissions(page);
    await toStep3(page);
    await fillStep3(page);
    await page.reload();
    await expectStep(page, 3);
    await page.getByRole('button', { name: '送出投稿' }).click();
    await expect(page.getByRole('heading', { name: '已收到場地投稿' })).toBeVisible();
    await expect(page).toHaveURL(/\/submit-venue$/);
    await page.goBack();
    await expectLeftForm(page);
  });

  test('TC-120 d：返回到第 2 步、重新整理、再下一步送出，返回一次就離開', async ({ page }) => {
    mockSubmissions(page);
    await toStep3(page);
    await fillStep3(page);
    await page.goBack();
    await expectStep(page, 2);
    await page.reload();
    await expectStep(page, 2);
    expect(await depthOf(page)).toBe(1);
    await next(page, 3);
    await page.getByRole('button', { name: '送出投稿' }).click();
    await expect(page.getByRole('heading', { name: '已收到場地投稿' })).toBeVisible();
    await page.goBack();
    await expectLeftForm(page);
  });

  test('TC-122 成功回應晚到：中途返回到第 2 步，仍落在進表單那一筆；再返回才離開', async ({
    page,
  }) => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    await page.route('**/api/venue-submissions', async (route) => {
      await gate;
      await route.fulfill({ status: 201, json: { id: 'venue-1' } });
    });
    await toStep3(page);
    await fillStep3(page);
    await page.getByRole('button', { name: '送出投稿' }).click();
    await expect(page.getByRole('button', { name: '送出中' })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/step=2/);
    release();

    await expect(page.getByRole('heading', { name: '已收到場地投稿' })).toBeVisible();
    await expect(page).toHaveURL(/\/submit-venue$/);
    await page.goBack();
    await expectLeftForm(page);
    await page.goto('/submit-venue');
    await expect(page.getByLabel('場地名稱')).toHaveCount(0);
  });
});
