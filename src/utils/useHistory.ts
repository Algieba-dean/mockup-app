import { useState, useCallback, useEffect, useRef } from 'react';

const MAX_HISTORY = 30;
const COALESCE_WINDOW_MS = 600;

export function useHistory<T>(initial: T, isEnabled: boolean = true) {
  const [state, setState] = useState<T>(initial);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);
  const skipRecordRef = useRef(false);
  const lastPushTimeRef = useRef<number>(0);
  const lastCoalesceKeyRef = useRef<string | undefined>(undefined);

  const set = useCallback((updater: T | ((prev: T) => T), options?: { coalesceKey?: string }) => {
    setState((prev) => {
      const next = typeof updater === 'function' ? (updater as (prev: T) => T)(prev) : updater;
      if (!skipRecordRef.current) {
        const now = Date.now();
        const key = options?.coalesceKey;
        const shouldCoalesce =
          !!key &&
          key === lastCoalesceKeyRef.current &&
          now - lastPushTimeRef.current < COALESCE_WINDOW_MS &&
          pastRef.current.length > 0;
        if (!shouldCoalesce) {
          pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), prev];
        }
        lastPushTimeRef.current = now;
        lastCoalesceKeyRef.current = key;
        futureRef.current = [];
      }
      skipRecordRef.current = false;
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    lastPushTimeRef.current = 0;
    lastCoalesceKeyRef.current = undefined;
    setState((current) => {
      if (pastRef.current.length === 0) return current;
      const previous = pastRef.current[pastRef.current.length - 1];
      pastRef.current = pastRef.current.slice(0, -1);
      futureRef.current = [...futureRef.current, current];
      skipRecordRef.current = true;
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    lastPushTimeRef.current = 0;
    lastCoalesceKeyRef.current = undefined;
    setState((current) => {
      if (futureRef.current.length === 0) return current;
      const next = futureRef.current[futureRef.current.length - 1];
      futureRef.current = futureRef.current.slice(0, -1);
      pastRef.current = [...pastRef.current, current];
      skipRecordRef.current = true;
      return next;
    });
  }, []);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  // Keyboard shortcuts
  useEffect(() => {
    if (!isEnabled) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = !!target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );
      if (isTyping) return;

      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && ((key === 'z' && e.shiftKey) || key === 'y')) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, isEnabled]);

  return { state, set, undo, redo, canUndo, canRedo };
}
