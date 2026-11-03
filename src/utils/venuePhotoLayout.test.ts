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

describe('TC-145 填滿或完整顯示 getPhotoFit（最多裁 20%）', () => {
  const cell = { width: 1600, height: 900 };
  const smallCell = { width: 315, height: 196 };

  it.each([
    ['比例完全一樣', { width: 1600, height: 900 }, cell, 'cover'],
    ['手機 4:3 照片放右側小格（裁約 17%）', { width: 800, height: 600 }, smallCell, 'cover'],
    ['剛好裁 20%（1600×1125 放 16:9）', { width: 1600, height: 1125 }, cell, 'cover'],
    ['裁超過 20%（1600×1140 放 16:9）', { width: 1600, height: 1140 }, cell, 'contain'],
    [
      '比格子寬也一樣算（2200×1000 放 16:9，裁約 19%）',
      { width: 2200, height: 1000 },
      cell,
      'cover',
    ],
    ['正方形照片放右側小格', { width: 800, height: 800 }, smallCell, 'contain'],
    [
      '正方形 logo 放 1 張的整寬格（1120×360）',
      { width: 1080, height: 1080 },
      { width: 1120, height: 360 },
      'contain',
    ],
    ['直照放橫格', { width: 900, height: 1600 }, cell, 'contain'],
    ['還沒讀到照片寬高 → 先填滿', null, cell, 'cover'],
    ['還沒量到格子大小 → 先填滿', { width: 900, height: 1600 }, null, 'cover'],
    [
      '格子是 0×0（還沒排版或被隱藏）→ 先填滿',
      { width: 900, height: 1600 },
      { width: 0, height: 0 },
      'cover',
    ],
  ] as const)('%s → %s', (_, photo, size, fit) => {
    expect(getPhotoFit(photo, size)).toBe(fit);
  });
});
