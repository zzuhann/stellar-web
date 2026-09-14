import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const signOutMock = vi.fn().mockResolvedValue(undefined);
const notifyUnauthorizedMock = vi.fn();

vi.mock('../firebase', () => ({
  auth: { signOut: signOutMock, currentUser: null },
}));

vi.mock('../auth-events', () => ({
  notifyUnauthorized: notifyUnauthorizedMock,
}));

type RejectedHandler = (error: unknown) => Promise<unknown>;
let capturedRejectedHandler: RejectedHandler | undefined;

// client.ts 的 401 debounce 邏輯掛在回應攔截器的 rejected handler 上，
// 直接攔截 axios.create() 拿到該 handler 來測，不需要真的發 HTTP 請求
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      create: () => ({
        interceptors: {
          request: { use: vi.fn() },
          response: {
            use: (_fulfilled: unknown, rejected: RejectedHandler) => {
              capturedRejectedHandler = rejected;
            },
          },
        },
      }),
    },
  };
});

function unauthorizedError() {
  return { response: { status: 401 } };
}

async function trigger401() {
  await capturedRejectedHandler?.(unauthorizedError()).catch(() => {});
}

describe('api client 401 回應攔截器的 debounce', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 0));
    vi.resetModules();
    capturedRejectedHandler = undefined;
    signOutMock.mockClear();
    notifyUnauthorizedMock.mockClear();
    await import('./client');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('短時間內連續多個 401（平行請求），signOut 與 notifyUnauthorized 只觸發一次', async () => {
    await trigger401();
    await trigger401();
    await trigger401();

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(notifyUnauthorizedMock).toHaveBeenCalledTimes(1);
  });

  it('防抖窗口（1 秒）過後再收到 401，會重新觸發 signOut 與 notifyUnauthorized', async () => {
    await trigger401();
    expect(signOutMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date(2026, 0, 1, 0, 0, 1, 1)); // +1001ms，超過防抖窗口
    await trigger401();

    expect(signOutMock).toHaveBeenCalledTimes(2);
    expect(notifyUnauthorizedMock).toHaveBeenCalledTimes(2);
  });
});
