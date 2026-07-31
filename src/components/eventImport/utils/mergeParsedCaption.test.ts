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
};

const location = {
  name: '測試咖啡廳',
  address: '台北市測試路 1 號',
  city: '台北市',
  coordinates: { lat: 25.03, lng: 121.56 },
  placeId: 'place-1',
};

describe('mergeParsedCaptionIntoForm', () => {
  it('只填目前為空的欄位；description 帶入的是貼上的文案原文，不是 Gemini 抽出的欄位', () => {
    const parsed: ParsedCaptionData = {
      ...emptyParsed,
      title: '生日應援活動',
      eventDateStart: '2026-08-01',
      eventDateEnd: '2026-08-02',
      location,
      socialMedia: { instagram: 'stellar_tw', threads: '_stellar_tw' },
    };
    const rawCaption = '生日應援活動🎂\n消費飲品即可兌換小卡，數量有限';

    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(
      emptySnapshot,
      parsed,
      rawCaption
    );

    expect(updates).toEqual({
      title: '生日應援活動',
      startDate: '2026-08-01',
      endDate: '2026-08-02',
      location,
      instagram: 'stellar_tw',
      threads: '_stellar_tw',
      description: rawCaption,
    });
    expect(filledFieldLabels).toEqual(['標題', '開始日期', '結束日期', '地點', '社群帳號', '描述']);
  });

  it('description 是文案原文整段、一字不差（保留換行、表情符號等原始字元）', () => {
    const rawCaption = '  第一行\n第二行 emoji 🎉  \t尾端有空白  ';
    const { updates } = mergeParsedCaptionIntoForm(emptySnapshot, emptyParsed, rawCaption);
    expect(updates.description).toBe(rawCaption);
  });

  it('即使 Gemini 完全沒抽到任何欄位，description 仍會被文案原文帶入（不受其他欄位解析結果影響）', () => {
    const rawCaption = '這段文字很破碎看不出活動資訊';
    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(
      emptySnapshot,
      emptyParsed,
      rawCaption
    );
    expect(updates).toEqual({ description: rawCaption });
    expect(filledFieldLabels).toEqual(['描述']);
  });

  it('已有值的欄位不被覆蓋（即使解析出不同的值，description 也不會被文案覆蓋）', () => {
    const current: ImportFormSnapshot = {
      ...emptySnapshot,
      title: '管理員已填的標題',
      startDate: '2026-08-05',
      addressName: '管理員已選的地點',
      instagram: 'existing_ig',
      description: '管理員已寫的說明',
    };
    const parsed: ParsedCaptionData = {
      ...emptyParsed,
      title: '文案解析出的不同標題',
      eventDateStart: '2026-08-01',
      location,
      socialMedia: { instagram: 'parsed_ig', threads: 'parsed_threads' },
    };

    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(
      current,
      parsed,
      '這次貼的文案原文'
    );

    // title/startDate/location/instagram/description 皆已有值，維持原樣；
    // 只有 threads 是空的會被填入
    expect(updates).toEqual({ threads: 'parsed_threads' });
    expect(filledFieldLabels).toEqual(['社群帳號']);
  });

  it('解析結果全部為 null 且沒有文案原文時，不產生任何 updates', () => {
    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(
      emptySnapshot,
      emptyParsed,
      ''
    );
    expect(updates).toEqual({});
    expect(filledFieldLabels).toEqual([]);
  });

  it('socialMedia 只有其中一個帳號有值時，只填該欄位，仍算一次「社群帳號」', () => {
    const parsed: ParsedCaptionData = {
      ...emptyParsed,
      socialMedia: { threads: 'only_threads' },
    };
    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(emptySnapshot, parsed, '');
    expect(updates).toEqual({ threads: 'only_threads' });
    expect(filledFieldLabels).toEqual(['社群帳號']);
  });

  it('addressName 已有值時，即使解析出地點也不套用', () => {
    const current: ImportFormSnapshot = { ...emptySnapshot, addressName: '已選好的店' };
    const parsed: ParsedCaptionData = { ...emptyParsed, location };
    const { updates, filledFieldLabels } = mergeParsedCaptionIntoForm(current, parsed, '');
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
