import { describe, it, expect } from 'vitest';
import { cleanSocialMediaHandle, parseSocialMediaHandles } from './socialMedia';

describe('cleanSocialMediaHandle', () => {
  it('移除開頭的 @ 符號', () => {
    const result = cleanSocialMediaHandle('@username');
    expect(result).toBe('username');
  });

  it('不修改沒有 @ 的帳號', () => {
    const result = cleanSocialMediaHandle('username');
    expect(result).toBe('username');
  });

  it('只移除開頭的 @，不影響中間的 @', () => {
    const result = cleanSocialMediaHandle('@user@name');
    expect(result).toBe('user@name');
  });

  it('處理空字串', () => {
    const result = cleanSocialMediaHandle('');
    expect(result).toBe('');
  });
});

describe('parseSocialMediaHandles', () => {
  it('單一帳號（無 @）', () => {
    const result = parseSocialMediaHandles('username');
    expect(result).toEqual(['username']);
  });

  it('單一帳號（有 @）', () => {
    const result = parseSocialMediaHandles('@username');
    expect(result).toEqual(['username']);
  });

  it('多個帳號：逗號後有空格', () => {
    const result = parseSocialMediaHandles('account1, account2');
    expect(result).toEqual(['account1', 'account2']);
  });

  it('多個帳號：逗號後無空格', () => {
    const result = parseSocialMediaHandles('account1,account2');
    expect(result).toEqual(['account1', 'account2']);
  });

  it('多個帳號（有 @）：逗號後有空格', () => {
    const result = parseSocialMediaHandles('@account1, @account2');
    expect(result).toEqual(['account1', 'account2']);
  });

  it('多個帳號（有 @）：逗號後無空格', () => {
    const result = parseSocialMediaHandles('@account1,@account2');
    expect(result).toEqual(['account1', 'account2']);
  });

  it('多個帳號混合有無 @', () => {
    const result = parseSocialMediaHandles('@account1, account2, @account3');
    expect(result).toEqual(['account1', 'account2', 'account3']);
  });

  it('處理前後有多餘空格的情況', () => {
    const result = parseSocialMediaHandles('  account1  ,  account2  ');
    expect(result).toEqual(['account1', 'account2']);
  });

  it('三個以上的帳號', () => {
    const result = parseSocialMediaHandles('user1, user2, user3, user4');
    expect(result).toEqual(['user1', 'user2', 'user3', 'user4']);
  });

  it('過濾掉空字串（連續逗號）', () => {
    const result = parseSocialMediaHandles('account1,,account2');
    expect(result).toEqual(['account1', 'account2']);
  });

  it('過濾掉空字串（開頭或結尾有逗號）', () => {
    const result = parseSocialMediaHandles(',account1,account2,');
    expect(result).toEqual(['account1', 'account2']);
  });
});
