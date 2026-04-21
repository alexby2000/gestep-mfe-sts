import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Target, Wind, Eye, Ruler, Navigation } from 'lucide-react';
import { GenericReproductor } from '../../../common/GenericReproductor';
import styles from './ReproductorGenericas.module.css';
import pistola9mm from '../../../../assets/armas/pistola9mm.png';
import fusil from '../../../../assets/armas/fusil.svg';
import { webSocketService } from '../../../../services/webSocketService';

/**
 * Vista de reproductor específica para ejercicios Genericas
 */
// Valores por defecto
const DEFAULT_TIRADOR_STATE = {
  altura: 1.70,
  distanciaBlanco: 10,
  arma: 'Pistola'
};

const DEFAULT_ESCENARIO_STATE = {
  miraVisual: false,
  vientoActivo: false,
  velocidadViento: 0.0,
  direccionViento: 0
};

export const ReproductorGenericas = () => {
  const location = useLocation();
  const { situacion, numTiradores } = location.state || {};

  // Estado para tirador 1
  const [tirador1, setTirador1] = useState(DEFAULT_TIRADOR_STATE);

  // Estado para tirador 2 (si aplica)
  const [tirador2, setTirador2] = useState(DEFAULT_TIRADOR_STATE);

  // Estado global del escenario
  const [escenario, setEscenario] = useState(DEFAULT_ESCENARIO_STATE);

  // Refs para throttling de WebSocket
  const throttleTimers = useRef({});
  const THROTTLE_DELAY = 100; // ms entre mensajes del mismo tipo

  // Función de throttling genérica
  const throttledSend = useCallback((key, callback) => {
    // Cancelar timer anterior si existe
    if (throttleTimers.current[key]) {
      clearTimeout(throttleTimers.current[key]);
    }
    
    // Crear nuevo timer
    throttleTimers.current[key] = setTimeout(() => {
      try {
        callback();
      } catch (error) {
        console.error(`Error al enviar mensaje throttled (${key}):`, error);
      }
      delete throttleTimers.current[key];
    }, THROTTLE_DELAY);
  }, []);

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      Object.values(throttleTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const armasDisponibles = [
    { 
      nombre: 'Pistola', 
      imagen: pistola9mm,
      descripcion: 'Velocidad: 90 m/s',
      tipo: 0
    },
    { 
      nombre: 'Fal', 
      imagen: fusil,
      descripcion: 'Velocidad: 200 m/s',
      tipo: 1
    },
    { 
      nombre: 'Arma Ficticia', 
      imagen: pistola9mm,
      descripcion: 'Vel: 10 m/s\nGravedad: -10%',
      tipo: 2
    }
  ];

  const handleTirador1Change = (field, value) => {
    // Actualizar estado inmediatamente para UI responsiva
    setTirador1(prev => ({ ...prev, [field]: value }));
    
    // Enviar por WebSocket con throttling
    if (field === 'altura') {
      throttledSend('tirador1_altura', () => {
        webSocketService.setAlturaTirador(0, value);
      });
    } else if (field === 'distanciaBlanco') {
      throttledSend('tirador1_distancia', () => {
        webSocketService.setDistanciaBlanco(0, value);
      });
    } else if (field === 'arma') {
      // Arma se envía inmediatamente (no es slider)
      const armaSeleccionada = armasDisponibles.find(a => a.nombre === value);
      if (armaSeleccionada) {
        try {
          webSocketService.setArmaTirador(0, armaSeleccionada.tipo);
        } catch (error) {
          console.error('Error al enviar arma de tirador 1:', error);
        }
      }
    }
  };

  const handleTirador2Change = (field, value) => {
    // Actualizar estado inmediatamente para UI responsiva
    setTirador2(prev => ({ ...prev, [field]: value }));
    
    // Enviar por WebSocket con throttling
    if (field === 'altura') {
      throttledSend('tirador2_altura', () => {
        webSocketService.setAlturaTirador(1, value);
      });
    } else if (field === 'distanciaBlanco') {
      throttledSend('tirador2_distancia', () => {
        webSocketService.setDistanciaBlanco(1, value);
      });
    } else if (field === 'arma') {
      // Arma se envía inmediatamente (no es slider)
      const armaSeleccionada = armasDisponibles.find(a => a.nombre === value);
      if (armaSeleccionada) {
        try {
          webSocketService.setArmaTirador(1, armaSeleccionada.tipo);
        } catch (error) {
          console.error('Error al enviar arma de tirador 2:', error);
        }
      }
    }
  };

  const handleEscenarioChange = (field, value) => {
    // Actualizar estado inmediatamente para UI responsiva
    setEscenario(prev => {
      const newState = { ...prev, [field]: value };
      
      // Toggles se envían inmediatamente
      if (field === 'miraVisual') {
        try {
          webSocketService.setMostrarMiraVisual(value);
        } catch (error) {
          console.error('Error al enviar mira visual:', error);
        }
      } else if (field === 'vientoActivo') {
        try {
          webSocketService.setHabilitarViento(value);
          // Si se desactiva el viento, enviar parámetros en 0
          if (!value) {
            webSocketService.setParametrosViento(0, 0);
          } else {
            // Si se activa, enviar los valores actuales
            webSocketService.setParametrosViento(prev.direccionViento, prev.velocidadViento);
          }
        } catch (error) {
          console.error('Error al enviar estado del viento:', error);
        }
      } else if (field === 'velocidadViento' || field === 'direccionViento') {
        // Sliders de viento con throttling
        if (newState.vientoActivo) {
          const direccion = field === 'direccionViento' ? value : newState.direccionViento;
          const velocidad = field === 'velocidadViento' ? value : newState.velocidadViento;
          
          throttledSend('viento_params', () => {
            webSocketService.setParametrosViento(direccion, velocidad);
          });
        }
      }
      
      return newState;
    });
  };

  // Función para resetear todos los valores a por defecto
  const resetToDefaults = useCallback(() => {
    // Resetear estados
    setTirador1(DEFAULT_TIRADOR_STATE);
    setTirador2(DEFAULT_TIRADOR_STATE);
    setEscenario(DEFAULT_ESCENARIO_STATE);

    // Enviar valores por defecto al simulador
    try {
      // Altura y distancia para tiradores
      webSocketService.setAlturaTirador(0, DEFAULT_TIRADOR_STATE.altura);
      webSocketService.setDistanciaBlanco(0, DEFAULT_TIRADOR_STATE.distanciaBlanco);
      webSocketService.setArmaTirador(0, 0); // Pistola = tipo 0

      if (numTiradores === 2) {
        webSocketService.setAlturaTirador(1, DEFAULT_TIRADOR_STATE.altura);
        webSocketService.setDistanciaBlanco(1, DEFAULT_TIRADOR_STATE.distanciaBlanco);
        webSocketService.setArmaTirador(1, 0);
      }

      // Escenario
      webSocketService.setMostrarMiraVisual(DEFAULT_ESCENARIO_STATE.miraVisual);
      webSocketService.setHabilitarViento(DEFAULT_ESCENARIO_STATE.vientoActivo);
      webSocketService.setParametrosViento(
        DEFAULT_ESCENARIO_STATE.direccionViento,
        DEFAULT_ESCENARIO_STATE.velocidadViento
      );
    } catch (error) {
      console.error('Error al resetear valores:', error);
    }
  }, [numTiradores]);

  const renderTiradorControls = (tiradorNum, tiradorData, handleChange) => (
    <div className={styles.tiradorCard}>
      {numTiradores === 2 && (
        <div className={styles.tiradorHeader}>
          <User size={20} />
          <h3>Tirador {tiradorNum}</h3>
        </div>
      )}

      {/* Altura del tirador */}
      <div className={styles.controlGroup}>
        <div className={styles.controlLabel}>
          <Ruler size={18} />
          <span>Altura del Tirador</span>
        </div>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="1.5"
            max="2.0"
            step="0.01"
            value={tiradorData.altura}
            onChange={(e) => handleChange('altura', parseFloat(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.valueBox}>
            <input
              type="number"
              min="1.5"
              max="2.0"
              step="0.01"
              value={tiradorData.altura}
              onChange={(e) => handleChange('altura', parseFloat(e.target.value))}
              onFocus={(e) => e.target.select()}
              className={styles.numberInput}
            />
            <span className={styles.unit}>m</span>
          </div>
        </div>
      </div>

      {/* Distancia del blanco */}
      <div className={styles.controlGroup}>
        <div className={styles.controlLabel}>
          <Target size={18} />
          <span>Distancia del Blanco</span>
        </div>
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="2"
            max="50"
            step="1"
            value={tiradorData.distanciaBlanco}
            onChange={(e) => handleChange('distanciaBlanco', parseInt(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.valueBox}>
            <input
              type="number"
              min="2"
              max="50"
              step="1"
              value={tiradorData.distanciaBlanco}
              onChange={(e) => handleChange('distanciaBlanco', parseInt(e.target.value))}
              onFocus={(e) => e.target.select()}
              className={styles.numberInput}
            />
            <span className={styles.unit}>m</span>
          </div>
        </div>
      </div>

      {/* Selección de arma */}
      <div className={styles.controlGroup}>
        <div className={styles.controlLabel}>
          <Target size={18} />
          <span>Arma</span>
        </div>
        <div className={styles.weaponSelector}>
          {armasDisponibles.map(arma => (
            <button
              key={arma.nombre}
              className={`${styles.weaponButton} ${tiradorData.arma === arma.nombre ? styles.active : ''}`}
              onClick={() => handleChange('arma', arma.nombre)}
            >
              <img src={arma.imagen} alt={arma.nombre} className={styles.weaponImage} />
              <div className={styles.weaponInfo}>
                <span className={styles.weaponName}>{arma.nombre}</span>
                <span className={styles.weaponDesc}>{arma.descripcion}</span>
              </div>
            </button>
          ))}
        </div>
      </div>


    </div>
  );

  return (
    <GenericReproductor tipoEjercicio="genericas" onReiniciar={resetToDefaults}>
      <div className={styles.genericsContainer}>
        <div className={`${styles.mainLayout} ${numTiradores === 1 ? styles.singleShooter : ''}`}>
          {/* Controles por tirador */}
          <div className={styles.tiradoresLayout}>
            {renderTiradorControls(1, tirador1, handleTirador1Change)}
            {numTiradores === 2 && renderTiradorControls(2, tirador2, handleTirador2Change)}
          </div>

          {/* Controles globales del escenario */}
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <Target size={20} />
              <h3>Parámetros Adicionales</h3>
            </div>

            {/* Toggle Mira Visual */}
            <div className={styles.controlGroup}>
              <div className={styles.controlLabel}>
                <Eye size={18} />
                <span>Mira Visual</span>
              </div>
              <button
                className={`${styles.toggleButton} ${escenario.miraVisual ? styles.active : ''}`}
                onClick={() => handleEscenarioChange('miraVisual', !escenario.miraVisual)}
              >
                <span className={styles.toggleSlider}></span>
              </button>
            </div>

            {/* Toggle Viento */}
            <div className={styles.controlGroup}>
              <div className={styles.controlLabel}>
                <Wind size={18} />
                <span>Viento</span>
              </div>
              <button
                className={`${styles.toggleButton} ${escenario.vientoActivo ? styles.active : ''}`}
                onClick={() => handleEscenarioChange('vientoActivo', !escenario.vientoActivo)}
              >
                <span className={styles.toggleSlider}></span>
              </button>
            </div>

            {/* Controles de viento (solo si está activo) */}
            {escenario.vientoActivo && (
              <div className={styles.windControls}>
                {/* Velocidad del viento */}
                <div className={styles.controlGroup}>
                  <div className={styles.controlLabel}>
                    <Wind size={16} />
                    <span>Velocidad</span>
                  </div>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="0.1"
                      value={escenario.velocidadViento}
                      onChange={(e) => handleEscenarioChange('velocidadViento', parseFloat(e.target.value))}
                      className={styles.slider}
                    />
                    <div className={styles.valueBox}>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.1"
                        value={escenario.velocidadViento}
                        onChange={(e) => handleEscenarioChange('velocidadViento', parseFloat(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        className={styles.numberInput}
                      />
                      <span className={styles.unit}>km/h</span>
                    </div>
                  </div>
                </div>

                {/* Dirección del viento */}
                <div className={styles.controlGroup}>
                  <div className={styles.controlLabel}>
                    <Navigation size={16} />
                    <span>Dirección</span>
                  </div>
                  <div className={styles.sliderContainer}>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      value={escenario.direccionViento}
                      onChange={(e) => handleEscenarioChange('direccionViento', parseInt(e.target.value))}
                      className={styles.slider}
                    />
                    <div className={styles.valueBox}>
                      <input
                        type="number"
                        min="-180"
                        max="180"
                        step="1"
                        value={escenario.direccionViento}
                        onChange={(e) => handleEscenarioChange('direccionViento', parseInt(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        className={styles.numberInput}
                      />
                      <span className={styles.unit}>°</span>
                    </div>
                  </div>
                  <div className={styles.windIndicator}>
                    <Navigation 
                      size={32} 
                      style={{ transform: `rotate(${escenario.direccionViento - 45}deg)` }}
                      className={styles.windArrow}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </GenericReproductor>
  );
};
