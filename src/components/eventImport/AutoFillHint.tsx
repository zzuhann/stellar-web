import { css } from '@/styled-system/css';

const hintText = css({
  textStyle: 'caption',
  color: 'gray.600',
  margin: '0',
  marginTop: '1',
});

interface AutoFillHintProps {
  show: boolean;
  label?: string;
}

// design-frontend.md〈畫面規格〉第 3 點：自動帶入欄位的提示是純文字說明，不做成徽章，
// 管理員手動編輯過該欄位後立即消失（由呼叫端控制 `show`）。
export default function AutoFillHint({
  show,
  label = '已從文案解析帶入，可直接修改',
}: AutoFillHintProps) {
  if (!show) return null;
  return <p className={hintText}>{label}</p>;
}
