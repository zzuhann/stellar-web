import { describe, expect, it, vi } from 'vitest';
import { probeWebGL } from './webgl';

const fakeCanvas = (getContext: (type: string, attrs?: unknown) => unknown) =>
  ({ getContext: vi.fn(getContext) }) as unknown as HTMLCanvasElement;

const fakeGL = () => ({ getExtension: () => ({ loseContext: vi.fn() }) });

describe('probeWebGL', () => {
  it('WebGL2 可用時回傳 true，且用 MapLibre 的 context 條件探測', () => {
    const canvas = fakeCanvas((type) => (type === 'webgl2' ? fakeGL() : null));
    expect(probeWebGL(canvas)).toBe(true);
    expect(canvas.getContext).toHaveBeenCalledWith('webgl2', {
      stencil: true,
      depth: true,
      antialias: false,
    });
  });

  it('只有 WebGL1 時回傳 true', () => {
    expect(probeWebGL(fakeCanvas((type) => (type === 'webgl' ? fakeGL() : null)))).toBe(true);
  });

  it('兩種 context 都拿不到時回傳 false', () => {
    expect(probeWebGL(fakeCanvas(() => null))).toBe(false);
  });

  it('getContext 丟錯時回傳 false', () => {
    expect(
      probeWebGL(
        fakeCanvas(() => {
          throw new Error('blocked');
        })
      )
    ).toBe(false);
  });
});
