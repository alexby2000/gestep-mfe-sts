import React, { useState } from "react";
import { Info, Ruler, Package, Clock, PersonStanding } from 'lucide-react';
import { InfoModal } from '../InfoModal';
import styles from "./NetflixStyle.module.css";

/**
 * Vista tipo "netflix" (cards/grid) para situaciones de ARA
 * @param {Object} situacionesAgrupadas - Objeto con arrays de situaciones por arma
 * @param {string} filterArma - Filtro actual: 'Todas', 'Pistola', 'FAL'
 * @param {Function} onSelect - Callback al seleccionar una situación
 */
export default function NetflixStyle({ situacionesAgrupadas, filterArma, onSelect, animating }) {
  const [selectedSitForInfo, setSelectedSitForInfo] = useState(null);
  const renderSection = (title, situaciones) => {
    if (situaciones.length === 0) return null;

    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.cardsGrid}>
          {situaciones.map(sit => (
            <div
              key={sit.id}
              className={`${styles.card} hover-lift cursor-pointer group`}
              onClick={() => onSelect && onSelect(sit)}
            >
              <div className={styles.cardImgWrap}>
                <img src={sit.imagen} alt={sit.nombre} className={styles.cardImg} onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150/ccc/000?text=No+Image'; }} />
                <span className={`${styles.armaOverlay} ${styles[sit.arma === 'Pistola' ? 'pistola' : 'fusil']}`}>{sit.arma}</span>
                <button
                  className={styles.infoIcon}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSitForInfo(sit);
                  }}
                >
                  <Info size={18} />
                </button>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{sit.nombre || sit.titulo}</h3>
                {sit.descripcion ? (
                  <p className={styles.cardDesc}>{sit.descripcion}</p>
                ) : null}
                <div className={`${styles.cardStats} ${!sit.descripcion ? styles.compactStats : ''}`}>
                  {!sit.descripcion ? (
                    <>
                      <div className={styles.statsRow}>
                        <div className={styles.stat}>
                          <Ruler size={14} />
                          <span>{sit.distancia} metros</span>
                        </div>
                        <div className={styles.stat}>
                          <Package size={14} />
                          <span>{sit.municionTotal} balas</span>
                        </div>
                        <div className={styles.stat}>
                          <Clock size={14} />
                          <span>{sit.tiempo === 'Sin límite' ? 'Sin límite' : `${sit.tiempo} segundos`}</span>
                        </div>
                      </div>
                      <div className={styles.statsRow}>
                        <div className={styles.stat}>
                          <PersonStanding size={14} />
                          <span>{sit.postura}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.stat}>
                        <Ruler size={14} />
                        <span>{sit.distancia}</span>
                      </div>
                      <div className={styles.stat}>
                        <Package size={14} />
                        <span>{sit.municionTotal} balas</span>
                      </div>
                      <div className={styles.stat}>
                        <Clock size={14} />
                        <span>{sit.tiempo === 'Sin límite' ? 'Sin límite' : sit.tiempo}</span>
                      </div>
                      <div className={styles.stat}>
                        <PersonStanding size={14} />
                        <span>{sit.postura}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  let content;
  if (filterArma === 'Todas') {
    content = (
      <>
        {renderSection('Pistola 9mm', situacionesAgrupadas?.Pistola || [])}
        {renderSection('Fusil FAL', situacionesAgrupadas?.FAL || [])}
      </>
    );
  } else if (filterArma === 'Pistola') {
    content = renderSection('Pistola 9mm', situacionesAgrupadas?.Pistola || []);
  } else {
    content = renderSection('Fusil FAL', situacionesAgrupadas?.FAL || []);
  }

  return (
    <div className={`${styles.netflixContainer} ${animating ? styles.animating : ''}`}>
      {content}
      {selectedSitForInfo && (
        <InfoModal
          situacion={selectedSitForInfo}
          onClose={() => setSelectedSitForInfo(null)}
        />
      )}
    </div>
  );
}