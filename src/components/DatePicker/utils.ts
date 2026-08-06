import { getTaipeiToday, parseTaipeiDateString, taipeiDateStringToLocalDate } from '@/utils';

export const isToday = (date: Date) => {
  // getTaipeiToday()，不是裸的 new Date()：非 UTC+8 使用者剛好跨過午夜時，瀏覽器的
  // 「今天」跟 Taipei 的「今天」可能不是同一天，會讓日曆高亮到錯的一格
  const today = getTaipeiToday();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isSelected = (date: Date, value: string) => {
  if (!value) return false;
  // 同樣的 date-only 字串解析問題（見下方 isDisabled 註解）：new Date(value) 會被當成
  // UTC 午夜解析，非 UTC+8 環境下用 .getDate() 等本地方法讀回來可能整個位移一天，
  // 讓日曆格子高亮到錯的一天。改用 parseTaipeiDateString。
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

// min/max 是「YYYY-MM-DD」字串（例如呼叫端傳入 dateToTaipeiDateString(new Date())）。
// 不能直接 new Date(min) 讀取年月日——date-only 字串會被當成 UTC 午夜解析，非 UTC+8
// 環境下用 .getFullYear() 等本地方法讀回來可能整個位移一天，誤放行一天前的日期或
// 誤擋一天後的日期。改用 parseTaipeiDateString 明確依 Asia/Taipei 解析 min/max。
const compareDateParts = (
  a: { year: number; month: number; day: number },
  b: { year: number; month: number; day: number }
): number => {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
};

export const isDisabled = ({ date, min, max }: { date: Date; min?: string; max?: string }) => {
  // 日曆格子的 date 是用本地 Date 元件生成（getDaysInMonth），這裡沿用同一套本地
  // getter 取「這一格代表哪一天」，只有 min/max 字串的解析方式是這次要修的部分
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
  // 用 taipeiDateStringToLocalDate 取代直接 new Date(dateString)：後者對 date-only
  // 字串的解析是 UTC 午夜，即使這裡的 toLocaleDateString 有指定 timeZone 讓輸出結果
  // 剛好正確，這種寫法仍然容易在 review 時被誤判成沒綁定時區、也跟同檔案其他函式的
  // 解法不一致。改成本地建構的 Date 後，顯示時不再需要（也不應該再）指定 timeZone，
  // 否則對一個本地建構的 Date 再套用 Asia/Taipei 轉換，反而會依瀏覽器時區重新位移。
  const date = taipeiDateStringToLocalDate(dateString);
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};
