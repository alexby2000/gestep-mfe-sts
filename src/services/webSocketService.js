// Servicio para manejar la comunicación WebSocket con el simulador

class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.recentIPs = this.loadRecentIPs();
    this.currentIP = null;
    this.connectionCheckInterval = null;
    this.isManualDisconnect = false; // Flag para rastrear desconexión manual
  }

  // Cargar IPs recientes del localStorage
  loadRecentIPs() {
    try {
      const ips = localStorage.getItem('recentIPs');
      return ips ? JSON.parse(ips) : [];
    } catch {
      return [];
    }
  }

  // Guardar IP en el historial
  saveRecentIP(ip) {
    let recent = this.recentIPs.filter(item => item !== ip);
    recent.unshift(ip);
    recent = recent.slice(0, 5);
    this.recentIPs = recent;
    localStorage.setItem('recentIPs', JSON.stringify(recent));
  }

  // Conectar al servidor WebSocket
  connect(ip) {
    return new Promise((resolve, reject) => {
      try {
        // Cerrar conexión existente si hay una
        if (this.ws) {
          this.disconnect();
        }

        // Resetear el flag después de disconnect() para la nueva conexión
        this.isManualDisconnect = false;
        
        this.currentIP = ip;
        const wsUrl = `ws://${ip}:8080`;
        
        console.log(`Intentando conectar a: ${wsUrl}`);
        this.ws = new WebSocket(wsUrl);

        // Timeout de conexión
        const connectionTimeout = setTimeout(() => {
          if (this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            reject(new Error('Tiempo de conexión agotado'));
          }
        }, 5000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket conectado');
          this.isConnected = true;
          this.saveRecentIP(ip);
          this.startConnectionCheck();
          
          // Notificar a los listeners que se conectó
          this.notifyListeners('connected', { ip });
          
          resolve({ success: true, message: 'Conexión exitosa' });
        };

        this.ws.onclose = (event) => {
          const wasManualDisconnect = this.isManualDisconnect;
          
          this.isConnected = false;
          this.stopConnectionCheck();
          
          // Resetear el flag para futuras conexiones
          this.isManualDisconnect = false;
          
          // Siempre notificar, pero indicar si fue manual o no
          this.notifyListeners('connection_lost', { 
            code: event.code, 
            reason: event.reason || (wasManualDisconnect ? 'Desconexión manual' : 'Servidor desconectado'),
            wasManual: wasManualDisconnect
          });
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('Error de WebSocket:', error);
          this.isConnected = false;
          reject(new Error('Error al conectar con el servidor'));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Mensaje recibido:', data);
            
            // Notificar a los listeners según el tipo de mensaje
            if (data.type) {
              this.notifyListeners(data.type, data);
            }
          } catch (error) {
            console.error('Error al parsear mensaje:', error);
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  // Desconectar WebSocket
  disconnect() {
    this.stopConnectionCheck();
    
    if (this.ws) {
      // Marcar como desconexión manual
      this.isManualDisconnect = true;
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.currentIP = null;
  }

  // Verificar conexión periódicamente
  startConnectionCheck() {
    this.stopConnectionCheck();
    
    this.connectionCheckInterval = setInterval(() => {
      if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
        console.log('Conexión perdida detectada');
        this.isConnected = false;
        this.notifyListeners('connection_lost', { reason: 'Connection check failed' });
      }
    }, 30000); // Cada 30 segundos
  }

  stopConnectionCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  // Enviar mensaje al servidor
  sendMessage(type, data = {}) {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('No hay conexión con el simulador');
    }

    const message = {
      type,
      ...data,
      timestamp: new Date().toISOString()
    };

    this.ws.send(JSON.stringify(message));
    console.log('Mensaje enviado:', message);
  }

  // Agregar listener para un tipo de mensaje
  addListener(messageType, callback) {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    this.listeners.get(messageType).push(callback);
  }

  // Remover listener
  removeListener(messageType, callback) {
    if (this.listeners.has(messageType)) {
      const callbacks = this.listeners.get(messageType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notificar a todos los listeners de un tipo de mensaje
  notifyListeners(messageType, data) {
    if (this.listeners.has(messageType)) {
      const callbacks = this.listeners.get(messageType);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error en listener de ${messageType}:`, error);
        }
      });
    }
  }

  // #############################################
  //        Mensajes específicos a la API
  // #############################################
  cambiarEscena(escena) {
    this.validateConnection();
    this.sendMessage('cambiar_escena', {
      escena: escena
    });
  }

  enviarConfiguracion(config) {
    this.validateConnection();
    this.sendMessage('config_screen', {
      ancho: config.anchoPantalla,
      alto: config.alturaPantalla,
      distancia: config.distTiradorPantalla,
      offset: config.alturaPiso
    });
  }

  solicitarListaArmas() {
    this.validateConnection();
    this.sendMessage('get_lista_armas');
  }

  // Establecer distancia del blanco para un tirador
  setDistanciaBlanco(tirador, distancia) {
    this.validateConnection();
    this.sendMessage('set_dist_bln', {
      tirador: tirador,
      distancia: distancia
    });
  }

  // Configurar cantidad de tiradores
  setCantidadTiradores(cantidad) {
    this.validateConnection();
    this.sendMessage('cant_tiradores', {
      cantidad: cantidad
    });
  }

  // Mostrar u ocultar la mira visual
  setMostrarMiraVisual(isVisible) {
    this.validateConnection();
    this.sendMessage('show_sight_pos', {
      visible: isVisible
    });
  }

  // Establecer altura de un tirador
  setAlturaTirador(idTirador, altura) {
    this.validateConnection();
    this.sendMessage('set_altura_tirador', {
      id_tirador: idTirador,
      altura: altura
    });
  }

  // Configurar arma de un tirador
  setArmaTirador(idTirador, tipoArma) {
    this.validateConnection();
    this.sendMessage('set_arma_tirador', {
      id_tirador: idTirador,
      tipo_arma: tipoArma
    });
  }

  // Habilitar o deshabilitar el viento
  setHabilitarViento(enable) {
    this.validateConnection();
    this.sendMessage('enable_viento', {
      enable: enable
    });
  }

  // Configurar parámetros del viento
  setParametrosViento(angDireccion, velocidad) {
    this.validateConnection();
    this.sendMessage('set_viento_params', {
      ang_direccion: angDireccion,
      velocidad: velocidad
    });
  }
  
// #################################################################################

  // Validar conexión activa
  validateConnection() {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('No hay conexión con el simulador');
    }
  }

  // Obtener estado actual
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      currentIP: this.currentIP,
      readyState: this.ws ? this.ws.readyState : null
    };
  }
}

export const webSocketService = new WebSocketService();