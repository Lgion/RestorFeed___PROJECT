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
    <div className="notification">
      {message}
    </div>
  );
}
