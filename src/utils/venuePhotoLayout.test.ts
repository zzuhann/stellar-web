import { describe, expect, it } from 'vitest';
import { getDesktopPhotoLayout, getPhotoFit } from './venuePhotoLayout';

describe('TC-145 桌機照片版面 getDesktopPhotoLayout', () => {
  it('0 張 → null（不出現格子）', () => {
    expect(getDesktopPhotoLayout(0)).toBeNull();
  });

  it.each([
    {
      count: 1,
      height: 360,
      columns: '1fr',
      rows: '1fr',
      cells: [{ column: '1', row: '1' }],
    },
    {
      count: 2,
      height: 400,
      columns: '1fr 1fr',
      rows: '1fr',
      cells: [
        { column: '1', row: '1' },
        { column: '2', row: '1' },
      ],
    },
    {
      count: 3,
      height: 400,
      columns: '3fr 2fr',
      rows: '1fr 1fr',
      cells: [
        { column: '1', row: '1 / span 2' },
        { column: '2', row: '1' },
        { column: '2', row: '2' },
      ],
    },
    {
      count: 4,
      height: 400,
      columns: '3fr 1fr 1fr',
      rows: '1fr 1fr',
      cells: [
        { column: '1', row: '1 / span 2' },
        { column: '2 / span 2', row: '1' },
        { column: '2', row: '2' },
        { column: '3', row: '2' },
      ],
    },
  ])('$count 張 → 對應格子排法', ({ count, ...expected }) => {
    expect(getDesktopPhotoLayout(count)).toEqual({ ...expected, showAllCount: null });
  });

  const FIVE_CELLS = [
    { column: '1', row: '1 / span 2' },
    { column: '2', row: '1' },
    { column: '3', row: '1' },
    { column: '2', row: '2' },
    { column: '3', row: '2' },
  ];

  it.each([5, 6, 7])('%i 張 → 左大圖＋右側四格（3fr 2fr 2fr），只取前 5 張', (count) => {
    const layout = getDesktopPhotoLayout(count);
    expect(layout).toMatchObject({ height: 400, columns: '3fr 2fr 2fr', rows: '1fr 1fr' });
    expect(layout?.cells).toEqual(FIVE_CELLS);
  });

  it.each([2, 3, 4, 5, 6, 7])('%i 張：第一張（封面）在最大那格（2 張時兩格一樣大）', (count) => {
    const layout = getDesktopPhotoLayout(count);
    if (!layout) throw new Error('expected a layout');
    const weights = (template: string) => template.split(' ').map((fr) => parseFloat(fr));
    // "2 / span 2" → tracks 2..3; "1" → track 1
    const size = (placement: string, w: number[]) => {
      const [start, span] = placement.split(' / span ').map(Number);
      return w.slice(start - 1, start - 1 + (span || 1)).reduce((a, b) => a + b, 0);
    };
    const [colW, rowW] = [weights(layout.columns), weights(layout.rows)];
    const areas = layout.cells.map((c) => size(c.column, colW) * size(c.row, rowW));
    const [cover, ...rest] = areas;
    if (count === 2) expect(rest).toEqual([cover]);
    else expect(rest.every((a) => a < cover)).toBe(true);
  });

  it('5 張沒有「查看全部」；6、7 張有，數字是總張數', () => {
    expect(getDesktopPhotoLayout(5)?.showAllCount).toBeNull();
    expect(getDesktopPhotoLayout(6)?.showAllCount).toBe(6);
    expect(getDesktopPhotoLayout(7)?.showAllCount).toBe(7);
  });
});

describe('TC-145 填滿或完整顯示 getPhotoFit', () => {
  const landscape = { width: 1600, height: 900 };
  const portrait = { width: 900, height: 1600 };
  const square = { width: 1080, height: 1080 };
  const wideCell = { width: 560, height: 400 };
  const tallCell = { width: 180, height: 196 };

  it.each([
    ['橫照放橫格', landscape, wideCell, 'cover'],
    ['直照放直格', portrait, tallCell, 'cover'],
    ['直照放橫格', portrait, wideCell, 'contain'],
    ['橫照放直格', landscape, tallCell, 'contain'],
    ['正方形照片放橫格（當成同方向）', square, wideCell, 'cover'],
    ['正方形照片放直格（當成同方向）', square, tallCell, 'cover'],
    ['還沒讀到照片寬高 → 先填滿', null, wideCell, 'cover'],
    ['還沒量到格子大小 → 先填滿', portrait, null, 'cover'],
    ['格子是 0×0（還沒排版或被隱藏）→ 先填滿', portrait, { width: 0, height: 0 }, 'cover'],
    [
      '接近正方形 1080×1081 放橫格（差 1px 不算直照）',
      { width: 1080, height: 1081 },
      wideCell,
      'cover',
    ],
    [
      '接近正方形 1081×1080 放直格（差 1px 不算橫照）',
      { width: 1081, height: 1080 },
      tallCell,
      'cover',
    ],
    [
      '寬高比差 5% 以內（1080×1134）放橫格 → 當成正方形',
      { width: 1080, height: 1134 },
      wideCell,
      'cover',
    ],
    [
      '寬高比差超過 5%（1080×1150）放橫格 → 直照，完整顯示',
      { width: 1080, height: 1150 },
      wideCell,
      'contain',
    ],
    [
      '格子接近正方形（398×400）放橫照 → 當成同方向',
      landscape,
      { width: 398, height: 400 },
      'cover',
    ],
    [
      '格子接近正方形（400×398）放直照 → 當成同方向',
      portrait,
      { width: 400, height: 398 },
      'cover',
    ],
  ] as const)('%s → %s', (_, photo, cell, fit) => {
    expect(getPhotoFit(photo, cell)).toBe(fit);
  });
});
