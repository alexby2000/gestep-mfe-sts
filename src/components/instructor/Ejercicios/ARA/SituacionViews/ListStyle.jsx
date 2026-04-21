import React, { useState } from "react";
import { Info } from 'lucide-react';
import { InfoModal } from '../InfoModal';
import styles from "./ListStyle.module.css";

/**
 * Vista tipo lista para situaciones de ARA
 * @param {Object} situacionesAgrupadas - Objeto con arrays de situaciones por arma
 * @param {string} filterArma - Filtro actual: 'Todas', 'Pistola', 'FAL'
 * @param {Function} onSelect - Callback al seleccionar una situación
 */
export default function ListStyle({ situacionesAgrupadas, filterArma, onSelect, animating }) {
  const [selectedSitForInfo, setSelectedSitForInfo] = useState(null);
  const renderSection = (title, situaciones) => {
    if (!situaciones || situaciones.length === 0) return null;

    return (
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.tableView}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Situación</th>
                <th>Distancia<br/>(metros)</th>
                <th>Tiempo<br/>(segundos)</th>
                <th>Munición Total<br/>(balas)</th>
                <th>Postura</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              {situaciones.map(sit => (
                <tr 
                  key={sit.id}
                  className={styles.tableRow}
                  onClick={() => onSelect && onSelect(sit)}
                >
                  <td>{sit.nombre || sit.titulo}</td>
                  <td>{sit.distancia}</td>
                  <td>{!isNaN(sit.tiempo) ? sit.tiempo : (sit.tiempo === 'Sin límite' ? 'Sin límite' : sit.tiempo)}</td>
                  <td>{sit.municionTotal}</td>
                  <td>{sit.postura}</td>
                  <td>
                    <button
                      className={styles.infoButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSitForInfo(sit);
                      }}
                    >
                      <Info size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.listContainer} ${animating ? styles.animating : ''}`}>
      {filterArma === 'Todas' ? (
        <>
          {renderSection('Pistola 9mm', situacionesAgrupadas.Pistola)}
          {renderSection('Fusil FAL', situacionesAgrupadas.FAL)}
        </>
      ) : filterArma === 'Pistola' ? (
        renderSection('Pistola 9mm', situacionesAgrupadas.Pistola)
      ) : (
        renderSection('Fusil FAL', situacionesAgrupadas.FAL)
      )}
      {selectedSitForInfo && (
        <InfoModal
          situacion={selectedSitForInfo}
          onClose={() => setSelectedSitForInfo(null)}
        />
      )}
    </div>
  );
}
