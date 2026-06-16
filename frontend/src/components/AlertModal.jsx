import "./ConfirmModal.css";

const AlertModal = ({
  isOpen,
  title,
  message,
  variant = "success",
  onClose,
}) => {
  if (!isOpen) return null;

  const iconMap = {
    success: "bi-check-circle-fill",
    danger: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
    warning: "bi-exclamation-triangle-fill",
  };

  return (
    <div className="mmd-modal-overlay confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          <i className={`bi ${iconMap[variant] || iconMap.info}`}></i>
        </div>
        <h3 className="confirm-modal-title">{title}</h3>
        {message && <p className="confirm-modal-message">{message}</p>}
        <div className="confirm-modal-actions">
          <button className="mmd-btn mmd-btn-primary" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
