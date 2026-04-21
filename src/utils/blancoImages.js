/**
 * Utilidad para manejar imágenes de blancos desde el servidor
 * Las imágenes se cargan dinámicamente desde el middleware backend
 */

/**
 * Obtiene la URL de la imagen del blanco
 * @param {string} imagenUrl - URL de la imagen del blanco desde el servidor
 * @returns {string|null} URL de la imagen o null si no está disponible
 */
export const getBlancoImage = (imagenUrl) => {
  // Simplemente devolver la URL que viene del servidor
  // El servicio araService.js ya construye las URLs completas
  return imagenUrl || null;
};

