import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { sendGAEvent } from '@next/third-parties/google';
import useCreateEventMutation from './useCreateEventMutation';
import { eventsApi } from '@/lib/api';
import type { CreateEventRequest } from '@/types';

vi.mock('@/lib/api', () => ({
  eventsApi: { create: vi.fn() },
  handleApiError: vi.fn(),
}));

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: { uid: 'user-1' } }) }));
vi.mock('@/lib/toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const createMock = vi.mocked(eventsApi.create);
const sendGAEventMock = vi.mocked(sendGAEvent);

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return createElement(QueryClientProvider, { client }, children);
}

async function submit(entryPoint?: 'submit_artist_page') {
  const { result } = renderHook(() => useCreateEventMutation({ onSuccess: vi.fn(), entryPoint }), {
    wrapper,
  });
  act(() => result.current.mutate({} as CreateEventRequest));
  await waitFor(() => expect(sendGAEventMock).toHaveBeenCalled());
}

beforeEach(() => {
  createMock.mockResolvedValue({ id: 'event-1' } as never);
});

describe('useCreateEventMutation submit_event 埋點', () => {
  it('TC-022 帶 entryPoint 時，submit_event 帶 entry_point=submit_artist_page', async () => {
    await submit('submit_artist_page');

    expect(sendGAEventMock).toHaveBeenCalledWith('event', 'submit_event', {
      event_page: '/submit-event',
      user_id: 'user-1',
      content_id: 'event-1',
      entry_point: 'submit_artist_page',
    });
  });

  it('TC-010 沒有 entryPoint 時，submit_event 形狀與原本一致（不帶 entry_point）', async () => {
    await submit(undefined);

    expect(sendGAEventMock).toHaveBeenCalledWith('event', 'submit_event', {
      event_page: '/submit-event',
      user_id: 'user-1',
      content_id: 'event-1',
    });
  });
});
