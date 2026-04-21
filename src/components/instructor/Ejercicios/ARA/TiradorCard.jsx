import React, { useState, useEffect } from 'react';
import { User, Target, Calendar, CheckCircle2, Circle, XCircle, ChevronDown } from 'lucide-react';
import { getBlancoImage } from '../../../../utils/blancoImages';
import styles from './TiradorCard.module.css';

/**
 * Tarjeta de visualización en tiempo real del rendimiento de un tirador
 * Muestra blanco(s), datos del tirador, munición, exigencias y progreso
 */
export const TiradorCard = ({ 
  tirador, 
  situacion,
  modo = 'ejercitacion',
  isMultiTirador = false,
  isExpanded = false,
  onExpand = () => {},
  gridPosition = 'center',
  isCompact = false
}) => {
  const [activeBlancoIndex, setActiveBlancoIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  
  const totalBlancos = situacion?.blancos?.length || 1;
  
  // Datos mock para visualización (luego vendrán del WebSocket)
  const mockData = {
    puntosTotales: 18,
    impactos: [
      { x: 45, y: 30, puntos: 5, numeroDisparo: 1 },
      { x: 52, y: 35, puntos: 4, numeroDisparo: 2 },
      { x: 48, y: 40, puntos: 5, numeroDisparo: 4 }, // El disparo 3 falló
      { x: 50, y: 32, puntos: 4, numeroDisparo: 5 }
    ],
    disparosFallados: [3], // Números de disparos que no impactaron en el blanco
    municionConsumida: 5, // 5 disparos totales (incluyendo el que falló)   
    exigencias: [
      { texto: 'Ningún tiro menor de 4', cumplida: true, enProceso: false },
      { texto: 'Total de 21 puntos', cumplida: false, enProceso: true }
    ],
    porcentajeCumplimiento: 50,
    aprobado: false
  };

  // Calcular días transcurridos desde fecha de evaluación (formato DD/MM/YYYY)
  const calcularDiasTranscurridos = (fechaStr) => {
    if (!fechaStr) return 0;
    const [dia, mes, anio] = fechaStr.split('/');
    const fechaEvaluacion = new Date(anio, mes - 1, dia);
    const hoy = new Date();
    const diferencia = hoy - fechaEvaluacion;
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  };

  const getExigenciaIcon = (exigencia) => {
    if (exigencia.cumplida) return <CheckCircle2 size={16} className={styles.iconCumplida} />;
    if (exigencia.enProceso) return <Circle size={16} className={styles.iconProceso} />;
    return <XCircle size={16} className={styles.iconIncumplida} />;
  };

  // Rotación automática de blancos
  useEffect(() => {
    if (totalBlancos > 1 && isAutoRotating) {
      const interval = setInterval(() => {
        setActiveBlancoIndex((prev) => (prev + 1) % totalBlancos);
      }, 3000); // Cambiar cada 3 segundos
      
      return () => clearInterval(interval);
    }
  }, [totalBlancos, isAutoRotating]);

  const handleBlancoSelect = (index) => {
    setActiveBlancoIndex(index);
    setIsAutoRotating(false);
    // Reanudar rotación automática después de 10 segundos
    setTimeout(() => setIsAutoRotating(true), 10000);
  };

  const handleCardClick = (e) => {
    if (isMultiTirador) {
      e.stopPropagation();
      onExpand();
    }
  };

  return (
    <div 
      className={`
        ${styles.card} 
        ${isMultiTirador ? styles.expandible : ''}
        ${isExpanded ? styles.expanded : ''}
        ${isCompact ? styles.compact : ''}
        ${modo === 'evaluacion' ? styles.evaluacion : ''}
        ${styles[`position${gridPosition.charAt(0).toUpperCase()}${gridPosition.slice(1)}`]}
      `}
      onClick={isMultiTirador ? handleCardClick : undefined}
      style={{ cursor: isMultiTirador ? (isExpanded ? 'default' : 'pointer') : 'default' }}
    >
      {/* Información del tirador */}
      <div className={styles.infoSection}>
        <div className={styles.tiradorHeader}>
          <div className={styles.tiradorNombre}>
            <User size={18} />
            <div>
              <h3>{tirador.nombre} {tirador.apellido}</h3>
              <span className={styles.tiradorDni}>DNI: {tirador.dni}</span>
            </div>
          </div>
          <span className={styles.rangoBadge}>{tirador.especialidad || 'Sin especialidad'}</span>
        </div>

        <div className={styles.historial}>
          <div className={styles.historialHeader}>
            <div className={styles.historialHeaderLeft}>
              <Calendar size={14} />
              <span className={styles.historialTitle}>Última Evaluación</span>
            </div>
            <ChevronDown size={14} className={styles.chevronIcon} />
          </div>
          {tirador.ultimaEvaluacion && (
            <div className={styles.evaluacionDetalle}>
              <div className={styles.evaluacionRow}>
                <span className={styles.evaluacionLabel}>Fecha:</span>
                <span className={styles.evaluacionValue}>{tirador.ultimaEvaluacion.fecha}</span>
              </div>
              <div className={styles.evaluacionRow}>
                <span className={styles.evaluacionLabel}>Hace:</span>
                <span className={styles.evaluacionValue}>
                  {calcularDiasTranscurridos(tirador.ultimaEvaluacion.fecha)} días
                </span>
              </div>
              <div className={styles.evaluacionRow}>
                <span className={styles.evaluacionLabel}>Situación:</span>
                <span className={styles.evaluacionValue}>{tirador.ultimaEvaluacion.situacion}</span>
              </div>
              <div className={styles.evaluacionRow}>
                <span className={styles.evaluacionLabel}>Arma:</span>
                <span className={styles.evaluacionValue}>{tirador.ultimaEvaluacion.arma}</span>
              </div>
            </div>
          )}
        </div>

        {/* Munición */}
        <div className={styles.municionBar}>
          <div className={styles.municionHeader}>
            <span>Munición</span>
            <span>{mockData.municionConsumida}/{situacion?.municionTotal || 0}</span>
          </div>
          <div 
            className={styles.municionProgress}
            style={{ '--municion-total': situacion?.municionTotal || 5 }}
          >
            <div 
              className={styles.municionFill}
              style={{ width: `${(mockData.municionConsumida / (situacion?.municionTotal || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Exigencias */}
        <div className={styles.exigencias}>
          <h4>Exigencias</h4>
          <div className={styles.exigenciasList}>
            {mockData.exigencias.map((exigencia, idx) => (
              <div key={idx} className={styles.exigenciaItem}>
                {getExigenciaIcon(exigencia)}
                <span>{exigencia.texto}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Barra de cumplimiento */}
        <div className={styles.cumplimientoSection}>
          <div className={styles.cumplimientoHeader}>
            <span>Cumplimiento</span>
            <span className={`${styles.porcentaje} ${mockData.aprobado ? styles.aprobado : styles.desaprobado}`}>
              {mockData.porcentajeCumplimiento}%
            </span>
          </div>
          <div className={styles.cumplimientoBar}>
            <div 
              className={`${styles.cumplimientoFill} ${mockData.aprobado ? styles.aprobado : styles.desaprobado}`}
              style={{ width: `${mockData.porcentajeCumplimiento}%` }}
            />
          </div>
          <div className={`${styles.resultadoLabel} ${mockData.aprobado ? styles.aprobado : styles.desaprobado}`}>
            {mockData.aprobado ? 'APROBADO' : 'DESAPROBADO'}
          </div>
        </div>
      </div>

      {/* Sección del blanco */}
      <div className={styles.blancoSection}>
        <div className={styles.blancoContainer}>
          {situacion?.blancos && situacion.blancos.length > 0 ? (
            <>
              {/* Lista de disparos fallados */}
              {mockData.disparosFallados && mockData.disparosFallados.length > 0 && (
                <div className={styles.disparosFallados}>
                  {mockData.disparosFallados.map((numDisparo, idx) => (
                    <div key={idx} className={styles.disparoFalladoRow}>
                      <span className={styles.iconFallado}>✕</span>
                      <div className={styles.disparoFallado}>
                        <span className={styles.numeroFallado}>{numDisparo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <img 
                src={situacion.blancos[activeBlancoIndex].imagen} 
                alt={situacion.blancos[activeBlancoIndex].nombre}
                className={styles.blancoImage}
                onError={(e) => {
                  if (e.target.getAttribute('data-error') !== 'true') {
                    e.target.setAttribute('data-error', 'true');
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23ccc"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="16" fill="%23666" text-anchor="middle" dy=".3em"%3ESin Imagen%3C/text%3E%3C/svg%3E';
                  }
                }}
              />
              {/* Impactos en el blanco */}
              {mockData.impactos.map((impacto, idx) => (
                <div
                  key={idx}
                  className={styles.impacto}
                  style={{ left: `${impacto.x}%`, top: `${impacto.y}%` }}
                >
                  <span className={styles.puntosImpacto}>{impacto.numeroDisparo}</span>
                </div>
              ))}
              
              {/* Selector de blancos (solo si hay múltiples) */}
              {totalBlancos > 1 && (
                <div className={styles.blancoSelector}>
                  {situacion.blancos.map((_, idx) => (
                    <button
                      key={idx}
                      className={`${
                        styles.blancoButton
                      } ${idx === activeBlancoIndex ? styles.active : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBlancoSelect(idx);
                      }}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.sinBlanco}>Sin blanco</div>
          )}
        </div>
        <div className={styles.puntosTotales}>
          <Target size={16} />
          <span>{mockData.puntosTotales} pts</span>
        </div>
      </div>
    </div>
  );
};
