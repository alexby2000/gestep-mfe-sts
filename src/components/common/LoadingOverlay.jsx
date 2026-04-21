import React from 'react';
import { createPortal } from 'react-dom';
import citedefLogo from '../../assets/logos/citedef_logo.png';
import styles from './LoadingOverlay.module.css';

/**
 * Componente de carga genérico.
 * @param {string}  text       - Texto opcional debajo del logo.
 * @param {boolean} fullScreen - Si true, usa portal y cubre toda la pantalla.
 */
export const LoadingOverlay = ({ text, fullScreen = false }) => {
  const content = (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.scene}>
          <div className={styles.ring1} />
          <div className={styles.ring2} />
          <div className={styles.ring3} />
          <img src={citedefLogo} alt="CITEDEF" className={styles.logo} />
        </div>
        {text && <p className={styles.text}>{text}</p>}
      </div>
    </div>
  );

  return fullScreen ? createPortal(content, document.body) : content;
};
