export const getWeekStart = (date: Date): Date => {
  const d = new Date(date.getTime()); // 確保不修改原始 date
  const day = d.getDay();
  // 將星期一設為一週的開始 (星期一為1，星期日為0)
  const diff = day === 0 ? -6 : 1 - day; // 如果是星期日(0)，往前6天到星期一；否則計算到星期一的差距
  d.setDate(d.getDate() + diff);
  // 設定為當天開始（00:00:00）
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getWeekEnd = (weekStart: Date): Date => {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  return d;
};

export const formatDate = (date: Date): string => {
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const formatDateForAPI = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const formatDateForISOString = (date: Date): string => {
  return date.toISOString();
};
