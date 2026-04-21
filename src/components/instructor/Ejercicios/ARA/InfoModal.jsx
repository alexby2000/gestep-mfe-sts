import React, { useState, useEffect } from 'react';
import { X, Ruler, Package, Clock, PersonStanding, Gavel, List, Target } from 'lucide-react';
import araIcon from '../../../../assets/tipos/ara.png';
import styles from './InfoModal.module.css';

export const InfoModal = ({ situacion, onClose }) => {
  const [imageStates, setImageStates] = useState({});

  // Precargar imágenes de blancos
  useEffect(() => {
    if (situacion && situacion.blancos) {
      const loadedImages = {};
      situacion.blancos.forEach(blanco => {
        if (!blanco.imagen || loadedImages[blanco.imagen]) return;
        loadedImages[blanco.imagen] = true;
        
        const img = new Image();
        img.onload = () => setImageStates(prev => ({ ...prev, [blanco.imagen]: 'loaded' }));
        img.onerror = () => {
          setImageStates(prev => ({ ...prev, [blanco.imagen]: 'error' }));
          // No reintentar - marcar como error permanentemente
        };
        img.src = blanco.imagen;
      });
    }
  }, [situacion]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!situacion) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={`${styles.iconContainer} ${situacion.arma === 'FAL' ? styles.fal : ''}`}>
              <img src={araIcon} alt="ARA" style={{width: '32px', height: '32px'}} />
            </div>
            <div>
              <div className={styles.badgeContainer}>
                <span className={`${styles.badge} ${situacion.arma === 'FAL' ? styles.fal : ''}`}>{situacion.arma === 'Pistola' ? 'Pistola' : 'Fusil'}</span>
                <span className={styles.id}>ID: {situacion.id || 'N/A'}</span>
              </div>
              <h2 className={styles.title}>{situacion.nombre || situacion.titulo || 'Sin título'}</h2>
            </div>
          </div>
          <button className={styles.closeBtn} type="button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        {/* Body */}
        <div className={styles.modalBody}>
          {/* Data Grid */}
          <div className={styles.dataGrid}>
            <div className={styles.dataItem}>
              <Ruler size={28} />
              <p className={styles.dataLabel}>Distancia</p>
              <p className={styles.dataValue}>{situacion.distancia ? `${situacion.distancia} metros` : 'N/A'}</p>
            </div>
            <div className={styles.dataItem}>
              <Package size={28} />
              <p className={styles.dataLabel}>Munición</p>
              <p className={styles.dataValue}>{situacion.municionTotal ? `${situacion.municionTotal} balas` : 'N/A'}</p>
            </div>
            <div className={styles.dataItem}>
              <Clock size={28} />
              <p className={styles.dataLabel}>Tiempo</p>
              <p className={styles.dataValue}>{situacion.tiempo === 'Sin límite' ? 'Sin límite' : `${situacion.tiempo} segundos`}</p>
            </div>
            <div className={styles.dataItem}>
              <PersonStanding size={28} />
              <p className={styles.dataLabel}>Postura</p>
              <p className={`${styles.dataValue} ${styles.posturaValue}`}>{situacion.postura || 'N/A'}</p>
            </div>
          </div>
          {/* Two Columns */}
          <div className={styles.twoColumns}>
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>
                <Gavel size={20} />
                Exigencia
              </h3>
              <p className={styles.columnText}>
                {situacion.exigencia || 'N/A'}
              </p>
            </div>
            <div className={styles.column}>
              <h3 className={styles.columnTitle}>
                <List size={20} />
                Procedimiento
              </h3>
              <p className={styles.columnText}>
                {situacion.procedimiento || 'N/A'}
              </p>
            </div>
          </div>

          {/* Blancos */}
          {situacion.blancos && situacion.blancos.length > 0 && (
            <div className={styles.blancosSection}>
              <h3 className={styles.blancosTitle}>
                <Target size={20} />
                Blancos de la Situación
              </h3>
              <div className={styles.blancosList}>
                {situacion.blancos.map((blanco, index) => {
                  const imageState = imageStates[blanco.imagen];

                  return (
                    <div key={index} className={styles.blancoItem}>
                      <div className={styles.blancoImage}>
                        {imageState === 'loaded' ? (
                          <img 
                            src={blanco.imagen} 
                            alt={blanco.nombre}
                            onError={(e) => {
                              if (e.target.getAttribute('data-error') !== 'true') {
                                e.target.setAttribute('data-error', 'true');
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="200"%3E%3Crect width="150" height="200" fill="%23ccc"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="12" fill="%23666" text-anchor="middle" dy=".3em"%3ESin Imagen%3C/text%3E%3C/svg%3E';
                              }
                            }}
                          />
                        ) : imageState === 'error' ? (
                          <img 
                            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='200'%3E%3Crect width='150' height='200' fill='%23ccc'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='%23666' text-anchor='middle' dy='.3em'%3ESin Imagen%3C/text%3E%3C/svg%3E"
                            alt="Imagen no disponible"
                          />
                        ) : null}
                      </div>
                      <h4 className={styles.blancoName}>{blanco.nombre}</h4>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* Footer removed as per request */}
      </div>
    </div>
  );
};