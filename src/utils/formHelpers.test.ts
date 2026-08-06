import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrollToFirstErrorField } from './formHelpers';

// jsdom 未實作 scrollIntoView，測試前手動補上
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

const createContainer = (innerHTML: string): HTMLDivElement => {
  const div = document.createElement('div');
  div.innerHTML = innerHTML;
  document.body.appendChild(div);
  return div;
};

describe('scrollToFirstErrorField', () => {
  it('依 fieldOrder 順序找到第一個有錯誤的欄位並捲動', () => {
    const titleContainer = createContainer('<input type="text" />');
    const addressContainer = createContainer('<input type="text" />');

    scrollToFirstErrorField(
      ['title', 'addressName'],
      (name) => name === 'title' || name === 'addressName',
      { title: titleContainer, addressName: addressContainer }
    );

    // scrollIntoView 是共用 mock，用呼叫次數確認只有第一個錯誤欄位觸發捲動
    expect(addressContainer.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(addressContainer.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
  });

  it('容器內第一個可聚焦元素會被 focus（略過 hidden input）', () => {
    const container = createContainer(
      '<input type="hidden" /><input type="text" data-testid="visible" />'
    );
    const focusSpy = vi.spyOn(
      container.querySelector('[data-testid="visible"]') as HTMLElement,
      'focus'
    );

    scrollToFirstErrorField(['reservationTime'], () => true, { reservationTime: container });

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('沒有任何欄位有錯誤時不做任何事', () => {
    const container = createContainer('<input type="text" />');

    scrollToFirstErrorField(['title'], () => false, { title: container });

    expect(container.scrollIntoView).not.toHaveBeenCalled();
  });

  it('有錯誤但找不到對應容器 ref 時不拋出例外', () => {
    expect(() => {
      scrollToFirstErrorField(['title'], () => true, {});
    }).not.toThrow();
  });
});
