import React, { useState, useEffect, useRef } from 'react';
import { getRoleConfig } from '@gestep/shared/types';
import { useAuth } from '@gestep/shared/auth';
import { useTheme } from '@gestep/shared/auth';
import { useNotifications } from '../../../context/NotificationsContext';
import { webSocketService } from '../../../services/webSocketService';
import { ConnectionModal } from '../../common/ConnectionModal';
import { ConnectionButton } from './ConnectionButton';
import { NotificationsDropdown } from './NotificationsDropdown';
import { UserMenu } from './UserMenu';
import styles from './Navbar.module.css';

export const Navbar = ({ icon: Icon, title, onLogout, variant = 'primary', onNavigateToConfig }) => {
  const { currentUser } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedIP, setConnectedIP] = useState('');

  // Referencias para los dropdowns
  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showUserMenu]);

  // Monitorear el estado de conexión (solo para UI, notificaciones las maneja el contexto)
  useEffect(() => {
    const connectionStatus = webSocketService.getConnectionStatus();
    setIsConnected(connectionStatus.isConnected);
    setConnectedIP(connectionStatus.currentIP || '');

    const handleConnectionLost = () => {
      setIsConnected(false);
      setConnectedIP('');
    };

    const handleConnectionEstablished = (data) => {
      if (!data.ip) return;
      setIsConnected(true);
      setConnectedIP(data.ip);
    };

    webSocketService.addListener('connection_lost', handleConnectionLost);
    webSocketService.addListener('connected', handleConnectionEstablished);

    return () => {
      webSocketService.removeListener('connection_lost', handleConnectionLost);
      webSocketService.removeListener('connected', handleConnectionEstablished);
    };
  }, []);

  // Obtener icono según el rol del usuario
  const roleConfig = getRoleConfig(currentUser?.tipoUsuario);
  const RoleIcon = roleConfig?.icon ?? Icon;
  const roleIconColor = roleConfig?.color;

  const handleNotificationClick = (id) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (id) => {
    deleteNotification(id);
  };

  const handleProfileSettings = () => {
    setShowUserMenu(false);
    // TODO: Implementar navegación a configuración
  };

  // Obtener iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!currentUser?.nombreCompleto) return '';
    const parts = currentUser.nombreCompleto.trim().split(' ');
    return (parts[0]?.charAt(0) + (parts[1]?.charAt(0) || '')).toUpperCase();
  };

  // Formatear el tipo de usuario (solo cuando el perfil cargó)
  const getUserType = () => currentUser?.nombreCompleto ? (currentUser.tipoUsuario || '') : '';

  // Subtítulo: rango + nombreCompleto, vacío si no están disponibles
  const getFullName = () => {
    if (!currentUser?.nombreCompleto) return '';
    const rango = currentUser.rango ? `${currentUser.rango} ` : '';
    return `${rango}${currentUser.nombreCompleto}`;
  };

  const handleConnectionButtonClick = () => {
    setShowConnectionModal(true);
    setShowNotifications(false);
    setShowUserMenu(false);
  };

  const handleNotificationsToggle = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  return (
    <nav className={`${styles.navbar} ${styles[variant]}`}>
      <div className={styles.leftSection}>
        <RoleIcon className={styles.roleIcon} style={roleIconColor ? { color: roleIconColor } : undefined} />
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{getFullName()}</p>
        </div>
      </div>

      <div className={styles.rightSection}>
        <ConnectionButton
          isConnected={isConnected}
          connectedIP={connectedIP}
          onClick={handleConnectionButtonClick}
        />

        <NotificationsDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          showDropdown={showNotifications}
          dropdownRef={notificationsRef}
          onToggle={handleNotificationsToggle}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDeleteNotification={handleDeleteNotification}
        />

        <UserMenu
          currentUser={currentUser}
          isDark={isDark}
          showDropdown={showUserMenu}
          dropdownRef={userMenuRef}
          onToggle={handleUserMenuToggle}
          onToggleTheme={toggleTheme}
          onSettings={handleProfileSettings}
          onLogout={onLogout}
          getUserInitials={getUserInitials}
          getUserType={getUserType}
        />
      </div>

      <ConnectionModal 
        isOpen={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        onNavigateToConfig={onNavigateToConfig}
      />
    </nav>
  );
};
