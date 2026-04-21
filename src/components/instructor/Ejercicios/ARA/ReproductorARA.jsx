import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { GenericReproductor } from '../../../common/GenericReproductor';
import { TiradorCard } from './TiradorCard';
import { webSocketService } from '../../../../services/webSocketService';
import styles from './ReproductorARA.module.css';

/**
 * Vista de reproductor específica para ejercicios ARA
 */
export const ReproductorARA = () => {
  const location = useLocation();
  const { situacion, tiradores, cantidadTiradores, modo } = location.state || {};
  const [expandedIndex, setExpandedIndex] = useState(null);
  
  // Estados del ejercicio
  const [estadoEjercicio, setEstadoEjercicio] = useState('pre-inicio'); // 'pre-inicio' | 'ejecutando' | 'finalizado'
  const [tiempoRestante, setTiempoRestante] = useState(situacion?.tiempo !== 'Sin límite' ? parseInt(situacion?.tiempo) : null);

  // Escuchar eventos de WebSocket
  useEffect(() => {
    const handleEjercicioIniciado = () => {
      setEstadoEjercicio('ejecutando');
    };

    const handleEjercicioFinalizado = () => {
      setEstadoEjercicio('finalizado');
    };

    webSocketService.addListener('ejercicio_iniciado', handleEjercicioIniciado);
    webSocketService.addListener('ejercicio_finalizado', handleEjercicioFinalizado);

    return () => {
      webSocketService.removeListener('ejercicio_iniciado', handleEjercicioIniciado);
      webSocketService.removeListener('ejercicio_finalizado', handleEjercicioFinalizado);
    };
  }, []);

  // Simulación temporal con tecla Enter (inicio -> ejecución -> finalizado)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        if (estadoEjercicio === 'pre-inicio') {
          setEstadoEjercicio('ejecutando');
        } else if (estadoEjercicio === 'ejecutando') {
          setEstadoEjercicio('finalizado');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [estadoEjercicio]);

  // Contador regresivo
  useEffect(() => {
    if (estadoEjercicio === 'ejecutando' && tiempoRestante !== null && tiempoRestante > 0) {
      const interval = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [estadoEjercicio, tiempoRestante]);

  // Formatear tiempo en segundos
  const formatearTiempo = (segundos) => {
    return `${segundos}s`;
  };

  // Determinar clase de grilla según cantidad de tiradores
  const getGridClass = () => {
    if (!cantidadTiradores || cantidadTiradores === 1) return styles.grid1x1;
    if (cantidadTiradores === 2) return styles.grid1x2;
    return styles.grid2x2; // 3-4 tiradores
  };

  // Determinar posición de la tarjeta en el grid (izquierda/derecha)
  const getCardPosition = (idx) => {
    if (cantidadTiradores === 1) return 'center';
    if (cantidadTiradores === 2) return idx === 0 ? 'left' : 'right';
    // Para 3-4 tiradores (grid 2x2)
    return idx % 2 === 0 ? 'left' : 'right';
  };

  return (
    <GenericReproductor 
      tipoEjercicio="ara" 
      modo={modo} 
      estadoEjercicio={estadoEjercicio}
      tiempoRestante={tiempoRestante}
      formatearTiempo={formatearTiempo}
    >
      {expandedIndex !== null && (
        <div 
          className={styles.overlay} 
          onClick={() => setExpandedIndex(null)}
        />
      )}

      <div className={`${styles.araContainer} ${getGridClass()}`}>
        {tiradores && tiradores.length > 0 ? (
          tiradores.map((tirador, idx) => (
            <TiradorCard
              key={idx}
              tirador={tirador}
              situacion={situacion}
              modo={modo}
              isMultiTirador={cantidadTiradores > 1}
              isExpanded={expandedIndex === idx}
              onExpand={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
              gridPosition={getCardPosition(idx)}
              isCompact={cantidadTiradores > 2}
              estadoEjercicio={estadoEjercicio}
            />
          ))
        ) : (
          <div className={styles.noTiradores}>
            <p>No hay tiradores seleccionados</p>
          </div>
        )}
      </div>
    </GenericReproductor>
  );
};
