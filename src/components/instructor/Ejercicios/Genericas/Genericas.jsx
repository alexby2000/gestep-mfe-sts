import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, LayoutGrid, List, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ConfirmSitCardWithTabs } from '../../../common/ConfirmSitCardWithTabs';
import { ConfirmCardGenericas } from './ConfirmCardGenericas';
import situacionesData from './situacionesGenericas.json';
import styles from './Genericas.module.css';

const categorias = ['Todas', 'Blancos Móviles', 'Libre', 'Blancos Fijos', 'Laberinto'];

export const Genericas = () => {
  const navigate = useNavigate();
  const [vistaMode, setVistaMode] = useState('netflix'); // 'netflix' o 'tabla'
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const carouselRefs = useRef({});
  const [scrollStates, setScrollStates] = useState({});
  const [selectedSituacion, setSelectedSituacion] = useState(null);

  const handleIniciarEjercicio = (situacion, numTiradoresSeleccionados) => {
    // Navegar al reproductor con los datos del ejercicio
    navigate('/sts/ejercicios/genericas/reproductor', {
      state: {
        situacion,
        numTiradores: numTiradoresSeleccionados
      }
    });
  };

  const handleCardClick = (situacion) => {
    setSelectedSituacion(situacion);
  };

  const handleCloseDrawer = () => {
    setSelectedSituacion(null);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoriaSeleccionada('Todas');
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = searchTerm !== '' || categoriaSeleccionada !== 'Todas';

  // Obtener texto descriptivo de los filtros activos
  const getFilterDescription = () => {
    const filters = [];
    if (searchTerm) {
      filters.push(`"${searchTerm}"`);
    }
    if (categoriaSeleccionada !== 'Todas') {
      filters.push(categoriaSeleccionada);
    }
    return filters.join(' y ');
  };

  // Filtrar situaciones
  const situacionesFiltradas = situacionesData.situaciones.filter(situacion => {
    const matchSearch = situacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       situacion.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = categoriaSeleccionada === 'Todas' || situacion.categoria === categoriaSeleccionada;
    return matchSearch && matchCategoria;
  });

  // Agrupar por categoría para vista Netflix
  // Si hay filtros activos, mostrar todo en una sola sección "Filtrado por..."
  const situacionesPorCategoria = hasActiveFilters 
    ? { [getFilterDescription()]: situacionesFiltradas }
    : categorias.slice(1).reduce((acc, categoria) => {
        acc[categoria] = situacionesFiltradas.filter(s => s.categoria === categoria);
        return acc;
      }, {});

  // Actualizar estado de scroll
  const updateScrollState = (categoria) => {
    const carousel = carouselRefs.current[categoria];
    if (carousel) {
      const { scrollLeft, scrollWidth, clientWidth } = carousel;
      setScrollStates(prev => ({
        ...prev,
        [categoria]: {
          canScrollLeft: scrollLeft > 10,
          canScrollRight: scrollLeft < scrollWidth - clientWidth - 10
        }
      }));
    }
  };

  // Scroll del carrusel estilo Netflix (desplaza una sección completa)
  const scrollCarousel = (categoria, direction) => {
    const carousel = carouselRefs.current[categoria];
    if (carousel) {
      const scrollAmount = carousel.clientWidth;
      carousel.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      
      setTimeout(() => updateScrollState(categoria), 350);
    }
  };

  // Inicializar estados de scroll al montar y cuando cambian las situaciones
  useEffect(() => {
    const timer = setTimeout(() => {
      Object.keys(situacionesPorCategoria).forEach(categoria => {
        updateScrollState(categoria);
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [vistaMode, searchTerm, categoriaSeleccionada]);

  return (
    <div className={styles.container}>
      {/* Barra de filtros y controles */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Buscar situaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          className={styles.categorySelect}
        >
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            className={styles.resetButton}
            onClick={handleResetFilters}
            title="Limpiar filtros"
          >
            <X size={18} />
            <span>Limpiar</span>
          </button>
        )}

        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleButton} ${vistaMode === 'netflix' ? styles.active : ''}`}
            onClick={() => setVistaMode('netflix')}
            title="Vista Carrusel"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            className={`${styles.toggleButton} ${vistaMode === 'tabla' ? styles.active : ''}`}
            onClick={() => setVistaMode('tabla')}
            title="Vista Tabla"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Vista Netflix con carruseles por categoría */}
      {vistaMode === 'netflix' && (
        <div className={styles.netflixView}>
          {Object.entries(situacionesPorCategoria).map(([categoria, situaciones]) => {
            if (situaciones.length === 0 && categoriaSeleccionada !== 'Todas') return null;
            if (situaciones.length === 0) return null;

            return (
              <div key={categoria} className={styles.categorySection}>
                <h2 className={styles.categoryTitle}>
                  {hasActiveFilters ? `Filtrado por ${categoria}` : categoria}
                </h2>
                
                {/* Si hay filtros activos, mostrar grilla en lugar de carrusel */}
                {hasActiveFilters ? (
                  <div className={styles.gridContainer}>
                    {situaciones.map((situacion) => (
                      <div 
                        key={situacion.id} 
                        className={styles.gridCard}
                        onClick={() => handleCardClick(situacion)}
                      >
                        <div className={styles.cardImage}>
                          <img src={situacion.imagen} alt={situacion.nombre} />
                          <div className={styles.cardOverlay}>
                            <button 
                              className={styles.playButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(situacion);
                              }}
                            >
                              <Play size={20} fill="currentColor" color="#000" />
                            </button>
                          </div>
                        </div>
                        
                        <div className={styles.cardContent}>
                          <h3 className={styles.cardTitle}>{situacion.nombre}</h3>
                          <p className={styles.cardDescription}>{situacion.descripcion}</p>
                          <div className={styles.cardMeta}>
                            <span className={styles.metaBadge}>{situacion.categoria}</span>
                            {situacion.etiquetas && situacion.etiquetas.map((etq, i) => (
                              <span key={i} className={styles.tagBadge}>{etq}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.carouselContainer}>
                    {scrollStates[categoria]?.canScrollLeft && (
                      <button
                        className={`${styles.carouselButton} ${styles.carouselButtonLeft}`}
                        onClick={() => scrollCarousel(categoria, 'left')}
                      >
                        <ChevronLeft size={32} strokeWidth={3} />
                      </button>
                    )}

                    <div 
                      className={styles.carousel}
                      ref={el => carouselRefs.current[categoria] = el}
                      onScroll={() => updateScrollState(categoria)}
                    >
                      {situaciones.map((situacion) => (
                        <div 
                          key={situacion.id} 
                          className={styles.carouselCard}
                          onClick={() => handleCardClick(situacion)}
                        >
                          <div className={styles.cardImage}>
                            <img src={situacion.imagen} alt={situacion.nombre} />
                            <div className={styles.cardOverlay}>
                              <button 
                                className={styles.playButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCardClick(situacion);
                                }}
                              >
                                <Play size={20} fill="currentColor" color="#000" />
                              </button>
                            </div>
                          </div>
                          
                          <div className={styles.cardContent}>
                            <h3 className={styles.cardTitle}>{situacion.nombre}</h3>
                            <p className={styles.cardDescription}>{situacion.descripcion}</p>
                            <div className={styles.cardMeta}>
                              <span className={styles.metaBadge}>{situacion.categoria}</span>
                              {situacion.etiquetas && situacion.etiquetas.map((etq, i) => (
                                <span key={i} className={styles.tagBadge}>{etq}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {scrollStates[categoria]?.canScrollRight && (
                      <button
                        className={`${styles.carouselButton} ${styles.carouselButtonRight}`}
                        onClick={() => scrollCarousel(categoria, 'right')}
                      >
                        <ChevronRight size={32} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Vista Tabla */}
      {vistaMode === 'tabla' && (
        <div className={styles.tableView}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Situación</th>
                <th>Categoría</th>
                <th>Tipos de Blancos</th>
              </tr>
            </thead>
            <tbody>
              {situacionesFiltradas.map((situacion) => (
                <tr 
                  key={situacion.id}
                  className={styles.tableRow}
                  onClick={() => handleCardClick(situacion)}
                >
                  <td>
                    <div className={styles.tableCellWithDesc}>
                      <strong>{situacion.nombre}</strong>
                      <span className={styles.tableDescription}>{situacion.descripcion}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.metaBadge}>{situacion.categoria}</span>
                  </td>
                  <td>{situacion.tiposBlancos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer lateral para confirmar inicio de ejercicio */}
      <ConfirmSitCardWithTabs 
        isOpen={!!selectedSituacion} 
        onClose={handleCloseDrawer}
        tabs={{
          general: selectedSituacion && (
            <ConfirmCardGenericas 
              situacion={selectedSituacion}
              onIniciar={handleIniciarEjercicio}
            />
          ),
          habilidades: {
            items: selectedSituacion?.habilidades || []
          },
          blancos: {
            items: selectedSituacion?.blancos || []
          },
          condiciones: {
            bloqueado: true,
            items: []
          }
        }}
      />
    </div>
  );
};