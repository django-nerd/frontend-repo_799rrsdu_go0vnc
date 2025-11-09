import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 2000 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bg = type === 'error' ? '#B03030' : '#5B913B';
  const color = type === 'error' ? 'white' : 'black';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-lg shadow-lg px-4 py-2" style={{ backgroundColor: bg, color }}>
        {message}
      </div>
    </div>
  );
}
