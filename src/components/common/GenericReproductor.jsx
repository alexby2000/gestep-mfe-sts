import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RotateCcw, WifiOff, AlertTriangle, Ruler, Package, Clock, User, Clock12 } from 'lucide-react';
import { webSocketService } from '../../services/webSocketService';
import styles from './GenericReproductor.module.css';

/**
 * Componente reproductor genérico para ejercicios
 * Este componente renderiza el header común y permite inyectar contenido específico según el tipo de ejercicio
 */
export const GenericReproductor = ({ 
  tipoEjercicio, 
  children, 
  onReiniciar, 
  modo = 'ejercitacion', 
  estadoEjercicio = 'ejecutando',
  tiempoRestante = null,
  formatearTiempo = null
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { situacion, numTiradores } = location.state || {};
  
  // Calcular tiempo total y porcentaje
  const tiempoTotal = situacion?.tiempo !== 'Sin límite' ? parseInt(situacion?.tiempo) : null;
  const porcentajeRestante = tiempoTotal && tiempoRestante !== null 
    ? (tiempoRestante / tiempoTotal) * 100 
    : 100;
  
  // Determinar color de la barra según porcentaje
  const getBarColor = () => {
    if (porcentajeRestante > 50) return '#10b981'; // verde
    if (porcentajeRestante > 25) return '#f59e0b'; // amarillo
    return '#ef4444'; // rojo
  };
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Escuchar desconexiones
  useEffect(() => {
    const handleConnectionLost = (data) => {
      // Solo mostrar si no fue desconexión manual
      if (!data.wasManual) {
        setShowDisconnectModal(true);
      }
    };

    webSocketService.addListener('connection_lost', handleConnectionLost);

    return () => {
      webSocketService.removeListener('connection_lost', handleConnectionLost);
    };
  }, []);

  const handleVolver = () => {
    // Detener ejercicio (cambiar a escena intro)
    try {
      webSocketService.cambiarEscena('Intro');
    } catch (error) {
      console.error('Error al detener ejercicio:', error);
    }
    
    // Navegar de vuelta a la vista del ejercicio
    navigate(`/instructor/ejercicios/${tipoEjercicio}`);
  };

  const handleContinuarSinConexion = () => {
    setShowDisconnectModal(false);
  };

  const handleVolverAtras = () => {
    setShowDisconnectModal(false);
    navigate(`/instructor/ejercicios/${tipoEjercicio}`);
  };

  const handleReiniciar = () => {
    // Reiniciar escena actual
    if (situacion?.nombreEscena) {
      try {
        webSocketService.cambiarEscena(situacion.nombreEscena);
        
        // Llamar callback de reinicio si existe (para resetear valores)
        if (onReiniciar) {
          onReiniciar();
        }
      } catch (error) {
        console.error('Error al reiniciar escena:', error);
      }
    }
  };

  return (
    <div className={styles.reproductorContainer}>
      {/* Header con controles */}
      <div className={`${styles.reproductorHeader} ${modo === 'evaluacion' ? styles.evaluacion : ''}`}>
        <button 
          className={styles.headerButton}
          onClick={handleVolver}
          title="Volver atrás"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        <div className={styles.headerInfo}>
          <div className={styles.titleRow}>
            <span className={styles.headerTitle}>{situacion?.nombre || 'Ejercicio'}</span>
            {situacion?.arma && (
              <span className={`${styles.armaBadge} ${styles[situacion.arma === 'Pistola' ? 'pistola' : 'fusil']}`}>
                {situacion.arma}
              </span>
            )}
          </div>
          {situacion && (
            <div className={styles.situacionStats}>
              <div className={styles.stat}>
                <Ruler size={14} />
                <span>{situacion.distancia} metros</span>
              </div>
              <div className={styles.stat}>
                <Package size={14} />
                <span>{situacion.municionTotal} balas</span>
              </div>
              <div className={styles.stat}>
                <Clock size={14} />
                <span>{situacion.tiempo === 'Sin límite' ? 'Sin límite' : `${situacion.tiempo} segundos`}</span>
              </div>
              <div className={styles.stat}>
                <User size={14} />
                <span>{situacion.postura}</span>
              </div>
            </div>
          )}
        </div>

        {/* Contador de tiempo (en el medio) */}
        {estadoEjercicio === 'ejecutando' && tiempoRestante !== null && tiempoTotal && formatearTiempo && (
          <div className={styles.timerContainer}>
            <div className={styles.timerDisplay}>
              <div className={styles.clockIcon}>
                <Clock12 size={20} />
              </div>
              <div className={styles.timerText}>
                <span className={styles.timerValue}>{tiempoRestante}</span>
                <span className={styles.timerUnit}>segundos</span>
              </div>
            </div>
            <div className={styles.progressBarContainer}>
              <div 
                className={styles.progressBar}
                style={{ 
                  width: `${porcentajeRestante}%`,
                  backgroundColor: getBarColor()
                }}
              />
            </div>
          </div>
        )}

        <button 
          className={styles.headerButton}
          onClick={handleReiniciar}
          title="Reiniciar ejercicio"
        >
          <RotateCcw size={20} />
          <span>Reiniciar</span>
        </button>

        {/* Badge de estado como colgante */}
        <div className={`${styles.estadoColgante} ${styles[estadoEjercicio.replace('-', '')]}`}>
          {estadoEjercicio === 'pre-inicio' && 'Esperando Inicio'}
          {estadoEjercicio === 'ejecutando' && 'En Ejecución'}
          {estadoEjercicio === 'finalizado' && 'Finalizado'}
        </div>
      </div>

      {/* Contenido específico del ejercicio */}
      <div className={styles.reproductorContent}>
        {children}
      </div>

      {/* Modal de desconexión */}
      {showDisconnectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalIcon}>
              <WifiOff size={48} />
            </div>
            <h2 className={styles.modalTitle}>Conexión Perdida</h2>
            <p className={styles.modalMessage}>
              Se ha perdido la conexión con el simulador. Los controles no funcionarán hasta que se restablezca la conexión.
            </p>
            <div className={styles.modalActions}>
              <button 
                className={styles.modalButtonSecondary}
                onClick={handleVolverAtras}
              >
                <ArrowLeft size={18} />
                <span>Volver Atrás</span>
              </button>
              <button 
                className={styles.modalButtonPrimary}
                onClick={handleContinuarSinConexion}
              >
                <AlertTriangle size={18} />
                <span>Continuar Sin Conexión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
