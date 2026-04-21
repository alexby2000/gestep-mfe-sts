import React from 'react';
import styles from './MoteEjercitacion.module.css';

export const MoteEjercitacion = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ejercitación - Mote</h1>
      <div className={styles.placeholder}>
        <p>Contenido de ejercitación con mote</p>
      </div>
    </div>
  );
};