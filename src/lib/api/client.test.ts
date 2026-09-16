import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const signOutMock = vi.fn().mockResolvedValue(undefined);
const notifyUnauthorizedMock = vi.fn();

vi.mock('../firebase', () => ({
  auth: { signOut: signOutMock, currentUser: null },
}));

// 保留 auth-events 的真實 bumpAuthGeneration/getAuthGeneration，
// 這樣才能在測試裡模擬「登入世代」的推進；只 mock notifyUnauthorized 來斷言呼叫次數。
vi.mock('../auth-events', async () => {
  const actual = await vi.importActual<typeof import('../auth-events')>('../auth-events');
  return {
    ...actual,
    notifyUnauthorized: notifyUnauthorizedMock,
  };
});

type RequestHandler = (config: Record<string, unknown>) => Promise<Record<string, unknown>>;
type RejectedHandler = (error: unknown) => Promise<unknown>;
let capturedRequestHandler: RequestHandler | undefined;
let capturedRejectedHandler: RejectedHandler | undefined;

// client.ts 的 401 世代比對邏輯掛在請求/回應攔截器上，
// 直接攔截 axios.create() 拿到這兩個 handler 來測，不需要真的發 HTTP 請求
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    ...actual,
    default: {
      ...actual.default,
      create: () => ({
        interceptors: {
          request: {
            use: (fulfilled: RequestHandler) => {
              capturedRequestHandler = fulfilled;
            },
          },
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

// 模擬送出一個請求：跑過請求攔截器，拿到（帶著當下登入世代版號的）config
async function sendRequest(): Promise<Record<string, unknown>> {
  const config = await capturedRequestHandler?.({ headers: {} });
  return config as Record<string, unknown>;
}

// 模擬這個 config 對應的請求最終收到 401
async function trigger401(config: Record<string, unknown>) {
  await capturedRejectedHandler?.({ response: { status: 401 }, config }).catch(() => {});
}

describe('api client 401 回應攔截器（登入世代鎖）', () => {
  beforeEach(async () => {
    vi.resetModules();
    capturedRequestHandler = undefined;
    capturedRejectedHandler = undefined;
    signOutMock.mockClear();
    notifyUnauthorizedMock.mockClear();
    await import('./client');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('短時間內連續多個 401（同一登入世代的平行請求），signOut 與 notifyUnauthorized 只觸發一次', async () => {
    const configA = await sendRequest();
    const configB = await sendRequest();
    const configC = await sendRequest();

    await trigger401(configA);
    await trigger401(configB);
    await trigger401(configC);

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(notifyUnauthorizedMock).toHaveBeenCalledTimes(1);
  });

  it('請求 B 的過期 401 在使用者重新登入後才回來，不應該觸發 signOut（race condition）', async () => {
    vi.useFakeTimers();

    // 請求 A、B 在 token 過期前幾乎同時送出，帶著同一組（舊）登入世代版號
    const configA = await sendRequest();
    const configB = await sendRequest();

    // 請求 A 先回來，401 → 觸發 signOut + notifyUnauthorized
    await trigger401(configA);
    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(notifyUnauthorizedMock).toHaveBeenCalledTimes(1);

    // 使用者馬上重新登入成功 → auth-context 的 onAuthStateChanged 會推進登入世代
    const { bumpAuthGeneration } = await import('../auth-events');
    bumpAuthGeneration();
    signOutMock.mockClear();
    notifyUnauthorizedMock.mockClear();

    // 時間往後推超過舊版 1 秒防抖窗口，模擬請求 B 拖了一段時間才回來——
    // 純時間防抖在這個時間點會誤判成「新的一次 401」而重新觸發，登入世代鎖不會
    vi.advanceTimersByTime(1500);

    // 請求 B 這時候才回來，帶的是「重新登入前」那組舊世代版號的 401——應被忽略
    await trigger401(configB);

    expect(signOutMock).not.toHaveBeenCalled();
    expect(notifyUnauthorizedMock).not.toHaveBeenCalled();
  });

  it('登入世代推進後，新世代下的新請求收到 401 仍會正常觸發 signOut 與 notifyUnauthorized', async () => {
    const configA = await sendRequest();
    await trigger401(configA);
    expect(signOutMock).toHaveBeenCalledTimes(1);

    const { bumpAuthGeneration } = await import('../auth-events');
    bumpAuthGeneration();
    signOutMock.mockClear();
    notifyUnauthorizedMock.mockClear();

    // 新世代下重新送出的請求，過期時一樣要能正常觸發
    const configB = await sendRequest();
    await trigger401(configB);

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(notifyUnauthorizedMock).toHaveBeenCalledTimes(1);
  });
});
