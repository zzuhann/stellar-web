// 'HH:mm' 字串的格式化與 parse，獨立於 DatePicker/utils.ts，避免耦合

export const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
export const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export const isValidTimeString = (value: string): boolean =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const parseTimeString = (value: string): { hour: string; minute: string } => {
  if (!isValidTimeString(value)) return { hour: '', minute: '' };
  const [hour, minute] = value.split(':');
  return { hour, minute };
};

export const formatTimeString = (hour: string, minute: string): string => `${hour}:${minute}`;
