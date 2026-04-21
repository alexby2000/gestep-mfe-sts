// Servicio para manejar la configuración del simulador

class ConfigService {
  constructor() {
    this.CONFIG_KEY = 'config_simulador';
  }

  // Obtener configuración del localStorage
  getConfig() {
    try {
      const saved = localStorage.getItem(this.CONFIG_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      return null;
    }
  }

  // Guardar configuración en localStorage
  saveConfig(config) {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      return false;
    }
  }

  // Verificar si la configuración está completa
  isConfigComplete() {
    const config = this.getConfig();
    if (!config) return false;

    // Verificar que todos los campos requeridos estén presentes y no vacíos
    const requiredFields = ['alturaPantalla', 'anchoPantalla', 'distTiradorPantalla', 'alturaPiso'];
    return requiredFields.every(field => {
      const value = config[field];
      return value !== '' && value !== null && value !== undefined && !isNaN(value);
    });
  }

  // Obtener configuración para enviar al simulador
  getConfigForSimulator() {
    const config = this.getConfig();
    if (!config) return null;

    return {
      alturaPantalla: parseFloat(config.alturaPantalla),
      anchoPantalla: parseFloat(config.anchoPantalla),
      distTiradorPantalla: parseFloat(config.distTiradorPantalla),
      alturaPiso: parseFloat(config.alturaPiso)
    };
  }
}

export const configService = new ConfigService();
