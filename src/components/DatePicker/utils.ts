import { getTaipeiToday, parseTaipeiDateString, taipeiDateStringToLocalDate } from '@/utils';

export const isToday = (date: Date) => {
  // 用 getTaipeiToday 而非 new Date()：避免非 UTC+8 使用者跨午夜時，日曆高亮到錯的一格
  const today = getTaipeiToday();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isSelected = (date: Date, value: string) => {
  if (!value) return false;
  // 用 parseTaipeiDateString 而非 new Date(value)：date-only 字串會被當 UTC 午夜解析，
  // 非 UTC+8 環境下可能位移一天
  const selectedParts = parseTaipeiDateString(value);
  return (
    date.getDate() === selectedParts.day &&
    date.getMonth() === selectedParts.month &&
    date.getFullYear() === selectedParts.year
  );
};

export const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = [];
  const currentDate = new Date(startDate);

  while (currentDate <= lastDay || days.length < 42) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

// min/max 是 YYYY-MM-DD 字串，用 parseTaipeiDateString 解析後逐欄比較，避免
// new Date(min) 的 UTC 午夜解析造成日期位移
const compareDateParts = (
  a: { year: number; month: number; day: number },
  b: { year: number; month: number; day: number }
): number => {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
};

export const isDisabled = ({ date, min, max }: { date: Date; min?: string; max?: string }) => {
  // date 沿用本地 Date getter（跟 getDaysInMonth 生成方式一致），僅 min/max 字串需另外解析
  const dateOnly = { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };

  if (min) {
    const minParts = parseTaipeiDateString(min);
    if (compareDateParts(dateOnly, minParts) < 0) return true;
  }
  if (max) {
    const maxParts = parseTaipeiDateString(max);
    if (compareDateParts(dateOnly, maxParts) > 0) return true;
  }
  return false;
};

export const formatDisplayDate = (dateString: string) => {
  if (!dateString) return '';
  // 用 taipeiDateStringToLocalDate 取代 new Date(dateString)；回傳的是本地建構的 Date，
  // 顯示時不能再套用 Asia/Taipei timeZone，否則會依瀏覽器時區重新位移
  const date = taipeiDateStringToLocalDate(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
