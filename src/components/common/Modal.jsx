import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import styles from './Modal.module.css';

// Modal simple con mensaje
export const SimpleModal = ({ isOpen, onClose, title, message, icon: Icon = AlertTriangle }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <Icon className={styles.icon} />
          <h3 className={styles.modalTitle}>{title}</h3>
        </div>
        <p className={styles.modalMessage}>{message}</p>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

// Modal con botones de acción
export const ActionModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  icon: Icon = AlertTriangle,
  primaryAction,
  secondaryAction,
  primaryText = 'Aceptar',
  secondaryText = 'Cancelar'
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <Icon className={styles.icon} />
          <h3 className={styles.modalTitle}>{title}</h3>
        </div>
        <p className={styles.modalMessage}>{message}</p>
        <div className={styles.modalButtons}>
          {secondaryAction && (
            <button 
              className={styles.modalButtonSecondary}
              onClick={() => {
                secondaryAction();
                onClose();
              }}
            >
              {secondaryText}
            </button>
          )}
          <button 
            className={styles.modalButtonPrimary}
            onClick={() => {
              primaryAction();
              onClose();
            }}
          >
            {primaryText}
          </button>
        </div>
      </div>
    </div>
  );
};
