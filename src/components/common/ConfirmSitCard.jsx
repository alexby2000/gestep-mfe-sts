import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ConfirmSitCard.module.css';

/**
 * Drawer lateral reutilizable que se desliza desde la derecha
 * @param {boolean} isOpen - Controla si el drawer está visible
 * @param {function} onClose - Callback para cerrar el drawer
 * @param {React.ReactNode} children - Contenido del drawer
 */
export const ConfirmSitCard = ({ isOpen, onClose, children }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300); // Duración de la animación
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className={`${styles.drawerOverlay} ${isClosing ? styles.fadeOut : ''}`}
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div className={`${styles.drawer} ${isClosing ? styles.slideOut : ''}`}>
        <button 
          className={styles.drawerCloseButton}
          onClick={handleClose}
        >
          <X size={20} />
        </button>

        <div className={styles.drawerContent}>
          {children}
        </div>
      </div>
    </>
  );
};
