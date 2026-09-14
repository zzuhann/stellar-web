type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeUnauthorized(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyUnauthorized(): void {
  listeners.forEach((listener) => listener());
}
