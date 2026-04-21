import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import styles from './ConnectionButton.module.css';

export const ConnectionButton = ({ 
  isConnected, 
  connectedIP, 
  onClick 
}) => {
  return (
    <div className={styles.connectionButtonWrapper}>
      <button 
        onClick={onClick}
        className={`${styles.iconButton} ${isConnected ? styles.connected : styles.disconnected}`}
      >
        {isConnected ? (
          <Wifi className={styles.navIcon} />
        ) : (
          <WifiOff className={styles.navIcon} />
        )}
      </button>
      <div className={styles.tooltip}>
        <div className={styles.tooltipStatus}>
          <div className={`${styles.statusDot} ${isConnected ? styles.statusDotConnected : styles.statusDotDisconnected}`}></div>
          <span className={styles.tooltipTitle}>{isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>
        {isConnected && connectedIP && (
          <div className={styles.tooltipIp}>{connectedIP}</div>
        )}
      </div>
    </div>
  );
};
