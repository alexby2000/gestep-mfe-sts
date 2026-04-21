import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import { Navbar } from './components/layout/navbar';
import { Sidebar } from './components/layout/Sidebar';
import { useAuth } from '@gestep/shared/auth';
import { webSocketService } from './services/webSocketService';
import { NotificationsProvider } from './context/NotificationsContext';
import { PendingCountProvider } from './context/PendingCountContext';
import styles from './StsView.module.css';

const Dashboard = lazy(() => import('./components/instructor/Dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const Alineacion = lazy(() => import('./components/instructor/Alineacion/Alineacion').then(m => ({ default: m.Alineacion })));
const EjerciciosContainer = lazy(() => import('./components/instructor/Ejercicios').then(m => ({ default: m.EjerciciosContainer })));
const ConfigSimulador = lazy(() => import('./components/instructor/ConfigSimulador').then(m => ({ default: m.ConfigSimulador })));
const Estadisticas = lazy(() => import('./components/instructor/Estadisticas').then(m => ({ default: m.Estadisticas })));
const Usuarios = lazy(() => import('./components/instructor/Usuarios').then(m => ({ default: m.Usuarios })));
const ReproductorGenericas = lazy(() => import('./components/instructor/Ejercicios/Genericas/ReproductorGenericas').then(m => ({ default: m.ReproductorGenericas })));
const ReproductorARA = lazy(() => import('./components/instructor/Ejercicios/ARA/ReproductorARA').then(m => ({ default: m.ReproductorARA })));

const StsViewInner = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isApiConnected, setIsApiConnected] = useState(false);

  const isReproductorMode = location.pathname.includes('/reproductor');

  useEffect(() => {
    const checkConnection = () => {
      const status = webSocketService.getConnectionStatus();
      setIsApiConnected(status.isConnected);
    };

    const handleConnected = () => setIsApiConnected(true);
    const handleDisconnected = () => setIsApiConnected(false);

    webSocketService.addListener('connected', handleConnected);
    webSocketService.addListener('connection_lost', handleDisconnected);
    checkConnection();

    return () => {
      webSocketService.removeListener('connected', handleConnected);
      webSocketService.removeListener('connection_lost', handleDisconnected);
    };
  }, []);

  const getPanelTitle = () => {
    if (!currentUser?.nombreCompleto) return 'Panel de Control';
    if (currentUser.tipoUsuario === 'Administrador') return 'Panel de Administrador';
    return 'Panel de Instructor';
  };

  return (
    <div className={styles.container}>
      {!isReproductorMode && (
        <>
          <Navbar
            icon={Target}
            title={getPanelTitle()}
            onLogout={logout}
            variant="primary"
          />
          <Sidebar />
        </>
      )}

      <div className={`${styles.content} ${isReproductorMode ? styles.reproductorMode : ''}`}>
        <Suspense>
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard isApiConnected={isApiConnected} />} />
            <Route path="alineacion" element={<Alineacion />} />
            <Route path="ejercicios/mote" element={<EjerciciosContainer ejercicioType="mote" />} />
            <Route path="ejercicios/ara" element={<EjerciciosContainer ejercicioType="ara" />} />
            <Route path="ejercicios/genericas" element={<EjerciciosContainer ejercicioType="genericas" />} />
            <Route path="ejercicios/genericas/reproductor" element={<ReproductorGenericas />} />
            <Route path="ejercicios/ara/reproductor" element={<ReproductorARA />} />
            <Route path="configuracion" element={<ConfigSimulador />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

// Envuelve los providers específicos del STS que no viven en el shell
const StsView = () => (
  <NotificationsProvider>
    <PendingCountProvider>
      <StsViewInner />
    </PendingCountProvider>
  </NotificationsProvider>
);

export default StsView;
