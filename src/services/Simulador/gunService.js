// Servicio para manejar el descubrimiento y gestión de armas

import { webSocketService } from '../webSocketService';

class GunService {
  constructor() {
    this.STORAGE_KEY = 'guns_list';
    this.CUSTOM_NAMES_KEY = 'guns_custom_names';
  }

  /**
   * Normalizar tipo de arma para iconos y categoría
   * Retorna 'pistola' o 'fal' para determinar el icono a mostrar
   */
  normalizeWeaponCategory(apiType) {
    const tipo = apiType.toLowerCase();
    if (tipo.includes('pistola')) {
      return 'pistola';
    } else if (tipo.includes('fal')) {
      return 'fal';
    }
    return 'pistola'; // default
  }

  /**
   * Procesar armas recibidas de la API
   */
  processWeapons(armasAPI) {
    if (!Array.isArray(armasAPI)) {
      return [];
    }

    const customNames = this.loadCustomNames();

    return armasAPI.map((arma, index) => ({
      id: arma.mac, // Usar MAC como ID único
      nombre: `${arma.tipo} ${index + 1}`,
      tipo: arma.tipo, // Guardar el tipo completo de la API
      categoria: this.normalizeWeaponCategory(arma.tipo), // 'pistola' o 'fal' para iconos
      mac: arma.mac,
      offsetX: 0, // Valores default, se configurarán en alineación
      offsetY: 0,
      customName: customNames[arma.mac] || ''
    }));
  }

  /**
   * Descubrir armas desde el simulador
   * @param {number} timeout - Tiempo de espera en milisegundos
   * @returns {Promise<Array>} - Lista de armas descubiertas
   */
  discoverWeapons(timeout = 5000) {
    return new Promise((resolve, reject) => {
      // Verificar conexión
      if (!webSocketService.isConnected) {
        reject(new Error('no_connection'));
        return;
      }

      let timeoutId = null;
      let listenerAdded = false;

      // Handler para la respuesta
      const handleListaArmas = (data) => {
        clearTimeout(timeoutId);
        
        if (listenerAdded) {
          webSocketService.removeListener('lista_armas', handleListaArmas);
        }

        if (data.armas && Array.isArray(data.armas)) {
          const processedWeapons = this.processWeapons(data.armas);
          this.saveWeapons(processedWeapons);
          resolve(processedWeapons);
        } else {
          resolve([]);
        }
      };

      try {
        // Agregar listener
        webSocketService.addListener('lista_armas', handleListaArmas);
        listenerAdded = true;

        // Configurar timeout
        timeoutId = setTimeout(() => {
          if (listenerAdded) {
            webSocketService.removeListener('lista_armas', handleListaArmas);
          }
          reject(new Error('timeout'));
        }, timeout);

        // Enviar solicitud
        webSocketService.solicitarListaArmas();

      } catch (error) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (listenerAdded) {
          webSocketService.removeListener('lista_armas', handleListaArmas);
        }
        reject(error);
      }
    });
  }

  /**
   * Guardar lista de armas en sessionStorage
   */
  saveWeapons(weapons) {
    try {
      // Guardar sin nombres personalizados
      const weaponsToSave = weapons.map(w => ({
        id: w.id,
        nombre: w.nombre,
        tipo: w.tipo,
        mac: w.mac,
        offsetX: w.offsetX,
        offsetY: w.offsetY
      }));
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(weaponsToSave));
    } catch (error) {
      console.error('Error al guardar armas:', error);
    }
  }

  /**
   * Cargar lista de armas desde sessionStorage
   */
  loadWeapons() {
    try {
      const savedWeapons = sessionStorage.getItem(this.STORAGE_KEY);
      
      if (!savedWeapons) {
        return [];
      }

      const weaponsList = JSON.parse(savedWeapons);
      const customNames = this.loadCustomNames();

      // Aplicar nombres personalizados
      return weaponsList.map(weapon => ({
        ...weapon,
        customName: customNames[weapon.mac] || ''
      }));

    } catch (error) {
      console.error('Error al cargar armas:', error);
      return [];
    }
  }

  /**
   * Cargar nombres personalizados desde localStorage
   */
  loadCustomNames() {
    try {
      const savedCustomNames = localStorage.getItem(this.CUSTOM_NAMES_KEY);
      return savedCustomNames ? JSON.parse(savedCustomNames) : {};
    } catch (error) {
      console.error('Error al cargar nombres personalizados:', error);
      return {};
    }
  }

  /**
   * Guardar nombres personalizados en localStorage
   */
  saveCustomNames(weapons) {
    try {
      const customNames = {};
      weapons.forEach(weapon => {
        if (weapon.customName) {
          customNames[weapon.mac] = weapon.customName;
        }
      });
      localStorage.setItem(this.CUSTOM_NAMES_KEY, JSON.stringify(customNames));
    } catch (error) {
      console.error('Error al guardar nombres personalizados:', error);
    }
  }

  /**
   * Actualizar nombre personalizado de un arma
   */
  updateWeaponName(weapons, weaponId, newName) {
    const updatedWeapons = weapons.map(w => 
      w.id === weaponId 
        ? { ...w, customName: newName }
        : w
    );
    
    this.saveCustomNames(updatedWeapons);
    return updatedWeapons;
  }

  /**
   * Limpiar datos de armas
   */
  clearWeapons() {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}

export const gunService = new GunService();
