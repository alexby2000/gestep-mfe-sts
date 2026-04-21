import React, { useState, useEffect } from 'react';
import { X, FileText, Target, Award, ClipboardCheck } from 'lucide-react';
import { useImagePreloader } from '../../hooks/useImagePreloader';
import styles from './ConfirmSitCardWithTabs.module.css';

/**
 * Drawer lateral con pestañas reutilizable
 * @param {boolean} isOpen - Controla si el drawer está visible
 * @param {function} onClose - Callback para cerrar el drawer
 * @param {object} tabs - Configuración de las pestañas
 * @param {React.ReactNode} tabs.general - Contenido de la pestaña General
 * @param {object} tabs.habilidades - Datos de habilidades { items: string[] }
 * @param {object} tabs.blancos - Datos de blancos { items: [{ nombre: string, imagen: string }] }
 * @param {object} tabs.condiciones - Datos de condiciones { bloqueado: boolean, items: string[] }
 */
export const ConfirmSitCardWithTabs = ({ isOpen, onClose, tabs }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [shouldRender, setShouldRender] = useState(false);

  // Precargar imágenes de blancos cuando el drawer se abre
  const blancosImageUrls = tabs.blancos?.items?.map(blanco => blanco.imagen) || [];
  const loadedImages = useImagePreloader(blancosImageUrls, isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      setActiveTab('general'); // Reset to general tab when opening
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const handleClose = () => {
    onClose();
  };

  const tabConfig = [
    { id: 'general', label: 'General', icon: FileText },
    { id: 'habilidades', label: 'Habilidades', icon: Award },
    { id: 'blancos', label: 'Blancos', icon: Target },
    { id: 'condiciones', label: 'Evaluación', icon: ClipboardCheck }
  ];

  return (
    <>
      {/* Overlay oscuro */}
      <div 
        className={`${styles.drawerOverlay} ${isClosing ? styles.fadeOut : ''}`}
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div className={`${styles.drawer} ${isClosing ? styles.slideOut : ''}`}>
        {/* Tab Bar - Lado izquierdo fuera del drawer */}
        <div className={styles.tabBar}>
          {tabConfig.map(({ id, label, icon: Icon }) => (
            <div className={styles.tabButtonWrapper} key={id}>
              <div className={styles.tabButtonHoverArea}></div>
              <button
                className={`${styles.tabButton} ${activeTab === id ? styles.active : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            </div>
          ))}
        </div>

        <button 
          className={styles.drawerCloseButton}
          onClick={handleClose}
        >
          <X size={20} />
        </button>

        <div className={styles.drawerContainer}>
          {/* Contenido de las pestañas */}
          <div className={styles.tabContent}>
            {/* Pestaña General */}
            <div className={`${styles.tabPane} ${activeTab === 'general' ? styles.tabPaneActive : styles.tabPaneHidden}`}>
              {tabs.general}
            </div>

            {/* Pestaña Habilidades */}
            <div className={`${styles.tabPane} ${activeTab === 'habilidades' ? styles.tabPaneActive : styles.tabPaneHidden}`}>
              <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Habilidades a Desarrollar</h2>
                <p className={styles.tabSubtitle}>
                  Capacidades que se prueban o desarrollan en este ejercicio
                </p>
              </div>
              <div className={styles.skillsList}>
                {tabs.habilidades?.items?.map((habilidad, index) => (
                  <div key={index} className={`${styles.skillItem} ${habilidad.color === 'gold' ? styles.skillItemGold : ''}`}>
                    <div className={`${styles.skillIcon} ${styles[`skillIcon${habilidad.color?.charAt(0).toUpperCase() + habilidad.color?.slice(1)}`] || styles.skillIconBlue}`}>
                      <Award size={20} />
                    </div>
                    <div className={styles.skillText}>
                      <h4 className={styles.skillTitle}>{habilidad.nombre}</h4>
                      <p className={styles.skillDescription}>{habilidad.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pestaña Blancos */}
            <div className={`${styles.tabPane} ${activeTab === 'blancos' ? styles.tabPaneActive : styles.tabPaneHidden}`}>
              <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Blancos de la Situación</h2>
                <p className={styles.tabSubtitle}>
                  Tipos de blancos que aparecerán durante el ejercicio
                </p>
              </div>
              <div className={styles.targetsList}>
                {tabs.blancos?.items?.map((blanco, index) => {
                  const imageStatus = loadedImages[blanco.imagen];
                  const isLoaded = imageStatus === 'loaded';
                  const hasError = imageStatus === 'error';

                  return (
                    <div key={index} className={styles.targetItem}>
                      <div className={styles.targetImage}>
                        {(!isLoaded && !hasError) && (
                          <div className={styles.imageSkeleton}>
                            <div className={styles.skeletonPulse}></div>
                          </div>
                        )}
                        {hasError && (
                          <div className={styles.imageError}>
                            <Target size={32} />
                            <span>Error</span>
                          </div>
                        )}
                        {isLoaded && (
                          <img 
                            src={blanco.imagen} 
                            alt={blanco.nombre}
                            className={styles.imageLoaded}
                          />
                        )}
                      </div>
                      <h4 className={styles.targetName}>{blanco.nombre}</h4>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pestaña Condiciones */}
            <div className={`${styles.tabPane} ${activeTab === 'condiciones' ? styles.tabPaneActive : styles.tabPaneHidden}`}>
              <div className={styles.tabHeader}>
                <h2 className={styles.tabTitle}>Condiciones de Aprobación</h2>
                <p className={styles.tabSubtitle}>
                  Criterios necesarios para completar exitosamente el ejercicio
                </p>
              </div>
              
              {tabs.condiciones?.bloqueado ? (
                <div className={styles.lockedState}>
                  <div className={styles.lockIcon}>
                    <ClipboardCheck size={48} />
                  </div>
                  <h3 className={styles.lockedTitle}>Sin Evaluación</h3>
                  <p className={styles.lockedDescription}>
                    Este ejercicio no tiene condiciones de aprobación. 
                    Se utiliza para práctica y entrenamiento libre.
                  </p>
                </div>
              ) : (
                <div className={styles.conditionsList}>
                  {tabs.condiciones?.items?.map((condicion, index) => (
                    <div key={index} className={styles.conditionItem}>
                      <div className={styles.conditionNumber}>{index + 1}</div>
                      <p className={styles.conditionText}>{condicion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
