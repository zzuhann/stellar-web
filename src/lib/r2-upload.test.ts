import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError } from 'axios';
import api from './api/client';
import { UPLOAD_NO_RESPONSE_MESSAGE, UPLOAD_TIMEOUT_MS, uploadImageToAPI } from './r2-upload';

vi.mock('./api/client', () => ({
  default: { post: vi.fn() },
}));

// jsdom can't decode images; make compressImage take its onerror path and upload the original
class UndecodableImage {
  onerror: (() => void) | null = null;
  set src(_: string) {
    queueMicrotask(() => this.onerror?.());
  }
}

const file = new File(['x'], 'a.png', { type: 'image/png' });

describe('uploadImageToAPI', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', UndecodableImage);
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(api.post).mockReset();
  });

  it('uses the longer upload timeout instead of the global 10s', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true, filename: 'a.png' } });

    await uploadImageToAPI(file);

    expect(vi.mocked(api.post).mock.calls[0][2]).toMatchObject({ timeout: UPLOAD_TIMEOUT_MS });
  });

  it.each([
    ['timeout', new AxiosError('timeout of 60000ms exceeded', 'ECONNABORTED')],
    ['network error', new AxiosError('Network Error', 'ERR_NETWORK')],
  ])('shows the server-or-network message on %s', async (_, error) => {
    vi.mocked(api.post).mockRejectedValueOnce(error);

    expect(await uploadImageToAPI(file)).toEqual({
      success: false,
      error: UPLOAD_NO_RESPONSE_MESSAGE,
    });
  });

  it('keeps the backend message when the server responded', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(
      new AxiosError('bad', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 400,
        data: { error: '檔案格式不支援' },
      } as never)
    );

    expect(await uploadImageToAPI(file)).toEqual({ success: false, error: '檔案格式不支援' });
  });
});
