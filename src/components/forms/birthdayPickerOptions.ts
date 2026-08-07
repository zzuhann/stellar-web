// 年/月選項範圍，桌面版 Dropdown 與手機版 wheel 共用，避免各自維護一份、
// 也避免 BirthdayPicker.tsx 與 BirthdayPickerMobileSheet.tsx 互相 import 造成循環依賴
export interface PickerOption {
  value: string;
  label: string;
}

const MIN_BIRTH_YEAR = 1950;
const CURRENT_YEAR = new Date().getFullYear();

export const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - MIN_BIRTH_YEAR + 1 },
  (_, i) => MIN_BIRTH_YEAR + i
);
export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
