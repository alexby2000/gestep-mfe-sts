import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { XCircle, AlertTriangle } from 'lucide-react';
import styles from './RejectModal.module.css';

const MOTIVOS_PREDEFINIDOS = [
  'Documentación incompleta',
  'No cumple los requisitos de la unidad',
  'DNI duplicado en el sistema',
  'Solicitud fuera del período habilitado',
  'Otro motivo',
];

export const RejectModal = ({ user, onConfirm, onCancel }) => {
  const [motivo, setMotivo] = useState('');
  const [motivoCustom, setMotivoCustom] = useState('');
  const [error, setError] = useState('');

  const isCustom = motivo === 'Otro motivo';
  const justificacion = isCustom ? motivoCustom.trim() : motivo;

  const handleConfirm = () => {
    if (!justificacion) {
      setError('Seleccioná o escribí un motivo de rechazo.');
      return;
    }
    if (isCustom && justificacion.length < 10) {
      setError('El motivo debe tener al menos 10 caracteres.');
      return;
    }
    onConfirm(justificacion);
  };

  const modal = (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={20} className={styles.warningIcon} />
          </div>
          <div>
            <h3 className={styles.title}>Rechazar solicitud</h3>
            <p className={styles.subtitle}>
              {user.nombre} {user.apellido}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <p className={styles.description}>
            Esta acción notificará al usuario sobre el rechazo de su solicitud.
            Indicá el motivo para que pueda tomar acciones correctivas.
          </p>

          <label className={styles.label}>Motivo de rechazo</label>

          <div className={styles.motivoList}>
            {MOTIVOS_PREDEFINIDOS.map(m => (
              <button
                key={m}
                type="button"
                className={`${styles.motivoBtn} ${motivo === m ? styles.motivoBtnActive : ''}`}
                onClick={() => { setMotivo(m); setError(''); }}
              >
                {m}
              </button>
            ))}
          </div>

          {isCustom && (
            <textarea
              className={styles.textarea}
              placeholder="Escribí el motivo detallado..."
              value={motivoCustom}
              onChange={e => { setMotivoCustom(e.target.value); setError(''); }}
              rows={3}
              maxLength={300}
              autoFocus
            />
          )}

          {error && (
            <p className={styles.error}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancelar
          </button>
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            <XCircle size={15} />
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
