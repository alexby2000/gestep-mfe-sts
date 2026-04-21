import React from 'react';
import styles from './Estadisticas.module.css';

export const Estadisticas = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Estadísticas</h1>
      <div className={styles.placeholder}>
        <p>Gráficos y reportes estadísticos</p>
      </div>
    </div>
  );
};