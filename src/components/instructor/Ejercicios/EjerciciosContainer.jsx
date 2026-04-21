import React, { useState } from 'react';
import { Dumbbell, GraduationCap } from 'lucide-react';
import styles from './EjerciciosContainer.module.css';

// Importar componentes de Ejercitación
import { MoteEjercitacion } from './Mote/MoteEjercitacion';
import { Genericas } from './Genericas/Genericas';

// Importar componentes de Evaluación
import { ARA } from './ARA/ARA';
import { MoteEvaluacion } from './Mote/MoteEvaluacion';

export const EjerciciosContainer = ({ ejercicioType }) => {
  const [mode, setMode] = useState('ejercitacion'); // 'ejercitacion' o 'evaluacion'

  // Obtener el título según el tipo de ejercicio
  const getTitle = () => {
    switch (ejercicioType) {
      case 'mote':
        return 'Mote';
      case 'ara':
        return 'ARA';
      case 'genericas':
        return 'Genéricas';
      default:
        return 'Ejercicios';
    }
  };

  const renderContent = () => {
    // Para "Genericas" no hay switch, siempre es ejercitación
    if (ejercicioType === 'genericas') {
      return <Genericas showSwitch={false} />;
    }

    // Para Mote y ARA, mostrar según el modo seleccionado
    if (mode === 'ejercitacion') {
      switch (ejercicioType) {
        case 'mote':
          return <MoteEjercitacion />;
        case 'ara':
          return <ARA modo="ejercitacion" />;
        default:
          return null;
      }
    } else {
      switch (ejercicioType) {
        case 'mote':
          return <MoteEvaluacion />;
        case 'ara':
          return <ARA modo="evaluacion" />;
        default:
          return null;
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* Header con título y switch */}
      <div className={`${styles.header} ${mode === 'evaluacion' ? styles.headerEvaluacion : ''}`}>
        <h1 className={styles.title}>{getTitle()}</h1>
        
        {/* Switch de modo - Solo para Mote y ARA */}
        {ejercicioType !== 'genericas' && (
          <div className={`${styles.modeSwitch} ${styles.modeSwitchMode}`}>
            <button
              className={`${styles.modeButton} ${mode === 'ejercitacion' ? styles.active : ''}`}
              onClick={() => setMode('ejercitacion')}
            >
              <Dumbbell className={styles.modeIcon} />
              <span>Ejercitación</span>
            </button>
            <button
              className={`${styles.modeButton} ${mode === 'evaluacion' ? styles.active : ''}`}
              onClick={() => setMode('evaluacion')}
            >
              <GraduationCap className={styles.modeIcon} />
              <span>Evaluación</span>
            </button>
          </div>
        )}
      </div>

      {/* Contenido del ejercicio */}
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};
