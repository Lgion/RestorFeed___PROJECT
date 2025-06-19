import React from "react";
import "../assets/bem/components/modal.scss";

export default function Modal({ open, onClose, children }) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal__dialog">
        <button className="modal__close" onClick={onClose} aria-label="Fermer">×</button>
        <div className="modal__content">
          {children}
        </div>
      </div>
    </div>
  );
}
