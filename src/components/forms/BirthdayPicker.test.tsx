import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BirthdayPicker from './BirthdayPicker';

// jsdom 未實作 scrollIntoView，年份選單開啟時會呼叫到，測試前手動補上
beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

describe('BirthdayPicker', () => {
  it('初始為空值時，年月日三個欄位都顯示 placeholder，且日期欄位 disabled', () => {
    render(<BirthdayPicker value="" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '生日年份' }).textContent).toContain('年');
    expect(screen.getByRole('button', { name: '生日月份' }).textContent).toContain('月');
    const dayButton = screen.getByRole('button', { name: '生日日期' }) as HTMLButtonElement;
    expect(dayButton.textContent).toContain('日');
    expect(dayButton.disabled).toBe(true);
  });

  it('只選年份，尚未選滿三者時，onChange 收到空字串（無法組成完整日期）', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '生日年份' }));
    fireEvent.click(screen.getByRole('option', { name: '2000 年' }));

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('依序選完年、月、日後，onChange 收到 YYYY-MM-DD 格式字串', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '生日年份' }));
    fireEvent.click(screen.getByRole('option', { name: '2000 年' }));

    fireEvent.click(screen.getByRole('button', { name: '生日月份' }));
    fireEvent.click(screen.getByRole('option', { name: '4 月' }));

    fireEvent.click(screen.getByRole('button', { name: '生日日期' }));
    fireEvent.click(screen.getByRole('option', { name: '17 日' }));

    expect(onChange).toHaveBeenLastCalledWith('2000-04-17');
  });

  it('閏年（2024）2 月可以選到 29 日', () => {
    render(<BirthdayPicker value="" onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '生日年份' }));
    fireEvent.click(screen.getByRole('option', { name: '2024 年' }));

    fireEvent.click(screen.getByRole('button', { name: '生日月份' }));
    fireEvent.click(screen.getByRole('option', { name: '2 月' }));

    fireEvent.click(screen.getByRole('button', { name: '生日日期' }));
    expect(screen.getByRole('option', { name: '29 日' })).toBeTruthy();
  });

  it('平年（2023）2 月不能選 29 日', () => {
    render(<BirthdayPicker value="" onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '生日年份' }));
    fireEvent.click(screen.getByRole('option', { name: '2023 年' }));

    fireEvent.click(screen.getByRole('button', { name: '生日月份' }));
    fireEvent.click(screen.getByRole('option', { name: '2 月' }));

    fireEvent.click(screen.getByRole('button', { name: '生日日期' }));
    expect(screen.queryByRole('option', { name: '29 日' })).toBeNull();
    expect(screen.getByRole('option', { name: '28 日' })).toBeTruthy();
  });

  it('已選閏年 2/29 後，把年份切成平年，日期會被清空（不留不存在的日期）', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="2024-02-29" onChange={onChange} />);

    expect(screen.getByRole('button', { name: '生日日期' }).textContent).toContain('29 日');

    fireEvent.click(screen.getByRole('button', { name: '生日年份' }));
    fireEvent.click(screen.getByRole('option', { name: '2023 年' }));

    expect(onChange).toHaveBeenLastCalledWith('');
    expect(screen.getByRole('button', { name: '生日日期' }).textContent).toContain('日');
    expect(screen.getByRole('button', { name: '生日日期' }).textContent).not.toContain('29');
  });

  it('edit mode：value 帶入既有生日字串時，正確拆解回填三個欄位', () => {
    render(<BirthdayPicker value="2001-04-17" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '生日年份' }).textContent).toContain('2001 年');
    expect(screen.getByRole('button', { name: '生日月份' }).textContent).toContain('4 月');
    expect(screen.getByRole('button', { name: '生日日期' }).textContent).toContain('17 日');
  });

  it('edit mode：value 是非同步帶入（初始為空，之後才更新）時也能正確回填', () => {
    const { rerender } = render(<BirthdayPicker value="" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '生日年份' }).textContent).toContain('年');

    rerender(<BirthdayPicker value="1998-12-25" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '生日年份' }).textContent).toContain('1998 年');
    expect(screen.getByRole('button', { name: '生日月份' }).textContent).toContain('12 月');
    expect(screen.getByRole('button', { name: '生日日期' }).textContent).toContain('25 日');
  });
});
