import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { webSocketService } from '../services/webSocketService';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Referencias para capturar valores actuales en callbacks
  const isConnectedRef = useRef(false);
  const connectedIPRef = useRef('');

  // Monitorear el estado de conexión y agregar notificaciones automáticamente
  useEffect(() => {
    const connectionStatus = webSocketService.getConnectionStatus();
    isConnectedRef.current = connectionStatus.isConnected;
    connectedIPRef.current = connectionStatus.currentIP || '';

    const handleConnectionLost = (data) => {
      const wasConnected = isConnectedRef.current;
      const previousIP = connectedIPRef.current;
      
      isConnectedRef.current = false;
      connectedIPRef.current = '';

      // Solo agregar notificación si estábamos conectados (desconexión inesperada)
      if (wasConnected && previousIP && data && (data.code || data.reason)) {
        addNotification({
          message: `Conexión perdida con el simulador (${previousIP})`,
          type: 'error'
        });
      }
    };

    const handleConnectionEstablished = (data) => {
      // Solo procesar si viene con IP (evento real de conexión WebSocket)
      if (!data.ip) return;
      
      const newIP = data.ip;
      isConnectedRef.current = true;
      connectedIPRef.current = newIP;
    };

    webSocketService.addListener('connection_lost', handleConnectionLost);
    webSocketService.addListener('connected', handleConnectionEstablished);

    return () => {
      webSocketService.removeListener('connection_lost', handleConnectionLost);
      webSocketService.removeListener('connected', handleConnectionEstablished);
    };
  }, []);

  const addNotification = ({ message, type = 'info' }) => {
    const newNotification = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
