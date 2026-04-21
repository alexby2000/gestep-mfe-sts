import React, { useState, useEffect } from "react";
import { Info, Ruler, Package, Clock, PersonStanding } from 'lucide-react';
import { InfoModal } from '../InfoModal';
import { getBlancoImage } from '../../../../../utils/blancoImages';
import styles from "./TableStyle.module.css";

/**
 * Vista tipo tabla/tarjetas de ancho completo para situaciones de ARA
 * @param {Object} situacionesAgrupadas - Objeto con arrays de situaciones por arma
 * @param {string} filterArma - Filtro actual: 'Todas', 'Pistola', 'FAL'
 * @param {Function} onSelect - Callback al seleccionar una situación
 */
export default function TableStyle({ situacionesAgrupadas, filterArma, onSelect, animating }) {
  const [selectedSitForInfo, setSelectedSitForInfo] = useState(null);
  const [currentBlancoIndexes, setCurrentBlancoIndexes] = useState({});
  const [failedImages, setFailedImages] = useState(new Set());

  // Carrusel automático para blancos múltiples
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBlancoIndexes(prev => {
        const newIndexes = { ...prev };
        // Actualizar el índice de cada situación que tiene múltiples blancos
        Object.keys(newIndexes).forEach(sitId => {
          const sit = [...(situacionesAgrupadas.Pistola || []), ...(situacionesAgrupadas.FAL || [])]
            .find(s => s.id === parseInt(sitId));
          if (sit && sit.blancos && sit.blancos.length > 1) {
            // Solo rotar si no todas las imágenes han fallado
            const allImagesFailed = sit.blancos.every(b => failedImages.has(b.imagen));
            if (!allImagesFailed) {
              newIndexes[sitId] = (newIndexes[sitId] + 1) % sit.blancos.length;
            }
          }
        });
        return newIndexes;
      });
    }, 1500); // Cambiar cada 1.5 segundos

    return () => clearInterval(interval);
  }, [situacionesAgrupadas, failedImages]);

  const renderSection = (title, situaciones) => {
    if (situaciones.length === 0) return null;

    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.tableContainer}>
          {situaciones.map(sit => {
            // Inicializar el índice del blanco si no existe
            if (sit.blancos && sit.blancos.length > 0 && !(sit.id in currentBlancoIndexes)) {
              setCurrentBlancoIndexes(prev => ({ ...prev, [sit.id]: 0 }));
            }

            const currentBlancoIndex = currentBlancoIndexes[sit.id] || 0;
            const currentBlanco = sit.blancos && sit.blancos[currentBlancoIndex];
            const hasManyBlancos = sit.blancos && sit.blancos.length > 1;

            return (
              <div
                key={sit.id}
                className={`${styles.tableRow} ${animating ? styles.animating : ''}`}
                onClick={() => onSelect && onSelect(sit)}
              >
                {/* Imagen de blancos */}
                <div className={styles.imageContainer}>
                  {currentBlanco ? (
                    <>
                      <img 
                        src={currentBlanco.imagen} 
                        alt={currentBlanco.nombre} 
                        className={`${styles.blancoImage} ${hasManyBlancos ? styles.carousel : ''}`}
                        onError={(e) => {
                          if (e.target.getAttribute('data-error') !== 'true') {
                            e.target.setAttribute('data-error', 'true');
                            setFailedImages(prev => new Set([...prev, currentBlanco.imagen]));
                            // Imagen base64 1x1 gris transparente
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="100"%3E%3Crect width="150" height="100" fill="%23ccc"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="12" fill="%23666" text-anchor="middle" dy=".3em"%3ESin Imagen%3C/text%3E%3C/svg%3E';
                          }
                        }} 
                      />
                      {hasManyBlancos && (
                        <div className={styles.carouselIndicators}>
                          {sit.blancos.map((_, index) => (
                            <span 
                              key={index} 
                              className={`${styles.indicator} ${index === currentBlancoIndex ? styles.active : ''}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <img 
                      src="https://via.placeholder.com/150x100/ccc/000?text=Sin+Blanco" 
                      alt="Sin blanco" 
                      className={styles.blancoImage}
                    />
                  )}
                </div>

                {/* Contenido principal */}
                <div className={styles.contentContainer}>
                  {/* Badge del arma */}
                  <span className={`${styles.armaBadge} ${styles[sit.arma === 'Pistola' ? 'pistola' : 'fusil']}`}>
                    {sit.arma}
                  </span>

                  {/* Título */}
                <h3 className={styles.title}>{sit.nombre || sit.titulo}</h3>

                {/* Exigencia como descripción */}
                <p className={styles.description}>{sit.exigencia}</p>

                {/* Iconos informativos */}
                <div className={styles.statsBar}>
                  <div className={styles.stat}>
                    <Ruler size={16} />
                    <span>{sit.distancia}m</span>
                  </div>
                  <div className={styles.stat}>
                    <Package size={16} />
                    <span>{sit.municionTotal} balas</span>
                  </div>
                  <div className={styles.stat}>
                    <Clock size={16} />
                    <span>{sit.tiempo === 'Sin límite' ? 'Sin límite' : `${sit.tiempo}s`}</span>
                  </div>
                  <div className={styles.stat}>
                    <PersonStanding size={16} />
                    <span>{sit.postura}</span>
                  </div>
                </div>
              </div>

              {/* Botón de info */}
              <button
                className={styles.infoButton}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSitForInfo(sit);
                }}
              >
                <Info size={20} />
              </button>
            </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.wrapper}>
      {filterArma === 'Todas' && (
        <>
          {renderSection('Pistola 9mm', situacionesAgrupadas.Pistola)}
          {renderSection('Fusil FAL', situacionesAgrupadas.FAL)}
        </>
      )}
      {filterArma === 'Pistola' && renderSection('Pistola 9mm', situacionesAgrupadas.Pistola)}
      {filterArma === 'FAL' && renderSection('Fusil FAL', situacionesAgrupadas.FAL)}

      {selectedSitForInfo && (
        <InfoModal
          situacion={selectedSitForInfo}
          onClose={() => setSelectedSitForInfo(null)}
        />
      )}
    </div>
  );
}
