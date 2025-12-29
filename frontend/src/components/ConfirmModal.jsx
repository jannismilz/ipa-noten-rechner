import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <AlertTriangle className="modal-icon warning" />
          <h2>{title}</h2>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Abbrechen
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Bestätigen
          </button>
        </div>
      </div>
    </div>
  );
}
