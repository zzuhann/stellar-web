import { describe, it, expect } from 'vitest';
import { splitSocialAccounts, joinSocialAccounts } from './socialAccounts';

describe('splitSocialAccounts', () => {
  it('空字串回傳單一空白列，確保畫面至少顯示一列輸入框', () => {
    expect(splitSocialAccounts('')).toEqual(['']);
  });

  it('單一帳號回傳單一元素陣列', () => {
    expect(splitSocialAccounts('stellar_tw')).toEqual(['stellar_tw']);
  });

  it('逗號分隔多帳號（無空白）正確拆分', () => {
    expect(splitSocialAccounts('stellar_tw,stellar_jp')).toEqual(['stellar_tw', 'stellar_jp']);
  });

  it('逗號+空格分隔多帳號正確拆分', () => {
    expect(splitSocialAccounts('stellar_tw, stellar_jp')).toEqual(['stellar_tw', 'stellar_jp']);
  });

  it('每個帳號前後多餘空白會被 trim', () => {
    expect(splitSocialAccounts('  stellar_tw  ,  stellar_jp  ')).toEqual([
      'stellar_tw',
      'stellar_jp',
    ]);
  });

  it('連續逗號或結尾逗號造成的空值會被過濾掉', () => {
    expect(splitSocialAccounts('stellar_tw,,stellar_jp,')).toEqual(['stellar_tw', 'stellar_jp']);
  });

  it('全部都是空值時（例如只有逗號）回傳單一空白列', () => {
    expect(splitSocialAccounts(',,')).toEqual(['']);
  });
});

describe('joinSocialAccounts', () => {
  it('多筆輸入 join 成逗號+空格分隔字串', () => {
    expect(joinSocialAccounts(['stellar_tw', 'stellar_jp'])).toBe('stellar_tw, stellar_jp');
  });

  it('中間夾雜空字串的列會被過濾，不會產生 "a, , b" 這種夾空值結果', () => {
    expect(joinSocialAccounts(['stellar_tw', '', 'stellar_jp'])).toBe('stellar_tw, stellar_jp');
  });

  it('每個值 join 前會先 trim', () => {
    expect(joinSocialAccounts(['  stellar_tw  ', '  stellar_jp  '])).toBe('stellar_tw, stellar_jp');
  });

  it('單一空白列 join 回空字串（使用者新增列但沒填、或刪除到只剩空列）', () => {
    expect(joinSocialAccounts([''])).toBe('');
  });

  it('空陣列 join 回空字串', () => {
    expect(joinSocialAccounts([])).toBe('');
  });
});

describe('split/join 往返穩定性（既有逗號字串 → 拆列顯示 → 使用者不改動 → 再 join 回去）', () => {
  it('既有資料為逗號+空格格式時，往返後格式不變', () => {
    const raw = 'stellar_tw, stellar_jp';
    expect(joinSocialAccounts(splitSocialAccounts(raw))).toBe(raw);
  });

  it('既有資料為純逗號（無空格）格式時，往返後正規化為逗號+空格，且再次往返結果穩定', () => {
    const raw = 'stellar_tw,stellar_jp';
    const once = joinSocialAccounts(splitSocialAccounts(raw));
    expect(once).toBe('stellar_tw, stellar_jp');
    const twice = joinSocialAccounts(splitSocialAccounts(once));
    expect(twice).toBe(once);
  });

  it('單一帳號往返後不變', () => {
    const raw = 'stellar_tw';
    expect(joinSocialAccounts(splitSocialAccounts(raw))).toBe(raw);
  });

  it('空字串往返後仍為空字串', () => {
    expect(joinSocialAccounts(splitSocialAccounts(''))).toBe('');
  });
});
