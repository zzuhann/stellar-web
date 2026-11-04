import { describe, expect, it } from 'vitest';
import { itemsOverflow, scrollProgress } from './useHorizontalScroll';

// Minimal stand-ins: jsdom has no layout, so the measured numbers are supplied directly
const track = (
  clientWidth: number,
  scrollLeft: number,
  itemRights: number[],
  spacerRight?: number
) => {
  const item = (right: number) => ({ getBoundingClientRect: () => ({ right }) });
  const items = itemRights.map(item);
  const children = spacerRight === undefined ? items : [...items, item(spacerRight)];
  return {
    clientWidth,
    scrollLeft,
    children,
    getBoundingClientRect: () => ({ left: 0 }),
    querySelectorAll: () => items,
  } as unknown as HTMLElement;
};

describe('itemsOverflow', () => {
  it('最後一張卡的右緣在可見寬度內 → 不算超出，右側 spacer 不算', () => {
    expect(itemsOverflow('[role="listitem"]')(track(600, 0, [196, 386, 576], 592))).toBe(false);
  });

  it('最後一張卡超出可見寬度 → 超出', () => {
    expect(itemsOverflow()(track(400, 0, [196, 386, 576]))).toBe(true);
  });

  it('捲到底時仍算超出（右緣加回 scrollLeft）', () => {
    expect(itemsOverflow()(track(400, 176, [20, 210, 400]))).toBe(true);
  });

  it('沒有項目 → 不算超出', () => {
    expect(itemsOverflow()(track(400, 0, []))).toBe(false);
  });
});

describe('scrollProgress', () => {
  const el = (scrollLeft: number, clientWidth: number, scrollWidth: number) =>
    ({ scrollLeft, clientWidth, scrollWidth }) as HTMLElement;

  it('開頭是可見比例，捲到底是 1，四捨五入到小數兩位', () => {
    expect(scrollProgress(el(0, 400, 1200))).toBe(0.33);
    expect(scrollProgress(el(800, 400, 1200))).toBe(1);
  });

  it('沒有內容（scrollWidth 0）→ 1', () => {
    expect(scrollProgress(el(0, 0, 0))).toBe(1);
  });
});
