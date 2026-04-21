import React from 'react';
import styles from './MoteEvaluacion.module.css';

export const MoteEvaluacion = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Evaluación - Mote</h1>
      <div className={styles.placeholder}>
        <p>Contenido de evaluación con mote</p>
      </div>
    </div>
  );
};