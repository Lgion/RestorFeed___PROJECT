import { useEffect } from "react";

export default function Notification({ message, onClose, duration = 1800 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      background: '#27ae60',
      color: '#fff',
      padding: '14px 28px',
      borderRadius: 8,
      boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
      fontWeight: 'bold',
      zIndex: 1000
    }}>
      {message}
    </div>
  );
}
