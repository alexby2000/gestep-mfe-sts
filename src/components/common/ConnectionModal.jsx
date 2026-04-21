import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, X, HelpCircle } from 'lucide-react';
import { webSocketService } from '../../services/webSocketService';
import { configService } from '../../services/Simulador/configService';
import { ActionModal } from './Modal';
import styles from './ConnectionModal.module.css';

export const ConnectionModal = ({ isOpen, onClose, onNavigateToConfig }) => {
  const [ip, setIp] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  const [recentIPs, setRecentIPs] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const [showConfigWarning, setShowConfigWarning] = useState(false);

  useEffect(() => {
    // Listener para pérdida de conexión (siempre activo)
    const handleConnectionLost = () => {
      setIsConnected(false);
      setConnectionMessage('Conexión perdida');
    };

    const handleConnected = () => {
      setIsConnected(true);
      setConnectionMessage('');
    };

    webSocketService.addListener('connection_lost', handleConnectionLost);
    webSocketService.addListener('connected', handleConnected);

    return () => {
      webSocketService.removeListener('connection_lost', handleConnectionLost);
      webSocketService.removeListener('connected', handleConnected);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setRecentIPs(webSocketService.recentIPs);

      // Verificar si ya hay una conexión activa
      const connectionStatus = webSocketService.getConnectionStatus();
      if (connectionStatus.isConnected && connectionStatus.currentIP) {
        setIsConnected(true);
        setIp(connectionStatus.currentIP);
      } else {
        setIsConnected(false);
        setIp('');
      }
    }
  }, [isOpen]);

  const handleConnect = async () => {
    if (!ip.trim()) {
      setConnectionMessage('Ingresa una dirección IP');
      return;
    }

    // Validación básica de formato IP
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      setConnectionMessage('Formato de IP inválido');
      return;
    }

    // Validar que cada octeto esté entre 0-255
    const octets = ip.split('.');
    const validOctets = octets.every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });

    if (!validOctets) {
      setConnectionMessage('Cada número debe estar entre 0 y 255');
      return;
    }

    setIsConnecting(true);
    setConnectionMessage('Conectando...');

    try {
      await webSocketService.connect(ip);
      
      // Verificar si hay configuración completa
      if (!configService.isConfigComplete()) {
        setIsConnecting(false);
        setIsConnected(true);
        setConnectionMessage('');
        setRecentIPs(webSocketService.recentIPs);
        setShowConfigWarning(true);
        return;
      }

      // Enviar configuración al simulador
      const config = configService.getConfigForSimulator();
      webSocketService.enviarConfiguracion(config);
      
      setIsConnecting(false);
      setIsConnected(true);
      setConnectionMessage('');
      setRecentIPs(webSocketService.recentIPs);
    } catch (error) {
      setIsConnecting(false);
      setIsConnected(false);
      setConnectionMessage(error.message || 'Error al conectar');
    }
  };

  const handleDisconnect = () => {
    webSocketService.disconnect();
    setIsConnected(false);
    setConnectionMessage('');
  };

  const handleSelectRecent = (recentIp) => {
    setIp(recentIp);
    setShowRecent(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={`${styles.card} ${isConnected ? styles.connected : ''}`} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>

          <div className={styles.header}>
            {isConnected ? (
              <Wifi className={styles.iconConnected} />
            ) : (
              <WifiOff className={styles.iconDisconnected} />
            )}
            <div className={styles.headerText}>
              <div className={styles.titleRow}>
                <h2 className={styles.title}>Conexión al Simulador</h2>
                <div className={styles.helpIconWrapper}>
                  <HelpCircle className={styles.helpIcon} size={18} />
                  <div className={styles.helpTooltip}>
                    Para poder usar el Simulador de Tiro debes ingresar la dirección IP que se visualiza en pantalla. Debes estar conectado a la misma red donde se ejecuta el simulador.
                  </div>
                </div>
              </div>
              <p className={styles.status}>
                {isConnected ? 'Conectado' : isConnecting ? 'Conectando...' : 'Desconectado'}
              </p>
            </div>
          </div>

          {!isConnected ? (
            <div className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Ej: 192.168.1.100"
                  className={styles.input}
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isConnecting}
                />
                {recentIPs.length > 0 && (
                  <button
                    className={styles.historyButton}
                    onClick={() => setShowRecent(!showRecent)}
                    type="button"
                    disabled={isConnecting}
                    title="IPs recientes"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                )}
                
                {showRecent && recentIPs.length > 0 && (
                  <div className={styles.recentList}>
                    <div className={styles.recentHeader}>IP Recientes</div>
                    {recentIPs.map((recentIp, index) => (
                      <button
                        key={index}
                        className={styles.recentItem}
                        onClick={() => handleSelectRecent(recentIp)}
                      >
                        {recentIp}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {connectionMessage && (
                <p className={styles.errorMessage}>
                  {connectionMessage}
                </p>
              )}

              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className={styles.connectButton}
              >
                {isConnecting ? 'Conectando...' : 'Conectar'}
              </button>
            </div>
          ) : (
            <div className={styles.connectedInfo}>
              <div className={styles.ipDisplay}>
                <span className={styles.ipLabel}>IP:</span>
                <span className={styles.ipValue}>{ip}:8080</span>
              </div>
              <button onClick={handleDisconnect} className={styles.disconnectButton}>
                Desconectar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de advertencia de configuración */}
      <ActionModal
        isOpen={showConfigWarning}
        onClose={() => setShowConfigWarning(false)}
        title="Falta configurar el Simulador"
        message="El simulador necesita ser configurado para funcionar correctamente."
        icon={AlertTriangle}
        primaryAction={() => {
          setShowConfigWarning(false);
          onClose();
          if (onNavigateToConfig) {
            onNavigateToConfig();
          }
        }}
        primaryText="Configurar"
        secondaryAction={() => setShowConfigWarning(false)}
        secondaryText="Omitir"
      />
    </>
  );
};
