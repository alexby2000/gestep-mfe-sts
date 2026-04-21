import React from 'react';
import { WeeklyStats } from './WeeklyStats';
import { PendingRequests } from './PendingRequests';
import { ActiveWeapons } from './ActiveWeapons';
import styles from './Dashboard.module.css';

export const Dashboard = ({ isApiConnected }) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      
      {/* Estadísticas semanales */}
      <WeeklyStats />
      
      {/* Solicitudes pendientes */}
      <PendingRequests />
      
      <div className={styles.grid}>
        <ActiveWeapons isConnected={isApiConnected} />
      </div>
    </div>
  );
};
