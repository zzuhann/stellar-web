// 表單送出驗證失敗時，捲動並聚焦到第一個有錯誤的欄位。
// 自訂元件（DatePicker、TimePicker、下拉選單等）沒有可用的原生 input ref 可讓
// react-hook-form 的預設 shouldFocusError 抓到，因此改用「欄位容器 ref」的方式：
// 呼叫端把每個欄位的外層容器 DOM 節點註冊進 fieldRefs，這裡再從容器裡找第一個
// 可聚焦的子節點（input/button/textarea/[tabindex]）處理 focus。

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
