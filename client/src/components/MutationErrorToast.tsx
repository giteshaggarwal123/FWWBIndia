import { useState, useEffect } from 'react';

const TOAST_DURATION_MS = 5000;
const EVENT_NAME = 'fwwb-mutation-error';

export function MutationErrorToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent<string>).detail;
      if (msg) setMessage(msg);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), TOAST_DURATION_MS);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '90%',
        width: 400,
        padding: '14px 20px',
        background: '#c53030',
        color: '#fff',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 10000,
        fontSize: 14,
        lineHeight: 1.4,
      }}
    >
      <strong style={{ display: 'block', marginBottom: 4 }}>Error</strong>
      {message}
    </div>
  );
}
