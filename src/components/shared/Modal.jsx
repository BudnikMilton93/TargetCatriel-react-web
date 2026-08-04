export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar modal">
            x
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
