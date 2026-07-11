import { expect, test, type Page, type Route } from '@playwright/test';

const IMAGE = {
  name: 'venue.png',
  mimeType: 'image/png',
  buffer: Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64'
  ),
};

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
    await expect(page.getByLabel(/地址/)).toHaveValue('台北市中山區測試路 1 號');
  } else {
    await page.getByLabel(/場地名稱/).fill('測試場地');
    await page.getByLabel(/地址/).fill('台北市中山區測試路 1 號');
  }

  await selectOption(page, '請選擇地區', '台北');
  await selectOption(page, '請選擇容納人數範圍', '20-40人');
  await page.getByLabel('Instagram').fill('@stellar');
  await page.locator('main input[type="file"]').first().setInputFiles(IMAGE);
  await expect(page.getByAltText('已上傳的主視覺圖片預覽')).toBeVisible();
}

test.describe('公開場地投稿', () => {
  test('未登入可完成投稿，成功後 reload 不會重送', async ({ page }) => {
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

    await expect(page.getByRole('heading', { name: '已收到場地投稿' })).toBeVisible();
    await expect(page.getByText(/審核通過後，平台上就可以看見/)).toBeVisible();
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
      socialMedia: { instagram: '@stellar' },
    });

    await page.reload();
    await expect(page.getByRole('heading', { name: '投稿場地' })).toBeVisible();
    expect(submissionCount).toBe(1);
  });

  test('空表單顯示 required errors 且不送出 request', async ({ page }) => {
    let submissionCount = 0;
    await page.route('**/api/venue-submissions', async (route) => {
      submissionCount += 1;
      await route.fulfill({ status: 201, json: {} });
    });

    await page.goto('/submit-venue');
    await page.getByRole('button', { name: '送出場地投稿' }).click();

    await expect(page.getByText('請填寫場地名稱')).toBeVisible();
    await expect(page.getByText('請選擇容納人數', { exact: true })).toBeVisible();
    await expect(page.getByText('請至少填寫 Instagram 或 Threads')).toBeVisible();
    await expect(page.getByText('請上傳封面圖片')).toBeVisible();
    expect(submissionCount).toBe(0);
  });

  test('圖片上傳失敗後可重試成功', async ({ page }) => {
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
    await expect(page.getByRole('button', { name: '點擊重新上傳圖片' })).toBeVisible();
    await page.getByRole('button', { name: '點擊重新上傳圖片' }).click();

    await expect(page.getByAltText('已上傳的主視覺圖片預覽')).toBeVisible();
    expect(uploadCount).toBe(2);
  });

  test('投稿失敗保留表單，重送後成功', async ({ page }) => {
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

    await expect(page.getByText('投稿暫時失敗')).toBeVisible();
    await expect(page.getByLabel(/場地名稱/)).toHaveValue('測試場地');
    await page.getByRole('button', { name: '送出場地投稿' }).click();
    await expect(page.getByRole('heading', { name: '已收到場地投稿' })).toBeVisible();
    expect(submissionCount).toBe(2);
  });

  test('頁面設定 noindex 與 nofollow', async ({ page }) => {
    await page.goto('/submit-venue');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex.*nofollow|nofollow.*noindex/
    );
  });
});
