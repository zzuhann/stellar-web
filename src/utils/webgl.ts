// Same context attributes MapLibre requests in _setupPainter, so the probe fails exactly when MapLibre would
const MAPLIBRE_CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  stencil: true,
  depth: true,
  antialias: false,
};

export const probeWebGL = (canvas: HTMLCanvasElement): boolean => {
  try {
    const gl =
      canvas.getContext('webgl2', MAPLIBRE_CONTEXT_ATTRIBUTES) ||
      canvas.getContext('webgl', MAPLIBRE_CONTEXT_ATTRIBUTES);
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
};

let cachedWebGL: boolean | undefined;

export const hasWebGL = (): boolean => {
  cachedWebGL ??= probeWebGL(document.createElement('canvas'));
  return cachedWebGL;
};
