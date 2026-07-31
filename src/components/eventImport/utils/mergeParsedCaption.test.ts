import { describe, it, expect } from 'vitest';
import {
  mergeParsedCaptionIntoForm,
  buildParsedFieldsToastMessage,
  ImportFormSnapshot,
} from './mergeParsedCaption';
import { ParsedCaptionData } from '@/types';

const emptySnapshot: ImportFormSnapshot = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  addressName: '',
  instagram: '',
  threads: '',
};

const emptyParsed: ParsedCaptionData = {
  title: null,
  artistName: null,
  eventDateStart: null,
  eventDateEnd: null,
  location: null,
  socialMedia: null,
  redemptionCondition: null,
};

const location = {
  name: '測試咖啡廳',
  address: '台北市測試路 1 號',
  city: '台北市',
  coordinates: { lat: 25.03, lng: 121.56 },
  placeId: 'place-1',
};

describe('mergeParsedCaptionIntoForm', () => {
  it('只填目前為空的欄位', () => {
    const parsed: ParsedCaptionData = {
      ...emptyParsed,
      title: '生日應援活動',
      eventDateStart: '2026-08-01',
      eventDateEnd: '2026-08-02',
      location,
      socialMedia: { instagram: 'stellar_tw', threads: '_stellar_tw' },
      redemptionCondition: '消費飲品即可兌換小卡',
    };

    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(emptySnapshot, parsed);

    expect(updates).toEqual({
      title: '生日應援活動',
      startDate: '2026-08-01',
      endDate: '2026-08-02',
      location,
      instagram: 'stellar_tw',
      threads: '_stellar_tw',
      description: '消費飲品即可兌換小卡',
    });
    expect(filledFieldLabels).toEqual([
      '標題',
      '開始日期',
      '結束日期',
      '地點',
      '社群帳號',
      '領取條件',
    ]);
  });

  it('已有值的欄位不被覆蓋（即使解析出不同的值）', () => {
    const current: ImportFormSnapshot = {
      ...emptySnapshot,
      title: '管理員已填的標題',
      startDate: '2026-08-05',
      addressName: '管理員已選的地點',
      instagram: 'existing_ig',
    };
    const parsed: ParsedCaptionData = {
      ...emptyParsed,
      title: '文案解析出的不同標題',
      eventDateStart: '2026-08-01',
      location,
      socialMedia: { instagram: 'parsed_ig', threads: 'parsed_threads' },
    };

    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(current, parsed);

    // title/startDate/location/instagram 皆已有值，維持原樣；只有 threads 是空的會被填入
    expect(updates).toEqual({ threads: 'parsed_threads' });
    expect(filledFieldLabels).toEqual(['社群帳號']);
  });

  it('解析結果全部為 null 時，不產生任何 updates', () => {
    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(emptySnapshot, emptyParsed);
    expect(updates).toEqual({});
    expect(filledFieldLabels).toEqual([]);
  });

  it('socialMedia 只有其中一個帳號有值時，只填該欄位，仍算一次「社群帳號」', () => {
    const parsed: ParsedCaptionData = {
      ...emptyParsed,
      socialMedia: { threads: 'only_threads' },
    };
    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(emptySnapshot, parsed);
    expect(updates).toEqual({ threads: 'only_threads' });
    expect(filledFieldLabels).toEqual(['社群帳號']);
  });

  it('redemptionCondition 不會覆蓋已填寫的 description', () => {
    const current: ImportFormSnapshot = { ...emptySnapshot, description: '管理員已寫的說明' };
    const parsed: ParsedCaptionData = { ...emptyParsed, redemptionCondition: '兌換小卡' };
    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(current, parsed);
    expect(updates).toEqual({});
    expect(filledFieldLabels).toEqual([]);
  });

  it('addressName 已有值時，即使解析出地點也不套用', () => {
    const current: ImportFormSnapshot = { ...emptySnapshot, addressName: '已選好的店' };
    const parsed: ParsedCaptionData = { ...emptyParsed, location };
    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(current, parsed);
    expect(updates.location).toBeUndefined();
    expect(filledFieldLabels).not.toContain('地點');
  });
});

describe('buildParsedFieldsToastMessage', () => {
  it('沒有任何欄位被填入時，顯示提示訊息', () => {
    expect(buildParsedFieldsToastMessage([])).toBe(
      '這次文案解析沒有新增欄位內容（可能欄位已有值，或這篇文案取得的資訊有限）'
    );
  });

  it('有欄位被填入時，列出這次新增的欄位', () => {
    expect(buildParsedFieldsToastMessage(['地點', '社群帳號'])).toBe(
      '已從文案解析帶入：地點、社群帳號'
    );
  });
});
