import { expect, test, type Page, type Route } from '@playwright/test';

/**
 * 公開場地投稿 /submit-venue。
 *
 * 這一整支對「後端」是唯讀的：所有 API（投稿、圖片上傳、Google Places）都用 page.route 攔截 mock，
 * request 不會真的送到 BASE_URL 後端，也不會寫入任何資料。@scenario none：不在 34 條情境清單內，但仍具價值。
 */

const IMAGE = {
  name: 'venue.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64'
  ),
};

function expectPublicRequest(route: Route) {
  expect(
    route.request().headers().authorization,
    '公開投稿的 request 不應帶 Authorization header（未登入即可投稿）'
  ).toBeUndefined();
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
        geometry: { location: { lat: 25.05, lng: 121.52 } },
      },
    });
  });
}

async function selectOption(page: Page, trigger: string, option: string) {
  await page.getByRole('button', { name: trigger }).click();
  await page.getByRole('option', { name: option }).click();
}

async function fillRequiredForm(page: Page, { usePlaces = false } = {}) {
  if (usePlaces) {
    await page.getByRole('combobox', { name: '搜尋地點' }).fill('測試場地');
    await page.getByRole('option', { name: /測試場地/ }).click();
    await expect(
      page.getByLabel(/地址/),
      '從 Google Places 選擇地點後，地址欄應自動帶入該地點的完整地址'
    ).toHaveValue('台北市中山區測試路 1 號');
  } else {
    await page.getByLabel(/場地名稱/).fill('測試場地');
    await page.getByLabel(/地址/).fill('台北市中山區測試路 1 號');
  }

  await selectOption(page, '請選擇地區', '台北');
  await selectOption(page, '請選擇容納人數範圍', '20-40人');
  await page.getByLabel('Instagram').fill('@stellar');
  await page.locator('main input[type="file"]').first().setInputFiles(IMAGE);
  await expect(
    page.getByAltText('已上傳的主視覺圖片預覽'),
    '上傳圖片後應顯示「已上傳的主視覺圖片預覽」，代表上傳流程完成'
  ).toBeVisible();
}

test.describe('公開場地投稿（全 mock，不落地）', () => {
  // @scenario none: 場地投稿成功流程（未登入可投稿），且成功後重整頁面不會重複送出。
  test('場地投稿：未登入填完必填欄位可成功投稿，成功畫面出現，且 reload 後不會重送', async ({
    page,
  }) => {
    let submissionCount = 0;
    let payload: Record<string, unknown> | undefined;
    await mockPlaces(page);
    await page.route('**/api/venue-submissions/images', async (route) => {
      expectPublicRequest(route);
      await route.fulfill({ json: { success: true, filename: 'venue-test.jpg' } });
    });
    await page.route('**/api/venue-submissions', async (route) => {
      expectPublicRequest(route);
      submissionCount += 1;
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { id: 'venue-1' } });
    });

    await page.goto('/submit-venue');
    await fillRequiredForm(page, { usePlaces: true });
    await page.getByRole('button', { name: '送出場地投稿' }).click();

    await expect(
      page.getByRole('heading', { name: '已收到場地投稿' }),
      '投稿成功後應顯示「已收到場地投稿」成功畫面，但找不到'
    ).toBeVisible();
    await expect(
      page.getByText(/審核通過後，平台上就可以看見/),
      '成功畫面應說明「審核通過後才會顯示」，但找不到該說明文案'
    ).toBeVisible();
    expect(
      payload,
      '送出的投稿內容應正確帶上表單各欄位（含地點、地區、人數、封面、社群）'
    ).toMatchObject({
      name: '測試場地',
      address: '台北市中山區測試路 1 號',
      region: '台北',
      capacityRange: '20-40',
      coverPhoto: expect.stringContaining('venue-test.jpg'),
      placeId: 'place-1',
      lat: 25.05,
      lng: 121.52,
      preferredContact: 'instagram',
      socialMedia: { instagram: '@stellar' },
    });

    await page.reload();
    await expect(
      page.getByRole('heading', { name: '投稿場地' }),
      'reload 後應回到投稿表單頁（標題「投稿場地」），代表沒有停留在成功狀態'
    ).toBeVisible();
    expect(submissionCount, 'reload 後不應再次觸發投稿 request，總送出次數應維持 1').toBe(1);
  });

  // @scenario none: 空表單送出時顯示必填錯誤，且不對後端送出 request。
  test('場地投稿：空表單直接送出應顯示各欄位必填錯誤，且完全不送出投稿 request', async ({
    page,
  }) => {
    let submissionCount = 0;
    await page.route('**/api/venue-submissions', async (route) => {
      submissionCount += 1;
      await route.fulfill({ status: 201, json: {} });
    });

    await page.goto('/submit-venue');
    await page.getByRole('button', { name: '送出場地投稿' }).click();

    await expect(
      page.getByText('請填寫場地名稱'),
      '空表單應顯示「請填寫場地名稱」錯誤'
    ).toBeVisible();
    await expect(
      page.getByText('請選擇容納人數', { exact: true }),
      '空表單應顯示「請選擇容納人數」錯誤'
    ).toBeVisible();
    await expect(
      page.getByText('請至少填寫 Instagram 或 Threads'),
      '空表單應顯示「請至少填寫 Instagram 或 Threads」錯誤'
    ).toBeVisible();
    await expect(
      page.getByText('請上傳封面圖片'),
      '空表單應顯示「請上傳封面圖片」錯誤'
    ).toBeVisible();
    expect(submissionCount, '有必填錯誤時不應送出任何投稿 request，送出次數應為 0').toBe(0);
  });

  // @scenario none: 圖片上傳失敗後可重試成功。
  test('場地投稿：圖片上傳第一次失敗後，點重新上傳應可成功', async ({ page }) => {
    let uploadCount = 0;
    await page.route('**/api/venue-submissions/images', async (route) => {
      expectPublicRequest(route);
      uploadCount += 1;
      if (uploadCount === 1) {
        await route.fulfill({ status: 500, json: { error: '暫時無法上傳' } });
      } else {
        await route.fulfill({ json: { success: true, filename: 'retry-success.jpg' } });
      }
    });

    await page.goto('/submit-venue');
    await page.locator('main input[type="file"]').first().setInputFiles(IMAGE);
    await expect(
      page.getByRole('button', { name: '點擊重新上傳圖片' }),
      '圖片上傳失敗後應出現「點擊重新上傳圖片」按鈕'
    ).toBeVisible();
    await page.getByRole('button', { name: '點擊重新上傳圖片' }).click();

    await expect(
      page.getByAltText('已上傳的主視覺圖片預覽'),
      '重試後應成功顯示圖片預覽'
    ).toBeVisible();
    expect(uploadCount, '圖片上傳應共嘗試 2 次（1 次失敗 + 1 次重試成功）').toBe(2);
  });

  // @scenario none: 投稿送出失敗時保留表單內容，重送後成功。
  test('場地投稿：送出失敗時應保留已填內容並顯示錯誤，重送後應成功', async ({ page }) => {
    let submissionCount = 0;
    await page.route('**/api/venue-submissions/images', (route) =>
      route.fulfill({ json: { success: true, filename: 'venue-test.jpg' } })
    );
    await page.route('**/api/venue-submissions', async (route) => {
      submissionCount += 1;
      if (submissionCount === 1) {
        await route.fulfill({ status: 500, json: { error: '投稿暫時失敗' } });
      } else {
        await route.fulfill({ status: 201, json: { id: 'venue-1' } });
      }
    });

    await page.goto('/submit-venue');
    await fillRequiredForm(page);
    await page.getByRole('button', { name: '送出場地投稿' }).click();

    await expect(
      page.getByText('投稿暫時失敗'),
      '第一次送出失敗應顯示後端錯誤訊息「投稿暫時失敗」'
    ).toBeVisible();
    await expect(
      page.getByLabel(/場地名稱/),
      '送出失敗後應保留已填的場地名稱「測試場地」，不清空表單'
    ).toHaveValue('測試場地');
    await page.getByRole('button', { name: '送出場地投稿' }).click();
    await expect(
      page.getByRole('heading', { name: '已收到場地投稿' }),
      '重送後應成功並顯示「已收到場地投稿」'
    ).toBeVisible();
    expect(submissionCount, '投稿應共嘗試 2 次（1 次失敗 + 1 次重送成功）').toBe(2);
  });

  // @scenario none: 投稿頁應設定 noindex/nofollow（不希望被搜尋引擎索引）。
  test('場地投稿：頁面 meta robots 應設定為 noindex 與 nofollow', async ({ page }) => {
    await page.goto('/submit-venue');
    await expect(
      page.locator('meta[name="robots"]'),
      '投稿頁的 <meta name="robots"> 應同時包含 noindex 與 nofollow'
    ).toHaveAttribute('content', /noindex.*nofollow|nofollow.*noindex/);
  });
});
