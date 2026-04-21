import React from 'react';
import { Edit2, Globe, MoveHorizontal, MoveVertical } from 'lucide-react';
import styles from './WeaponCard.module.css';
import pistola9mmImg from '../../../assets/armas/pistola9mm.png';
import fusilImg from '../../../assets/armas/fusil.svg';

const PistolaIcon = () => (
  <img 
    src={pistola9mmImg} 
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

export const WeaponCard = ({ weapon, onEditName }) => {
  const Icon = weapon.tipo === 'pistola' ? PistolaIcon : FusilIcon;
  
  // Formatear offset a máximo 2 decimales para visualización
  const formatOffset = (value) => {
    const num = parseFloat(value);
    return num.toFixed(2);
  };

  return (
    <div className={styles.weaponCard}>
      <button
        className={styles.editButton}
        onClick={() => onEditName(weapon)}
        title="Editar nombre"
      >
        <Edit2 size={18} />
      </button>
      
      <div className={styles.weaponHeader}>
        <div className={styles.weaponIconLarge}>
          <Icon />
        </div>
      </div>
      
      <div className={styles.weaponInfo}>
        <h3 className={styles.weaponTitle}>{weapon.customName || weapon.nombre}</h3>
        <span className={styles.weaponBadge}>{weapon.tipo}</span>
      </div>
      
      <div className={styles.weaponBody}>
        
        <div className={styles.weaponProperties}>
          <div className={styles.propertyItem}>
            <div className={styles.propertyIcon}>
              <Globe size={20} strokeWidth={2.5} />
            </div>
            <div className={styles.propertyContent}>
              <span className={styles.propertyLabel}>Dirección MAC</span>
              <span className={styles.propertyValueMac}>{weapon.mac}</span>
            </div>
          </div>
          
          <div className={styles.offsetGrid}>
            <div className={styles.propertyItem}>
              <div className={styles.propertyIcon}>
                <MoveHorizontal size={20} strokeWidth={2.5} />
              </div>
              <div className={styles.propertyContent}>
                <span className={styles.propertyLabel}>Offset X</span>
                <span className={styles.propertyValue}>{formatOffset(weapon.offsetX)} cm</span>
              </div>
            </div>
            
            <div className={styles.propertyItem}>
              <div className={styles.propertyIcon}>
                <MoveVertical size={20} strokeWidth={2.5} />
              </div>
              <div className={styles.propertyContent}>
                <span className={styles.propertyLabel}>Offset Y</span>
                <span className={styles.propertyValue}>{formatOffset(weapon.offsetY)} cm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
