import React, { useRef, useEffect } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  onEscape?: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const FocusTrap: React.FC<FocusTrapProps> = ({ children, onEscape }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && onEscape) {
      onEscape();
      return;
    }
    if (e.key !== 'Tab') return;
    const el = ref.current;
    if (!el) return;
    const focusable = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div ref={ref} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
};
