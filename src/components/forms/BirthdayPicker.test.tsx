import { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BirthdayPicker from './BirthdayPicker';

// 模擬 react-hook-form 等 controlled parent：onChange 收到的值會原樣寫回 value prop，
// 用來驗證這個回寫不會反過來影響 BirthdayPicker 已經在管理的內部狀態
function ControlledBirthdayPicker({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue);
  return <BirthdayPicker value={value} onChange={setValue} />;
}

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

  it('只選月份、不選年份時，日期欄位可以點開選擇，2 月會放寬顯示到 29 日', () => {
    render(<BirthdayPicker value="" onChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: '生日月份' }));
    fireEvent.click(screen.getByRole('option', { name: '2 月' }));

    const dayButton = screen.getByRole('button', { name: '生日日期' }) as HTMLButtonElement;
    expect(dayButton.disabled).toBe(false);

    fireEvent.click(dayButton);
    expect(screen.getByRole('option', { name: '29 日' })).toBeTruthy();
  });

  it('未選年份時先選 2/29，之後才選一個平年，日期會被清空', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '生日月份' }));
    fireEvent.click(screen.getByRole('option', { name: '2 月' }));

    fireEvent.click(screen.getByRole('button', { name: '生日日期' }));
    fireEvent.click(screen.getByRole('option', { name: '29 日' }));

    fireEvent.click(screen.getByRole('button', { name: '生日年份' }));
    fireEvent.click(screen.getByRole('option', { name: '2023 年' }));

    expect(onChange).toHaveBeenLastCalledWith('');
    expect(screen.getByRole('button', { name: '生日日期' }).textContent).not.toContain('29');
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

  it('controlled parent（onChange 回寫進 value）：清空失效的日不會連帶清掉已選的年/月，也不受 value 回寫影響', () => {
    render(<ControlledBirthdayPicker initialValue="2024-02-29" />);

    expect(screen.getByRole('button', { name: '生日日期' }).textContent).toContain('29 日');

    fireEvent.click(screen.getByRole('button', { name: '生日年份' }));
    fireEvent.click(screen.getByRole('option', { name: '2023 年' }));

    // 日期因為 2023 年沒有 2/29 而被清空，但年/月要保留使用者剛選的值，不能整組被重置
    expect(screen.getByRole('button', { name: '生日年份' }).textContent).toContain('2023 年');
    expect(screen.getByRole('button', { name: '生日月份' }).textContent).toContain('2 月');
    expect(screen.getByRole('button', { name: '生日日期' }).textContent).toContain('日');
    expect(screen.getByRole('button', { name: '生日日期' }).textContent).not.toContain('29');
  });

  it('value 只作為掛載時的初始值：掛載後 value prop 改變不會回填／重置欄位', () => {
    // BirthdayPicker 刻意只在掛載當下讀一次 value（見元件內註解）。兩個實際呼叫點
    // （SubmitArtistClient、EditArtistClient）都是 existingArtist 就緒後才 mount 這個表單，
    // 不會有「同一元件實例掛載後才非同步補上生日」的情境。
    const { rerender } = render(<BirthdayPicker value="2001-04-17" onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: '生日年份' }).textContent).toContain('2001 年');

    rerender(<BirthdayPicker value="1998-12-25" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '生日年份' }).textContent).toContain('2001 年');
    expect(screen.getByRole('button', { name: '生日月份' }).textContent).toContain('4 月');
    expect(screen.getByRole('button', { name: '生日日期' }).textContent).toContain('17 日');
  });
});

// 手機版（<768px）合併觸發欄位 + bottom sheet 滾輪。桌面/手機兩種版面皆常駐掛載、
// 用 CSS media query 切換顯示，這裡不驗證 CSS 顯示與否（jsdom 不跑真實 layout），
// 只驗證邏輯層：開啟/預設置中位置/完成永遠可按/取消不變更/年月切換 reset 日/鍵盤操作。
// REAL_YEAR 用真實時間（非 mock）取得，因為 YEAR_OPTIONS 是 module 載入當下算出來的常數，
// vi.setSystemTime 無法回溯影響它，mock 的日期年份需落在這個真實範圍內才不會找不到選項。
describe('BirthdayPicker 手機版 Bottom Sheet', () => {
  const REAL_YEAR = new Date().getFullYear();
  const MOCK_TODAY = `${REAL_YEAR}-05-15`;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${MOCK_TODAY}T12:00:00`));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('未選過生日時觸發欄位顯示 placeholder，點擊後開啟 sheet 並看到三個滾輪 listbox', () => {
    render(<BirthdayPicker value="" onChange={vi.fn()} />);

    const trigger = screen.getByRole('button', { name: '生日' });
    expect(trigger.textContent).toContain('選擇生日');
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: '選擇生日' })).toBeTruthy();
    expect(screen.getByRole('listbox', { name: '選擇生日年份' })).toBeTruthy();
    expect(screen.getByRole('listbox', { name: '選擇生日月份' })).toBeTruthy();
    expect(screen.getByRole('listbox', { name: '選擇生日日期' })).toBeTruthy();
  });

  it('create mode：開啟 sheet 時三欄預設置中今天的年/月/日', () => {
    render(<BirthdayPicker value="" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '生日' }));

    const yearListbox = screen.getByRole('listbox', { name: '選擇生日年份' });
    const monthListbox = screen.getByRole('listbox', { name: '選擇生日月份' });
    const dayListbox = screen.getByRole('listbox', { name: '選擇生日日期' });

    expect(
      within(yearListbox)
        .getByRole('option', { name: `${REAL_YEAR} 年` })
        .getAttribute('aria-selected')
    ).toBe('true');
    expect(
      within(monthListbox).getByRole('option', { name: '5 月' }).getAttribute('aria-selected')
    ).toBe('true');
    expect(
      within(dayListbox).getByRole('option', { name: '15 日' }).getAttribute('aria-selected')
    ).toBe('true');
  });

  it('edit mode：開啟 sheet 時三欄預設置中既有生日', () => {
    render(<BirthdayPicker value="2001-04-17" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '生日' }));

    const yearListbox = screen.getByRole('listbox', { name: '選擇生日年份' });
    const monthListbox = screen.getByRole('listbox', { name: '選擇生日月份' });
    const dayListbox = screen.getByRole('listbox', { name: '選擇生日日期' });

    expect(
      within(yearListbox).getByRole('option', { name: '2001 年' }).getAttribute('aria-selected')
    ).toBe('true');
    expect(
      within(monthListbox).getByRole('option', { name: '4 月' }).getAttribute('aria-selected')
    ).toBe('true');
    expect(
      within(dayListbox).getByRole('option', { name: '17 日' }).getAttribute('aria-selected')
    ).toBe('true');
  });

  it('create mode：完全沒滾動就按完成，仍 emit 今天的日期（完成按鈕永遠可按）', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '生日' }));
    fireEvent.click(screen.getByRole('button', { name: '完成' }));

    expect(onChange).toHaveBeenCalledWith(MOCK_TODAY);
  });

  it('edit mode：完全沒改動就按完成，emit 原本的生日（不因為手機版而改變值）', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="2001-04-17" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '生日' }));
    fireEvent.click(screen.getByRole('button', { name: '完成' }));

    expect(onChange).toHaveBeenCalledWith('2001-04-17');
  });

  it('按取消：即使先前選了不同的值，也不會呼叫 onChange（不套用任何變更）', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="2001-04-17" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '生日' }));

    const yearListbox = screen.getByRole('listbox', { name: '選擇生日年份' });
    fireEvent.click(within(yearListbox).getByRole('option', { name: '1999 年' }));

    fireEvent.click(screen.getByRole('button', { name: '取消' }));

    expect(onChange).not.toHaveBeenCalled();
    // 觸發欄位仍顯示原本的值，沒有被草稿值污染
    expect(screen.getByRole('button', { name: '生日' }).textContent).toContain('2001/4/17');
  });

  it('切換月份後日期直接 reset 成 1 日，不是 clamp（5 月也有 17 日，但不會保留原本的 17）', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="2001-04-17" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '生日' }));

    const monthListbox = screen.getByRole('listbox', { name: '選擇生日月份' });
    fireEvent.click(within(monthListbox).getByRole('option', { name: '5 月' }));

    const dayListbox = screen.getByRole('listbox', { name: '選擇生日日期' });
    expect(
      within(dayListbox).getByRole('option', { name: '1 日' }).getAttribute('aria-selected')
    ).toBe('true');
    expect(
      within(dayListbox).queryByRole('option', { name: '17 日' })?.getAttribute('aria-selected')
    ).not.toBe('true');

    fireEvent.click(screen.getByRole('button', { name: '完成' }));
    expect(onChange).toHaveBeenCalledWith('2001-05-01');
  });

  it('切換年份後日期同樣直接 reset 成 1 日', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="2001-04-17" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '生日' }));

    const yearListbox = screen.getByRole('listbox', { name: '選擇生日年份' });
    fireEvent.click(within(yearListbox).getByRole('option', { name: '2000 年' }));

    const dayListbox = screen.getByRole('listbox', { name: '選擇生日日期' });
    expect(
      within(dayListbox).getByRole('option', { name: '1 日' }).getAttribute('aria-selected')
    ).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: '完成' }));
    expect(onChange).toHaveBeenCalledWith('2000-04-01');
  });

  it('鍵盤：年份 listbox 可以用方向鍵上下切換選項', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '生日' }));

    // YEAR_OPTIONS 由 1950 遞增排列，前一年在陣列中排在更前面（listbox 更上方），
    // 往「上一個選項」（ArrowUp）走才會到前一年
    const yearListbox = screen.getByRole('listbox', { name: '選擇生日年份' });
    fireEvent.keyDown(yearListbox, { key: 'ArrowUp' });

    expect(
      within(yearListbox)
        .getByRole('option', { name: `${REAL_YEAR - 1} 年` })
        .getAttribute('aria-selected')
    ).toBe('true');

    // 切年份跟切月份一樣會把日 reset 成 1（見 reset 行為測試），這裡只驗證年份本身有正確切換
    fireEvent.click(screen.getByRole('button', { name: '完成' }));
    expect(onChange).toHaveBeenCalledWith(`${REAL_YEAR - 1}-05-01`);
  });

  it('鍵盤：月份與日期 listbox 也可以用方向鍵切換選項', () => {
    const onChange = vi.fn();
    render(<BirthdayPicker value="2001-04-17" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: '生日' }));

    const monthListbox = screen.getByRole('listbox', { name: '選擇生日月份' });
    fireEvent.keyDown(monthListbox, { key: 'ArrowDown' });
    expect(
      within(monthListbox).getByRole('option', { name: '5 月' }).getAttribute('aria-selected')
    ).toBe('true');

    const dayListbox = screen.getByRole('listbox', { name: '選擇生日日期' });
    fireEvent.keyDown(dayListbox, { key: 'ArrowDown' });
    // 切月已經把日 reset 成 1 日，再往下一格會是 2 日
    expect(
      within(dayListbox).getByRole('option', { name: '2 日' }).getAttribute('aria-selected')
    ).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: '完成' }));
    expect(onChange).toHaveBeenCalledWith('2001-05-02');
  });

  it('按取消後，focus 回到觸發生日 sheet 的按鈕（不留在畫面外的隱藏內容裡）', () => {
    render(<BirthdayPicker value="2001-04-17" onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: '生日' });

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: '取消' }));

    expect(document.activeElement).toBe(trigger);
  });

  it('按完成後，focus 也回到觸發按鈕', () => {
    render(<BirthdayPicker value="2001-04-17" onChange={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: '生日' });

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: '完成' }));

    expect(document.activeElement).toBe(trigger);
  });
});
