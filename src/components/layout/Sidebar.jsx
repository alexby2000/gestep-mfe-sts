import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Crosshair, MonitorPlay, FlaskConical, 
         MonitorCog , BarChart3, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { usePendingCount } from '../../context/PendingCountContext';
import styles from './Sidebar.module.css';

// Importar iconos desde assets
import moteIcon from '../../assets/tipos/ejercito.png';
import araIcon from '../../assets/tipos/ara.png';
import sitFreeIcon from '../../assets/tipos/sit_free.png';

export const Sidebar = () => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const { pendingCount } = usePendingCount();

  const showGenericas = import.meta.env.VITE_SIT_GENERICAS_VISIBLE === 'true';

  const ejerciciosSubmenu = [
    { id: 'ejercicios-mote', label: 'Mote', path: '/sts/ejercicios/mote', icon: moteIcon },
    { id: 'ejercicios-ara', label: 'ARA', path: '/sts/ejercicios/ara', icon: araIcon },
    ...(showGenericas ? [{ id: 'ejercicios-genericas', label: 'Genéricas', path: '/sts/ejercicios/genericas', icon: sitFreeIcon }] : [])
  ];

  const menuItems = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: Home,
      path: '/sts/dashboard'
    },
    {
      id: 'alineacion',
      label: 'Alineación',
      icon: Crosshair,
      path: '/sts/alineacion'
    },
    {
      id: 'ejercicios',
      label: 'Ejercicios',
      icon: MonitorPlay,
      hasSubmenu: true,
      submenu: ejerciciosSubmenu
    },
    {
      id: 'config_simulador',
      label: 'Parámetros del Simulador',
      icon: MonitorCog,
      path: '/sts/configuracion'
    },
    {
      id: 'estadisticas',
      label: 'Estadísticas',
      icon: BarChart3,
      path: '/sts/estadisticas'
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: Users,
      path: '/sts/usuarios',
      badge: pendingCount
    }
  ];

  const toggleSubmenu = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  return (
    <div 
      className={`${styles.sidebar} ${isExpanded ? styles.expanded : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={styles.menuItems}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path ? location.pathname.endsWith(item.path) : 
                          (item.submenu && item.submenu.some(sub => location.pathname.endsWith(sub.path)));
          const isSubmenuOpen = expandedItems[item.id];

          return (
            <div key={item.id} className={styles.menuItemWrapper}>
              {item.hasSubmenu ? (
                <button
                  className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                  onClick={() => toggleSubmenu(item.id)}
                  title={!isExpanded ? item.label : ''}
                >
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                  </div>
                  
                  {isExpanded && (
                    <>
                      <span className={styles.label}>{item.label}</span>
                      <div className={styles.chevronWrapper}>
                        {isSubmenuOpen ? (
                          <ChevronDown className={styles.chevron} />
                        ) : (
                          <ChevronRight className={styles.chevron} />
                        )}
                      </div>
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                  title={!isExpanded ? item.label : ''}
                >
                  <div className={styles.iconWrapper}>
                    <Icon className={styles.icon} />
                    {item.badge > 0 && (
                      <span className={styles.iconBadge}>{item.badge}</span>
                    )}
                  </div>
                  
                  {isExpanded && (
                    <span className={styles.label}>{item.label}</span>
                  )}
                </Link>
              )}

              {item.hasSubmenu && isExpanded && isSubmenuOpen && (
                <div className={styles.submenu}>
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.id}
                      to={subItem.path}
                      className={`${styles.submenuItem} ${
                        location.pathname.endsWith(subItem.path) ? styles.submenuActive : ''
                      }`}
                    >
                      {subItem.icon && (
                        <img 
                          src={subItem.icon} 
                          alt={`${subItem.label} icon`}
                          className={styles.submenuIcon}
                        />
                      )}
                      <span className={styles.submenuLabel}>{subItem.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};