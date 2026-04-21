import React, { useState } from 'react';
import { Play, User, Users } from 'lucide-react';
import { webSocketService } from '../../../../services/webSocketService';
import styles from './ConfirmCardGenericas.module.css';

/**
 * Contenido específico del drawer para situaciones genéricas
 */
export const ConfirmCardGenericas = ({ situacion, onIniciar }) => {
  const [numTiradores, setNumTiradores] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleIniciar = () => {
    setIsLoading(true);
    
    try {
      // Primero enviar cantidad de tiradores
      webSocketService.setCantidadTiradores(numTiradores);
      
      // Luego cambiar escena
      webSocketService.cambiarEscena(situacion.nombreEscena);
    } catch (error) {
      console.error('Error al iniciar ejercicio:', error);
    }
    
    // Dar tiempo al simulador para cargar la escena (2 segundos)
    setTimeout(() => {
      onIniciar(situacion, numTiradores);
      setIsLoading(false);
    }, 2500);
  };

  return (
    <>
      {/* Imagen del ejercicio */}
      <div className={styles.drawerImage}>
        <img src={situacion.imagen} alt={situacion.nombre} />
      </div>

      {/* Información */}
      <div className={styles.drawerInfo}>
        <h2 className={styles.drawerTitle}>{situacion.nombre}</h2>
        <div className={styles.drawerSection}>
          <h3 className={styles.drawerSectionTitle}>Descripción</h3>
          <p className={styles.drawerDescription}>{situacion.descripcion}</p>
        </div>
        <div className={styles.drawerSection}>
          <h3 className={styles.drawerSectionTitle}>Tipo de Ejercicio</h3>
          <span className={styles.drawerBadge}>{situacion.categoria}</span>
        </div>
        <div className={styles.drawerSection}>
          <h3 className={styles.drawerSectionTitle}>Tipos de Blancos</h3>
          <p className={styles.drawerText}>{situacion.tiposBlancos}</p>
        </div>
      </div>

      {/* Acciones al pie: switch de tiradores + botón iniciar */}
      <div className={styles.drawerActionsFooter}>
        <div className={styles.tiradoresSwitch}>
          <button
            className={`${styles.tiradorButton} ${numTiradores === 1 ? styles.active : ''}`}
            onClick={() => setNumTiradores(1)}
          >
            <User size={20} />
            <span>1 Tirador</span>
          </button>
          <button
            className={`${styles.tiradorButton} ${numTiradores === 2 ? styles.active : ''}`}
            onClick={() => setNumTiradores(2)}
          >
            <Users size={22} />
            <span>2 Tiradores</span>
          </button>
        </div>
        <button 
          className={`${styles.drawerStartButton} ${isLoading ? styles.loading : ''}`}
          onClick={handleIniciar}
          disabled={isLoading}
        >
          <Play size={20} fill="currentColor" />
          <span>{isLoading ? 'Cargando...' : 'Iniciar Ejercicio'}</span>
        </button>
      </div>
    </>
  );
};
