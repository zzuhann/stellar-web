import { useRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ScrollProgressBarClient from './ScrollProgressBarClient';

afterEach(cleanup);

// jsdom has no layout: scroll metrics are set on the scroller by hand
const setMetrics = (el: HTMLElement, scrollLeft: number) => {
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: 400 });
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: 1200 });
  Object.defineProperty(el, 'scrollLeft', { configurable: true, value: scrollLeft });
};

function Harness({ initialScroll }: { initialScroll: number }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        data-testid="scroller"
        ref={(el) => {
          if (el) setMetrics(el, initialScroll);
          ref.current = el;
        }}
      />
      <ScrollProgressBarClient scrollRef={ref} contentKey={1} visible />
    </>
  );
}

const fill = (container: HTMLElement) =>
  (container.querySelector('[aria-hidden="true"] > div') as HTMLElement).style.transform;

describe('ScrollProgressBarClient', () => {
  it('掛載時就畫出目前比例，捲動時即時更新，捲到底填滿', () => {
    const { container } = render(<Harness initialScroll={0} />);
    expect(fill(container)).toBe(`scaleX(${400 / 1200})`);

    const scroller = screen.getByTestId('scroller');
    setMetrics(scroller, 400);
    fireEvent.scroll(scroller);
    expect(fill(container)).toBe(`scaleX(${800 / 1200})`);

    setMetrics(scroller, 800);
    fireEvent.scroll(scroller);
    expect(fill(container)).toBe('scaleX(1)');
  });

  it('可見比例很小時至少填 8%', () => {
    const { container } = render(<Harness initialScroll={0} />);
    const scroller = screen.getByTestId('scroller');
    Object.defineProperty(scroller, 'scrollWidth', { configurable: true, value: 40000 });
    fireEvent.scroll(scroller);
    expect(fill(container)).toBe('scaleX(0.08)');
  });
});
