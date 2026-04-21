// Configuración del Middleware Backend
const MIDDLEWARE_URL = import.meta.env.VITE_MIDDLEWARE_URL || 'http://localhost:5156';
const TIMEOUT_MS = 5000; // 5 segundos

/**
 * Obtiene todas las situaciones/condiciones de ARA desde la base de datos
 * @returns {Promise<Array>} Array de situaciones ARA
 * @throws {Error} Si hay error en la petición
 */
export async function getSituacionesARA() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${MIDDLEWARE_URL}/api/ara/condiciones`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Normalizar URLs de imágenes agregando la URL base del middleware
    const situaciones = data.situacionesAra.map(sit => ({
      ...sit,
      imagen: sit.imagen ? `${MIDDLEWARE_URL}${sit.imagen}` : sit.imagen,
      // Normalizar URLs de blancos
      blancos: sit.blancos?.map(blanco => ({
        ...blanco,
        imagen: blanco.imagen ? `${MIDDLEWARE_URL}${blanco.imagen}` : blanco.imagen
      })) || []
    }));
    
    return situaciones;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado. No se pudo conectar al servidor.');
    }
    
    throw error;
  }
}
