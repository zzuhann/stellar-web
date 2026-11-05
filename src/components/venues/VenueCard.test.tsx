import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VenueCard from './VenueCard';
import HomeVenueCard from '@/components/HomePage/components/HomeVenueCard';
import {
  trackClickHomeVenueDetail,
  trackClickVenueDetail,
  trackViewHomeVenueCard,
  trackViewVenueCard,
} from '@/lib/analytics/venues';
import { venueTagDictionaryFixture as dictionary } from '@/test/venueTagDictionary.fixture';
import type { TransitStop, Venue, VenueTag } from '@/types';

// jsdom has no IntersectionObserver; an observer that reports "visible" on observe() lets the
// view-tracking assertions run without a real viewport.
class IntersectionObserverStub {
  private callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe() {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
  }
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);

vi.mock('@/lib/analytics/venues', () => ({
  trackViewVenueCard: vi.fn(),
  trackClickVenueDetail: vi.fn(),
  trackViewHomeVenueCard: vi.fn(),
  trackClickHomeVenueDetail: vi.fn(),
}));

beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
});

afterEach(cleanup);

const BASE_VENUE: Venue = {
  id: 'venue-1',
  name: '測試場地',
  address: '台北市測試路 1 號',
  region: '台北',
  lat: 25.033,
  lng: 121.564,
  nearestMrt: null,
  mrtWalkMinutes: null,
  capacityRange: null,
  eventCount: 0,
  coverPhoto: null,
  status: 'active',
};

// 1km 東邊的台北車站座標附近，實際距離不重要，只需要是個有限、非 0 的距離。
const USER_COORDS = { lat: 25.033, lng: 121.574 };

function renderCard(overrides: Partial<Parameters<typeof VenueCard>[0]> = {}) {
  return render(
    <VenueCard
      venue={BASE_VENUE}
      listPosition={1}
      listSort="composite"
      dictionary={dictionary}
      {...overrides}
    />
  );
}

// qa.md 情境 39：VenueCard 距離顯示
describe('VenueCard 距離顯示（venue-distance-sort）', () => {
  it('未授權座標（userCoords 為 null）時，不顯示距離文字', () => {
    renderCard({ userCoords: null });
    expect(screen.queryByText(/公尺|公里/)).toBeNull();
  });

  it('已授權座標且場地有座標時，顯示距離文字', () => {
    renderCard({ userCoords: USER_COORDS });
    expect(screen.getByText(/約|公尺內|公里/)).toBeTruthy();
  });

  it('IAB 環境下，即使已授權座標也不顯示距離文字', () => {
    renderCard({ userCoords: USER_COORDS, isInAppBrowser: true });
    expect(screen.queryByText(/公尺|公里/)).toBeNull();
  });

  it('場地本身缺座標（lat/lng 皆為 0）時，不顯示距離文字', () => {
    renderCard({
      venue: { ...BASE_VENUE, lat: 0, lng: 0 },
      userCoords: USER_COORDS,
    });
    expect(screen.queryByText(/公尺|公里/)).toBeNull();
  });

  it('場地只有一邊座標為 0 時，視為有效座標，照常顯示距離', () => {
    renderCard({
      venue: { ...BASE_VENUE, lat: 0, lng: 121.564 },
      userCoords: USER_COORDS,
    });
    expect(screen.getByText(/約|公尺內|公里/)).toBeTruthy();
  });

  it('距離計算使用傳入的 userCoords（視為已 rounded），而非另外重新取得座標', () => {
    // 刻意讓 userCoords 與 venue 完全同點 → 距離 0 → "100 公尺內"
    renderCard({
      venue: { ...BASE_VENUE, lat: 25.033, lng: 121.564 },
      userCoords: { lat: 25.033, lng: 121.564 },
    });
    expect(screen.getByText(/100 公尺內/)).toBeTruthy();
  });

  it('已授權後切到其他排序（listSort 非 distance），只要卡片有座標仍持續顯示距離', () => {
    renderCard({ userCoords: USER_COORDS, listSort: 'newest' });
    expect(screen.getByText(/約|公尺內|公里/)).toBeTruthy();
  });

  it('可見文字本身已含「距離你」前綴，不再需要額外的 sr-only 節點', () => {
    renderCard({
      venue: { ...BASE_VENUE, lat: 25.033, lng: 121.564 },
      userCoords: { lat: 25.033, lng: 121.564 },
    });

    // 整張卡片是同一個 <Link>，可見文字本身就構成完整的 accessible name，
    // 2026-10 文案裁定移除了先前額外疊加的 sr-only「距離你」節點（已多餘）。
    const link = screen.getByRole('link', { name: /距離你 100 公尺內/ });
    expect(link).toBeTruthy();
    expect(screen.getByText('距離你 100 公尺內')).toBeTruthy();
  });
});

// ─── venue-list-redesign：列表卡與首頁卡共用的內容規則 ───────────────────────

type CardRenderer = (venue: Venue, tagDictionary?: typeof dictionary | null) => void;

const variants: { name: string; renderCard: CardRenderer }[] = [
  {
    name: 'VenueCard',
    renderCard: (venue, tagDictionary = dictionary) =>
      render(
        <VenueCard
          venue={venue}
          listPosition={1}
          listSort="composite"
          dictionary={tagDictionary}
          userCoords={null}
        />
      ),
  },
  {
    name: 'HomeVenueCard',
    renderCard: (venue, tagDictionary = dictionary) =>
      render(<HomeVenueCard venue={venue} listPosition={1} dictionary={tagDictionary} />),
  },
];

const stop = (type: TransitStop['type'], station: string, walkMinutes = 5): TransitStop => ({
  type,
  station,
  walkMinutes,
});
const FREE: VenueTag[] = [{ slug: 'free_venue' }];

describe.each(variants)('$name 單張封面，不標張數（VL-010、VL-011）', ({ renderCard }) => {
  it.each([
    { name: 'a：0 張 → 佔位圖，沒有 img', cover: '', others: [], imgs: 0 },
    { name: 'b：1 張 → 一張 img', cover: 'c.jpg', others: [], imgs: 1 },
    {
      name: 'c：2 張 → 一張 img',
      cover: 'c.jpg',
      others: ['o1.jpg'],
      imgs: 1,
    },
    {
      name: 'd：5 張 → 仍只有一張 img',
      cover: 'c.jpg',
      others: ['o1.jpg', 'o2.jpg', 'o3.jpg', 'o4.jpg'],
      imgs: 1,
    },
    {
      name: 'e：coverPhoto 空 → 用 otherPhotos[0]',
      cover: '',
      others: ['o1.jpg', 'o2.jpg'],
      imgs: 1,
      src: 'o1.jpg',
    },
    {
      name: 'f：otherPhotos 的空字串跳過，用下一張',
      cover: '',
      others: ['', 'o1.jpg'],
      imgs: 1,
      src: 'o1.jpg',
    },
  ])('$name', ({ cover, others, imgs, src }) => {
    renderCard({ ...BASE_VENUE, coverPhoto: cover, otherPhotos: others });

    const images = document.querySelectorAll('img');
    expect(images.length).toBe(imgs);
    if (imgs === 0) {
      expect(screen.getByText('店家尚未提供場地照片')).toBeTruthy();
    } else {
      expect(images[0].getAttribute('src')).toContain(src ?? 'c.jpg');
    }
    expect(screen.queryByText(/張照片/)).toBeNull();
  });

  it('封面載入失敗 → 不顯示破圖，其他內容照常', () => {
    renderCard({ ...BASE_VENUE, coverPhoto: 'broken.jpg' });
    const img = document.querySelector('img');
    expect(img).toBeTruthy();
    fireEvent.error(img as HTMLImageElement);

    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText('測試場地')).toBeTruthy();
  });
});

describe.each(variants)('$name 交通列的資料來源與圖示（VL-012）', ({ renderCard }) => {
  const transitText = () => screen.queryByTestId('transit-row')?.textContent ?? null;
  const hasIcon = () => screen.queryByTestId('mrt-icon') !== null;

  it('a：mrt → formatTransitHeader 的結果，有 MrtIcon', () => {
    renderCard({ ...BASE_VENUE, transitStops: [stop('mrt', '中山')] });
    expect(screen.getByText('中山站步行 5 分鐘')).toBeTruthy();
    expect(hasIcon()).toBe(true);
  });

  it('b：light_rail 有 MrtIcon', () => {
    renderCard({ ...BASE_VENUE, transitStops: [stop('light_rail', '凱旋中華', 3)] });
    expect(hasIcon()).toBe(true);
  });

  it.each([
    ['train', '基隆', '火車 基隆站・步行 5 分鐘'],
    ['hsr', '台中', '高鐵 台中・步行 5 分鐘'],
    ['bus', '復興新和街口', '公車 復興新和街口・步行 5 分鐘'],
  ] as const)('c：%s 沒有圖示，文字帶類型字', (type, station, text) => {
    renderCard({
      ...BASE_VENUE,
      transitStops: [stop(type, type === 'train' ? `${station}站` : station)],
    });
    expect(transitText()).toContain(text);
    expect(hasIcon()).toBe(false);
  });

  it('d：transitStops 為 null → 退回 nearestMrt 當捷運，有 MrtIcon', () => {
    renderCard({ ...BASE_VENUE, transitStops: null, nearestMrt: '中山站', mrtWalkMinutes: 5 });
    expect(screen.getByText('中山站步行 5 分鐘')).toBeTruthy();
    expect(hasIcon()).toBe(true);
  });

  it('d2：舊 API 回應沒有 transitStops 欄位，同樣退回 nearestMrt', () => {
    renderCard({ ...BASE_VENUE, nearestMrt: '中山站', mrtWalkMinutes: 5 });
    expect(screen.getByText('中山站步行 5 分鐘')).toBeTruthy();
  });

  it('e：transitStops 為 [] → 整列不出現，不讀 nearestMrt', () => {
    renderCard({
      ...BASE_VENUE,
      transitStops: [],
      nearestMrt: '中山站',
      mrtWalkMinutes: 5,
      capacityRange: '20-40',
    });
    expect(screen.queryByText(/中山/)).toBeNull();
    expect(screen.queryByTestId('transit-row')).toBeNull();
    expect(hasIcon()).toBe(false);
  });

  it('f：多筆時顯示捷運那筆（類型優先序）', () => {
    renderCard({
      ...BASE_VENUE,
      transitStops: [stop('bus', '復興新和街口'), stop('mrt', '中山')],
    });
    expect(screen.getByText('中山站步行 5 分鐘')).toBeTruthy();
    expect(hasIcon()).toBe(true);
  });
});

// VL-013（取代 venue-tags TC-095；R-1：捷運×距離四種組合的舊案例改成這張表）
describe('VenueCard 交通×距離×標籤×底部（VL-013）', () => {
  const venueFor = (o: { transit: boolean; tags: boolean; bottom: boolean }): Venue => ({
    ...BASE_VENUE,
    transitStops: o.transit ? [stop('mrt', '中山')] : null,
    tags: o.tags ? FREE : [],
    capacityRange: o.bottom ? '20-40' : null,
    eventCount: 0,
  });

  it.each([
    { id: 'a', transit: true, distance: true, tags: false, bottom: true, row: true, divider: true },
    {
      id: 'b',
      transit: true,
      distance: false,
      tags: false,
      bottom: true,
      row: true,
      divider: true,
    },
    {
      id: 'c',
      transit: false,
      distance: true,
      tags: false,
      bottom: true,
      row: true,
      divider: true,
    },
    {
      id: 'd',
      transit: false,
      distance: false,
      tags: true,
      bottom: true,
      row: false,
      divider: true,
    },
    {
      id: 'e',
      transit: false,
      distance: false,
      tags: false,
      bottom: true,
      row: false,
      divider: false,
    },
    {
      id: 'f',
      transit: true,
      distance: false,
      tags: true,
      bottom: false,
      row: true,
      divider: false,
    },
    {
      id: 'g',
      transit: false,
      distance: false,
      tags: false,
      bottom: false,
      row: false,
      divider: false,
    },
  ])('$id', ({ transit, distance, tags, bottom, row, divider }) => {
    render(
      <VenueCard
        venue={venueFor({ transit, tags, bottom })}
        listPosition={1}
        listSort="composite"
        dictionary={dictionary}
        userCoords={distance ? USER_COORDS : null}
      />
    );
    expect(screen.queryByTestId('transit-row') !== null).toBe(row);
    expect(screen.queryByTestId('tag-row') !== null).toBe(tags);
    expect(screen.queryByTestId('section-divider') !== null).toBe(divider);
    expect(screen.queryByTestId('bottom-row') !== null).toBe(bottom);
    expect(screen.queryByText(/約|公尺內|公里/) !== null).toBe(distance);
  });

  it('距離貼右：只有距離時交通文字不出現，距離在同一列', () => {
    render(
      <VenueCard
        venue={venueFor({ transit: false, tags: false, bottom: true })}
        listPosition={1}
        listSort="composite"
        dictionary={dictionary}
        userCoords={USER_COORDS}
      />
    );
    const row = screen.getByTestId('transit-row');
    expect(row.textContent).toMatch(/距離你/);
    expect(screen.queryByTestId('mrt-icon')).toBeNull();
  });

  it('底部只有場數時只顯示場數；只有容納人數時只顯示人數', () => {
    const { rerender } = render(
      <VenueCard
        venue={{ ...BASE_VENUE, capacityRange: null, eventCount: 3 }}
        listPosition={1}
        listSort="composite"
        dictionary={dictionary}
      />
    );
    expect(screen.getByText(/場生日應援紀錄/)).toBeTruthy();
    expect(screen.queryByText(/可容納/)).toBeNull();

    rerender(
      <VenueCard
        venue={{ ...BASE_VENUE, capacityRange: '20-40', eventCount: 0 }}
        listPosition={1}
        listSort="composite"
        dictionary={dictionary}
      />
    );
    expect(screen.getByText(/可容納/)).toBeTruthy();
    expect(screen.queryByText(/場生日應援紀錄/)).toBeNull();
  });
});

describe('HomeVenueCard 分隔線與標籤列（VL-013 首頁部分）', () => {
  it('首頁卡沒有距離文字', () => {
    render(<HomeVenueCard venue={BASE_VENUE} listPosition={1} dictionary={dictionary} />);
    expect(screen.queryByText(/公尺|公里/)).toBeNull();
  });

  it.each([
    { id: 'b', transit: true, tags: false, bottom: true, row: true, divider: true },
    { id: 'd', transit: false, tags: true, bottom: true, row: false, divider: true },
    { id: 'e', transit: false, tags: false, bottom: true, row: false, divider: false },
    { id: 'f', transit: true, tags: true, bottom: false, row: true, divider: false },
  ])('$id', ({ transit, tags, bottom, row, divider }) => {
    render(
      <HomeVenueCard
        venue={{
          ...BASE_VENUE,
          transitStops: transit ? [stop('mrt', '中山')] : null,
          tags: tags ? FREE : [],
          capacityRange: bottom ? '20-40' : null,
        }}
        listPosition={1}
        dictionary={dictionary}
      />
    );
    expect(screen.queryByTestId('transit-row') !== null).toBe(row);
    expect(screen.queryByTestId('tag-row') !== null).toBe(tags);
    expect(screen.queryByTestId('section-divider') !== null).toBe(divider);
    expect(screen.queryByTestId('bottom-row') !== null).toBe(bottom);
  });
});

describe.each(variants)(
  '$name 標籤列接線（沿用 venue-tags TC-013、TC-019、TC-036、TC-094）',
  ({ renderCard }) => {
    it('顯示字典 label、最多 3 個，不顯示 hostTags', () => {
      renderCard({
        ...BASE_VENUE,
        hostTags: ['主辦標籤'],
        tags: [
          { slug: 'free_venue' },
          { slug: 'goods_distribution' },
          { slug: 'early_setup' },
          { slug: 'beginner_friendly' },
        ],
      });
      const row = screen.getByTestId('tag-row');
      expect(row.textContent).toBe('應援物代發免場地費可提前佈展');
      expect(screen.queryByText('主辦標籤')).toBeNull();
    });

    it('沒有標籤時沒有空容器', () => {
      renderCard({ ...BASE_VENUE, tags: [] });
      expect(screen.queryByTestId('tag-row')).toBeNull();
    });

    it('字典失敗（null）→ 沒有標籤列，卡片其他內容照常', () => {
      renderCard({ ...BASE_VENUE, tags: FREE, capacityRange: '20-40' }, null);
      expect(screen.queryByTestId('tag-row')).toBeNull();
      expect(screen.getByText('測試場地')).toBeTruthy();
      expect(screen.getByText(/可容納/)).toBeTruthy();
    });
  }
);

describe.each(variants)('$name 連結與無障礙（VL-014）', ({ name, renderCard }) => {
  it('是指向詳情頁的 <a>，名稱由卡片文字組成，封面 alt 含店名', () => {
    renderCard({
      ...BASE_VENUE,
      id: 'venue-1',
      name: '小驢館',
      coverPhoto: 'c.jpg',
      tags: FREE,
      transitStops: [stop('mrt', '中山')],
    });
    const link = screen.getByRole('link', { name: /小驢館/ });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/venues/venue-1');
    expect(link.hasAttribute('tabindex')).toBe(false);
    if (name === 'HomeVenueCard') expect(link.hasAttribute('aria-label')).toBe(false);

    expect(screen.getByRole('link', { name: /免場地費/ })).toBe(link);
    expect(screen.getByRole('link', { name: /中山站步行 5 分鐘/ })).toBe(link);
    expect(document.querySelector('img')?.getAttribute('alt')).toContain('小驢館');
  });

  it('沒有封面時沒有 img', () => {
    renderCard({ ...BASE_VENUE, coverPhoto: '' });
    expect(document.querySelector('img')).toBeNull();
  });
});

describe('VenueCard 點擊與曝光（VL-015、card_tags）', () => {
  it('點卡片記下捲動位置並送一次 click_venue_detail', async () => {
    Object.defineProperty(window, 'scrollY', { value: 1234, configurable: true });
    render(
      <VenueCard venue={BASE_VENUE} listPosition={1} listSort="composite" dictionary={dictionary} />
    );
    await userEvent.click(screen.getByRole('link'));

    expect(sessionStorage.getItem('venues_scrollY')).toBe('1234');
    expect(trackClickVenueDetail).toHaveBeenCalledTimes(1);
  });

  it('曝光與點擊帶實際顯示的 card_tags（照顯示順序）', async () => {
    render(
      <VenueCard
        venue={{ ...BASE_VENUE, tags: [{ slug: 'early_setup' }, { slug: 'free_venue' }] }}
        listPosition={1}
        listSort="composite"
        dictionary={dictionary}
      />
    );
    await userEvent.click(screen.getByRole('link'));

    expect(trackViewVenueCard).toHaveBeenCalledWith(
      expect.objectContaining({ cardTags: 'free_venue,early_setup' })
    );
    expect(trackClickVenueDetail).toHaveBeenCalledWith(
      expect.objectContaining({ cardTags: 'free_venue,early_setup' })
    );
  });

  it('沒有標籤送空字串；字典失敗送 dict_error', async () => {
    const { unmount } = render(
      <VenueCard venue={BASE_VENUE} listPosition={1} listSort="composite" dictionary={dictionary} />
    );
    expect(trackViewVenueCard).toHaveBeenCalledWith(expect.objectContaining({ cardTags: '' }));
    unmount();
    sessionStorage.clear();

    render(
      <VenueCard
        venue={{ ...BASE_VENUE, tags: FREE }}
        listPosition={1}
        listSort="composite"
        dictionary={null}
      />
    );
    await userEvent.click(screen.getByRole('link'));
    expect(trackViewVenueCard).toHaveBeenLastCalledWith(
      expect.objectContaining({ cardTags: 'dict_error' })
    );
    expect(trackClickVenueDetail).toHaveBeenLastCalledWith(
      expect.objectContaining({ cardTags: 'dict_error' })
    );
  });
});

describe('HomeVenueCard 點擊與曝光', () => {
  it('不寫捲動位置；曝光與點擊帶 card_tags', async () => {
    render(
      <HomeVenueCard
        venue={{ ...BASE_VENUE, tags: FREE }}
        listPosition={2}
        dictionary={dictionary}
      />
    );
    expect(trackViewHomeVenueCard).toHaveBeenCalledWith({
      venueId: 'venue-1',
      venueRegion: '台北',
      listPosition: 2,
      cardTags: 'free_venue',
    });
    await userEvent.click(screen.getByRole('link'));
    expect(trackClickHomeVenueDetail).toHaveBeenCalledWith({
      venueId: 'venue-1',
      venueRegion: '台北',
      listPosition: 2,
      cardTags: 'free_venue',
    });
    expect(sessionStorage.getItem('venues_scrollY')).toBeNull();
  });

  it('字典失敗送 dict_error', () => {
    render(<HomeVenueCard venue={BASE_VENUE} listPosition={1} dictionary={null} />);
    expect(trackViewHomeVenueCard).toHaveBeenCalledWith(
      expect.objectContaining({ cardTags: 'dict_error' })
    );
  });
});
