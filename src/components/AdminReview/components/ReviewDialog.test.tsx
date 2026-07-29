import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ReviewDialog from './ReviewDialog';

afterEach(cleanup);

describe('ReviewDialog', () => {
  it('拒絕原因空白時不能送出，填寫後送出 trim 過的原因', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ReviewDialog open kind="reject" title="拒絕投稿" onClose={vi.fn()} onConfirm={onConfirm} />
    );

    const confirmButton = screen.getByRole('button', { name: '確認拒絕' });
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true);
    await user.type(screen.getByRole('textbox', { name: /拒絕原因/ }), '  資料不完整  ');
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith('資料不完整');
  });

  it('已有輸入時關閉會要求確認離開', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<ReviewDialog open kind="reject" title="拒絕投稿" onClose={onClose} />);

    await user.type(screen.getByRole('textbox', { name: /拒絕原因/ }), '原因');
    await user.click(screen.getByRole('button', { name: '關閉' }));
    expect(confirm).toHaveBeenCalledWith('有未送出的內容，確定要離開嗎？');
    expect(onClose).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: '關閉' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('kind=groups 時，預填團名未被改動時關閉不彈確認離開提示', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const confirm = vi.spyOn(window, 'confirm');
    render(
      <ReviewDialog
        open
        kind="groups"
        title="設定團名"
        initialValues={['既有團名']}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: '關閉' }));

    expect(confirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('kind=groups 時，使用者真的改過團名欄位才會要求確認離開', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <ReviewDialog
        open
        kind="groups"
        title="設定團名"
        initialValues={['既有團名']}
        onClose={onClose}
      />
    );

    const input = screen.getByRole('textbox', { name: /團名 1/ });
    await user.clear(input);
    await user.type(input, '改過的團名');
    await user.click(screen.getByRole('button', { name: '關閉' }));

    expect(confirm).toHaveBeenCalledWith('有未送出的內容，確定要離開嗎？');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
