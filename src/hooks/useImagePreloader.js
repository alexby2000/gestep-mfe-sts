import { useEffect, useState } from 'react';

/**
 * Hook para precargar imágenes en background
 * @param {string[]} imageUrls - Array de URLs de imágenes a precargar
 * @param {boolean} shouldPreload - Si debe iniciar la precarga
 * @returns {Object} Estado de carga de cada imagen
 */
export const useImagePreloader = (imageUrls, shouldPreload = true) => {
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    if (!shouldPreload || !imageUrls || imageUrls.length === 0) {
      return;
    }

    const preloadImage = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [url]: 'loaded' }));
          resolve(url);
        };
        img.onerror = () => {
          setLoadedImages(prev => ({ ...prev, [url]: 'error' }));
          reject(url);
        };
        img.src = url;
      });
    };

    // Iniciar precarga de todas las imágenes
    imageUrls.forEach(url => {
      if (url && !loadedImages[url]) {
        setLoadedImages(prev => ({ ...prev, [url]: 'loading' }));
        preloadImage(url).catch(err => {
          console.warn('Error precargando imagen:', err);
        });
      }
    });
  }, [shouldPreload, imageUrls.join(',')]);

  return loadedImages;
};
