// 表單送出驗證失敗時捲動並聚焦到第一個錯誤欄位；自訂元件（DatePicker 等）沒有原生
// input ref 可讓 shouldFocusError 抓到，故改用呼叫端註冊的「欄位容器 ref」找子節點聚焦

export const scrollToFirstErrorField = (
  fieldOrder: string[],
  hasError: (field: string) => boolean,
  fieldRefs: Record<string, HTMLElement | null | undefined>
): void => {
  const firstErrorField = fieldOrder.find(hasError);
  if (!firstErrorField) return;

  const container = fieldRefs[firstErrorField];
  if (!container) return;

  container.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const focusable = container.querySelector<HTMLElement>(
    'input:not([type="hidden"]), textarea, button, [tabindex]'
  );
  focusable?.focus({ preventScroll: true });
};
