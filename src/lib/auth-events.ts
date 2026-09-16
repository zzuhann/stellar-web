type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeUnauthorized(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyUnauthorized(): void {
  listeners.forEach((listener) => listener());
}

// 登入世代版號：每次登入狀態變化（登入/登出）遞增，讓 401 攔截器能分辨
// 一個過期的 401 回應是否還跟「現在」的登入狀態有關，取代純時間防抖。
let authGeneration = 0;

export function bumpAuthGeneration(): number {
  authGeneration += 1;
  return authGeneration;
}

export function getAuthGeneration(): number {
  return authGeneration;
}
