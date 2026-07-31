import { ParsedCaptionData, ParsedCaptionLocation } from '@/types';

// 目前表單狀態的快照：只列出「文案解析可能帶入」的欄位，且統一用字串/物件表示，
// 讓這個 function 保持 pure、不依賴 react-hook-form 或任何 UI 框架，方便單元測試。
export interface ImportFormSnapshot {
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  addressName: string; // 地點名稱，作為「地點欄位是否已填」的判斷依據
  instagram: string;
  threads: string;
}

export interface ImportFormUpdates {
  title?: string;
  description?: string; // 承接 redemptionCondition（見 design-backend.md：由前端決定放哪）
  startDate?: string;
  endDate?: string;
  location?: ParsedCaptionLocation;
  instagram?: string;
  threads?: string;
}

export interface MergeParsedCaptionResult {
  updates: ImportFormUpdates;
  filledFieldLabels: string[];
}

function isEmptyValue(value: string): boolean {
  return !value || value.trim() === '';
}

/**
 * 多篇貼文合併規則（requirements.md）：只填目前為空的欄位，已有值的欄位一律不覆蓋。
 * 呼叫端必須傳入「回應當下」的表單快照（不是發送請求當下），對應 design-frontend.md
 * 〈Edge Cases〉：解析請求還在進行中、管理員手動編輯了某個欄位時，以回應當下為準。
 */
export function mergeParsedCaptionIntoForm(
  current: ImportFormSnapshot,
  parsed: ParsedCaptionData
): MergeParsedCaptionResult {
  const updates: ImportFormUpdates = {};
  const filledFieldLabels: string[] = [];

  if (isEmptyValue(current.title) && parsed.title) {
    updates.title = parsed.title;
    filledFieldLabels.push('標題');
  }

  if (isEmptyValue(current.startDate) && parsed.eventDateStart) {
    updates.startDate = parsed.eventDateStart;
    filledFieldLabels.push('開始日期');
  }

  if (isEmptyValue(current.endDate) && parsed.eventDateEnd) {
    updates.endDate = parsed.eventDateEnd;
    filledFieldLabels.push('結束日期');
  }

  if (isEmptyValue(current.addressName) && parsed.location) {
    updates.location = parsed.location;
    filledFieldLabels.push('地點');
  }

  if (parsed.socialMedia) {
    const fillsInstagram = isEmptyValue(current.instagram) && !!parsed.socialMedia.instagram;
    const fillsThreads = isEmptyValue(current.threads) && !!parsed.socialMedia.threads;
    if (fillsInstagram) updates.instagram = parsed.socialMedia.instagram;
    if (fillsThreads) updates.threads = parsed.socialMedia.threads;
    if (fillsInstagram || fillsThreads) filledFieldLabels.push('社群帳號');
  }

  if (isEmptyValue(current.description) && parsed.redemptionCondition) {
    updates.description = parsed.redemptionCondition;
    filledFieldLabels.push('領取條件');
  }

  return { updates, filledFieldLabels };
}

export function buildParsedFieldsToastMessage(filledFieldLabels: string[]): string {
  if (filledFieldLabels.length === 0) {
    return '這次文案解析沒有新增欄位內容（可能欄位已有值，或這篇文案取得的資訊有限）';
  }
  return `已從文案解析帶入：${filledFieldLabels.join('、')}`;
}
