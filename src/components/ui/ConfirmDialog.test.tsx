import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

afterEach(cleanup);

function renderDialog(props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  render(
    <ConfirmDialog
      open
      title="確認刪除？"
      description="此操作無法復原。"
      confirmLabel="刪除"
      onConfirm={onConfirm}
      onClose={onClose}
      {...props}
    />
  );
  return { onClose, onConfirm, dialog: screen.getByRole('alertdialog') };
}

// 刪除確認（不傳 children）的 DOM 與行為是既有契約，擴充 children 時不可改變
describe('R6 ConfirmDialog 不傳 children', () => {
  it('DOM 結構維持原樣', () => {
    const { dialog } = renderDialog({ error: '刪除失敗' });
    const html = dialog.outerHTML.replace(/\s(id|aria-labelledby|aria-describedby)="[^"]*"/g, '');

    expect(html).toMatchInlineSnapshot(
      `"<div class="pos_relative z_50" role="alertdialog" tabindex="-1" aria-modal="true" data-headlessui-state="open" data-open=""><div class="pos_fixed inset_0 bg_alpha.black.50" aria-hidden="true" data-headlessui-state="open" data-open=""></div><div class="pos_fixed inset_0 d_flex ai_center jc_center p_4"><div class="bg_white bdr_radius.lg bx-sh_shadow.lg max-w_420px w_100% ov_hidden" data-headlessui-state="open" data-open=""><div class="d_flex ai_center jc_space-between px_5 pt_5 pb_3"><h2 class="textStyle_h4 c_color.text.primary m_0 d_flex ai_center gap_2" data-headlessui-state="open" data-open=""><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="w_20px h_20px c_amber.500"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"></path></svg>確認刪除？</h2><button type="button" class="bg_none bd_none cursor_pointer p_1 bdr_radius.md c_color.text.secondary [&amp;:hover]:bg_color.background.secondary [&amp;:hover]:c_color.text.primary [&amp;:disabled]:op_0.5 [&amp;:disabled]:cursor_not-allowed" aria-label="關閉"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"></path></svg></button></div><p class="px_5 pb_3 textStyle_bodySmall c_color.text.secondary" data-headlessui-state="open" data-open="">此操作無法復原。</p><div class="px_5 pb_2 textStyle_caption c_red.600" role="alert">刪除失敗</div><div class="d_flex gap_2 px_5 pb_5 pt_2"><button type="button" class="flex_1 py_2.5 px_4 bdr_radius.md bd_1px_solid textStyle_bodySmall fw_semibold cursor_pointer d_flex ai_center jc_center gap_2 trs_background_0.15s_ease [&amp;:disabled]:op_0.5 [&amp;:disabled]:cursor_not-allowed bg_white bd-c_color.border.light c_color.text.primary [&amp;:hover:not(:disabled)]:bg_color.background.secondary">取消</button><button type="button" class="flex_1 py_2.5 px_4 bdr_radius.md bd_1px_solid textStyle_bodySmall fw_semibold cursor_pointer d_flex ai_center jc_center gap_2 trs_background_0.15s_ease [&amp;:disabled]:op_0.5 [&amp;:disabled]:cursor_not-allowed bg_red.600 bd-c_red.600 c_white [&amp;:hover:not(:disabled)]:bg_red.700 [&amp;:hover:not(:disabled)]:bd-c_red.700">刪除</button></div></div></div></div>"`
    );
  });

  it('isLoading 時 Esc、遮罩、X 皆停用', async () => {
    const { onClose, dialog } = renderDialog({ isLoading: true });

    await userEvent.keyboard('{Escape}');
    await userEvent.click(dialog.lastElementChild as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: '關閉' }));
    fireEvent.click(screen.getByRole('button', { name: '取消' }));

    expect(onClose).not.toHaveBeenCalled();
    expect((screen.getByRole('button', { name: '關閉' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('非 loading 時 Esc、遮罩、X、取消皆可關閉', async () => {
    const { onClose, dialog } = renderDialog();

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.click(dialog.lastElementChild as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: '關閉' }));
    fireEvent.click(screen.getByRole('button', { name: '取消' }));
    expect(onClose).toHaveBeenCalledTimes(4);
  });
});

describe('R7 ConfirmDialog 傳 children', () => {
  it('children 正常顯示，isLoading 時 Esc、遮罩、X 皆停用', async () => {
    const { onClose, dialog } = renderDialog({
      isLoading: true,
      children: (
        <ul>
          <li>活動 A</li>
        </ul>
      ),
    });

    expect(screen.getByText('活動 A')).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(dialog.lastElementChild as HTMLElement);
    fireEvent.click(screen.getByRole('button', { name: '關閉' }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('confirmDisabled 停用確認鈕，autoFocusCancel 讓初始焦點落在取消', async () => {
    const { onConfirm } = renderDialog({
      children: <p>內容</p>,
      confirmDisabled: true,
      autoFocusCancel: true,
    });

    const confirm = screen.getByRole('button', { name: '刪除' }) as HTMLButtonElement;
    expect(confirm.disabled).toBe(true);
    fireEvent.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('button', { name: '取消' }))
    );
  });
});
