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
});
