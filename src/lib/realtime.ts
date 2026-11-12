type Listener = (code: string) => void;

const globalStore = globalThis as unknown as {
  __quorumSubscribers?: Map<string, Set<Listener>>;
};

const channels = (globalStore.__quorumSubscribers ??= new Map<string, Set<Listener>>());

export function subscribe(code: string, listener: Listener) {
  let listeners = channels.get(code);
  if (!listeners) {
    listeners = new Set();
    channels.set(code, listeners);
  }
  listeners.add(listener);

  return () => {
    listeners?.delete(listener);
    if (listeners && listeners.size === 0) channels.delete(code);
  };
}

export function publish(code: string) {
  const listeners = channels.get(code);
  if (!listeners) return;
  for (const listener of listeners) {
    try {
      listener(code);
    } catch {
      // A broken stream should not block other subscribers.
    }
  }
}
