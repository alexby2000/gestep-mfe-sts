import React, { useState, useEffect } from 'react';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, Zap } from 'lucide-react';
import { webSocketService } from '../../../services/webSocketService';
import styles from './ActiveWeapons.module.css';


const PistolaIcon = () => (
  <img 
    src="/pistola9mm.png" 
    alt="Pistola" 
    className={styles.weaponSvg}
    onError={(e) => {
      e.target.style.display = 'none';
    }}
  />
);

const FusilIcon = () => (
  <img 
    src={fusilImg} 
    alt="Fusil" 
    className={styles.weaponSvg}
    onError={(e) => {
      e.target.style.display = 'none';
    }}
  />
);

// Componente de batería
const BatteryIcon = ({ percentage }) => {
  const getColor = () => {
    if (percentage > 60) return styles.batteryGreen;
    if (percentage > 30) return styles.batteryAmber;
    return styles.batteryRed;
  };

  const getIcon = () => {
    if (percentage > 80) return BatteryFull;
    if (percentage > 40) return BatteryMedium;
    return BatteryLow;
  };

  const Icon = getIcon();
  const colorClass = getColor();
  
  return (
    <Icon className={`${styles.batteryIcon} ${colorClass}`} />
  );
};

// Componente de tarjeta de arma
const WeaponCard = ({ weapon }) => {
  const Icon = weapon.tipo === 'pistola' ? PistolaIcon : FusilIcon;
  
  return (
    <div className={styles.weaponCard}>
      {/* Icono del arma */}
      <div className={styles.weaponIconContainer}>
        <Icon />
      </div>

      {/* Info del arma */}
      <div className={styles.weaponInfo}>
        <h4 className={styles.weaponName}>
          {weapon.customName || weapon.nombre}
        </h4>
        <p className={styles.weaponType}>
          {weapon.tipo === 'pistola' ? 'Pistola' : 'Fusil'}
        </p>
      </div>

      {/* Batería */}
      <div className={styles.batteryContainer}>
        <BatteryIcon percentage={weapon.battery} />
        <span className={`${styles.batteryPercentage} ${weapon.battery <= 30 ? styles.batteryLowText : ''}`}>
          {weapon.battery}%
        </span>
      </div>
    </div>
  );
};


// #########################################################################
//                             COMPONENTE PRINCIPAL
// #########################################################################
export const ActiveWeapons = ({ isConnected }) => {
  const [activeWeapons, setActiveWeapons] = useState([]);

  useEffect(() => {
    if (!isConnected) {
      setActiveWeapons([]);
      return;
    }

    // TODO: Implementar comunicación WebSocket con el simulador
    // 
    // Mensajes esperados de la API:
    // - Tipo: 'active_weapons' con formato: { weapons: [ { id, nombre, tipo, battery, mac } ] }
    // - Tipo: 'weapon_battery' con formato: { mac, battery }
    //
    // Implementación sugerida:
    // 
    // const handleWeaponsUpdate = (data) => {
    //   if (data.weapons) {
    //     const savedCustomNames = localStorage.getItem('guns_custom_names');
    //     const customNames = savedCustomNames ? JSON.parse(savedCustomNames) : {};
    //     
    //     const weaponsWithNames = data.weapons.map(weapon => ({
    //       ...weapon,
    //       customName: customNames[weapon.mac] || ''
    //     }));
    //     
    //     setActiveWeapons(weaponsWithNames);
    //   }
    // };
    //
    // const handleBatteryUpdate = (data) => {
    //   if (data.mac && data.battery !== undefined) {
    //     setActiveWeapons(prev => 
    //       prev.map(weapon => 
    //         weapon.mac === data.mac 
    //           ? { ...weapon, battery: data.battery }
    //           : weapon
    //       )
    //     );
    //   }
    // };
    //
    // webSocketService.addListener('active_weapons', handleWeaponsUpdate);
    // webSocketService.addListener('weapon_battery', handleBatteryUpdate);
    // webSocketService.sendMessage('get_active_weapons');
    //
    // return () => {
    //   webSocketService.removeListener('active_weapons', handleWeaponsUpdate);
    //   webSocketService.removeListener('weapon_battery', handleBatteryUpdate);
    // };

  }, [isConnected]);

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Zap className={styles.headerIcon} />
        </div>
        <div className={styles.headerText}>
          <h2 className={styles.title}>Armas Activas</h2>
          {isConnected && activeWeapons.length > 0 && (
            <p className={styles.subtitle}>
              {activeWeapons.length} {activeWeapons.length === 1 ? 'arma' : 'armas'} encendida{activeWeapons.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
        {isConnected && (
          <div className={styles.connectionIndicator} />
        )}
      </div>

      {/* Content */}
      {!isConnected ? (
        // Estado desconectado
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapperGray}>
            <Zap className={styles.emptyIcon} />
          </div>
          <h3 className={styles.emptyTitle}>Simulador Desconectado</h3>
          <p className={styles.emptyDescription}>
            Conecta al simulador para ver las armas activas
          </p>
        </div>
      ) : activeWeapons.length === 0 ? (
        // Estado conectado sin armas
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrapperBlue}>
            <Battery className={styles.emptyIcon} />
          </div>
          <h3 className={styles.emptyTitle}>No hay armas activas</h3>
          <p className={styles.emptyDescription}>
            Enciende las armas para verlas aquí
          </p>
        </div>
      ) : (
        // Lista de armas
        <div className={styles.weaponsList}>
          {activeWeapons.map((weapon) => (
            <WeaponCard key={weapon.id || weapon.mac} weapon={weapon} />
          ))}
        </div>
      )}
    </div>
  );
};