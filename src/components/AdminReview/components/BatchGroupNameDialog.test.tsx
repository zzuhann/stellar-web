import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Artist } from '@/types';
import BatchGroupNameDialog from './BatchGroupNameDialog';

const artists = [
  { id: 'artist-1', stageName: 'ONE', status: 'pending', groupNames: ['A'] },
  { id: 'artist-2', stageName: 'TWO', status: 'pending', groupNames: [] },
] as Artist[];

afterEach(cleanup);

describe('BatchGroupNameDialog', () => {
  it('每位藝人保留各自團名，空值也可送出', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <BatchGroupNameDialog
        artists={artists}
        busy={false}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const first = screen.getByLabelText('ONE');
    const second = screen.getByLabelText('TWO');
    await user.clear(first);
    await user.type(first, '新團名');
    expect((second as HTMLInputElement).value).toBe('');
    await user.click(screen.getByRole('button', { name: '確認通過' }));

    expect(onConfirm).toHaveBeenCalledWith({ 'artist-1': '新團名' });
  });

  it('預填團名未被使用者改動時，關閉不彈確認離開提示', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const confirm = vi.spyOn(window, 'confirm');
    render(
      <BatchGroupNameDialog artists={artists} busy={false} onClose={onClose} onConfirm={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: '關閉' }));

    expect(confirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('使用者真的改過團名欄位時，關閉才會要求確認離開', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <BatchGroupNameDialog artists={artists} busy={false} onClose={onClose} onConfirm={vi.fn()} />
    );

    await user.type(screen.getByLabelText('TWO'), '新團名');
    await user.click(screen.getByRole('button', { name: '關閉' }));

    expect(confirm).toHaveBeenCalledWith('有未送出的內容，確定要離開嗎？');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
