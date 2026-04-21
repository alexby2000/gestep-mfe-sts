import React from 'react';
import styles from './Mote.module.css';

export const Mote = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Evaluación - Mote</h1>
      <div className={styles.placeholder}>
        <p>Contenido de evaluación con Mote</p>
      </div>
    </div>
  );
};