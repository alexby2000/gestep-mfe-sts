import React, { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Grid3X3, List, X, SearchX, Rows3, AlertCircle } from 'lucide-react';
import pistolaIcon from '../../../../assets/armas/pistola9mm.png';
import fusilIcon from '../../../../assets/armas/fusil.svg';
import situacionesData from "./situacionesARA.json";
import { getSituacionesARA } from '../../../../services/Situaciones/araService';
import NetflixStyle from "./SituacionViews/NetflixStyle";
import ListStyle from "./SituacionViews/ListStyle";
import TableStyle from "./SituacionViews/TableStyle";
import { AsideARA } from "./AsideARA";
import styles from "./ARA.module.css";

export const ARA = ({ modo = 'ejercitacion' }) => {
  const navigate = useNavigate();
  
  // Estados para carga desde BD
  const [situaciones, setSituaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isErrorExiting, setIsErrorExiting] = useState(false);
  
  const [vistaMode, setVistaMode] = useState(() => {
    return localStorage.getItem('ara-vista-mode') || 'netflix';
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArma, setFilterArma] = useState('Todas');
  const [tiradoresSeleccionados, setTiradoresSeleccionados] = useState(() => {
    const saved = sessionStorage.getItem('ara-tiradores-seleccionados');
    return saved ? JSON.parse(saved) : [];
  });
  const [situacionSeleccionada, setSituacionSeleccionada] = useState(() => {
    const saved = sessionStorage.getItem('ara-situacion-seleccionada');
    return saved ? JSON.parse(saved) : null;
  });
  const [cargando, setCargando] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isArmaDropdownOpen, setIsArmaDropdownOpen] = useState(false);
  const [isViewDropdownOpen, setIsViewDropdownOpen] = useState(false);

  // Handler para iniciar ejercicio - navegar al reproductor
  const handleIniciarEjercicio = (situacion, tiradores) => {
    // Guardar estado en sessionStorage para restaurar al regresar
    sessionStorage.setItem('ara-situacion-seleccionada', JSON.stringify(situacion));
    sessionStorage.setItem('ara-tiradores-seleccionados', JSON.stringify(tiradores));
    
    navigate('/sts/ejercicios/ara/reproductor', {
      state: {
        situacion,
        tiradores,
        cantidadTiradores: tiradores.length,
        modo
      }
    });
  };

  // Cargar situaciones desde la base de datos
  useEffect(() => {
    const cargarSituaciones = async () => {
      try {
        setLoading(true);
        
        const data = await getSituacionesARA();
        setSituaciones(data);
      } catch {
        // Mostrar banner de error temporal
        setErrorMessage(
          <span>No se pudo conectar al servidor. Usando datos locales como respaldo.</span>
        );
        setIsErrorExiting(false);
        
        // Animar salida y luego ocultar
        setTimeout(() => {
          setIsErrorExiting(true);
          setTimeout(() => setErrorMessage(null), 400); // Tiempo de la animación
        }, 4600); // Mostrar por 4.6s antes de animar salida
        
        // Fallback: usar datos locales si falla la API
        setSituaciones(situacionesData.situacionesARA);
      } finally {
        setLoading(false);
      }
    };

    cargarSituaciones();
  }, []);

  // Guardar la vista seleccionada en localStorage
  useEffect(() => {
    localStorage.setItem('ara-vista-mode', vistaMode);
  }, [vistaMode]);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [filterArma]);

  // Limpiar sessionStorage al desmontar el componente (si no vamos al reproductor)
  useEffect(() => {
    return () => {
      // Solo limpiar si estamos navegando fuera de ARA (no al reproductor)
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/ejercicios/ara')) {
        sessionStorage.removeItem('ara-situacion-seleccionada');
        sessionStorage.removeItem('ara-tiradores-seleccionados');
      }
    };
  }, []);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      const filterDropdown = event.target.closest(`.${styles.filterDropdown}`);
      const viewDropdown = event.target.closest(`.${styles.viewDropdown}`);
      
      if (!filterDropdown && isArmaDropdownOpen) {
        setIsArmaDropdownOpen(false);
      }
      if (!viewDropdown && isViewDropdownOpen) {
        setIsViewDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isArmaDropdownOpen, isViewDropdownOpen]);

  // Filtrado de situaciones
  const situacionesFiltradas = situaciones.filter(sit => {
    if (!searchTerm) return true;
    const normalizedSearchTerm = searchTerm.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const tiempoStr = sit.tiempo === 'Sin límite' ? 'Sin límite' : `${sit.tiempo} segundos`;
    const municionStr = `${sit.municionTotal} balas`;
    const distanciaStr = `${sit.distancia} metros`;
    const searchString = `${sit.nombre || ''} ${sit.arma || ''} ${sit.postura || ''} ${tiempoStr} ${municionStr} ${distanciaStr} ${sit.exigencia || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return searchString.includes(normalizedSearchTerm);
  });

  const situacionesAgrupadas = {
    Pistola: situacionesFiltradas.filter(s => s.arma === 'Pistola'),
    FAL: situacionesFiltradas.filter(s => s.arma === 'FAL')
  };




  // ##########################################################################
  // ########################## Componente principal ##########################
  // ##########################################################################
  return (
    <>
      {errorMessage && <div className={`${styles.bannerError} ${isErrorExiting ? styles.bannerErrorExit : ''}`}>{errorMessage}</div>}
      <div className={`${styles.araWrapper} ${styles.araLayout} ${loading ? styles.loadingState : ''}`}>
        <div className={styles.araMain}>
        <div className={styles.controlsBar}>
          {/* Dropdown de Filtro de Armas */}
          <div className={styles.filterDropdown}>
            <button 
              className={styles.dropdownTrigger}
              onClick={() => setIsArmaDropdownOpen(!isArmaDropdownOpen)}
              disabled={loading}
            >
              <div className={styles.triggerContent}>
                {filterArma === 'Todas' && (
                  <>
                    <div className={styles.filterIconWrapper}>
                      <List size={20} />
                    </div>
                    <span>Todas ({situacionesAgrupadas.Pistola.length + situacionesAgrupadas.FAL.length})</span>
                  </>
                )}
                {filterArma === 'Pistola' && (
                  <>
                    <div className={styles.filterIconWrapper}>
                      <img src={pistolaIcon} alt="Pistola" className={styles.weaponIcon} />
                    </div>
                    <span>Pistola ({situacionesAgrupadas.Pistola.length})</span>
                  </>
                )}
                {filterArma === 'FAL' && (
                  <>
                    <div className={styles.filterIconWrapper}>
                      <img src={fusilIcon} alt="FAL" className={styles.weaponIcon} />
                    </div>
                    <span>FAL ({situacionesAgrupadas.FAL.length})</span>
                  </>
                )}
              </div>
              <svg
                className={`${styles.dropdownArrow} ${isArmaDropdownOpen ? styles.open : ''}`}
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {isArmaDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  className={`${styles.dropdownItem} ${filterArma === 'Todas' ? styles.active : ''}`}
                  onClick={() => {
                    setFilterArma('Todas');
                    setIsArmaDropdownOpen(false);
                  }}
                >
                  <div className={styles.filterIconWrapper}>
                    <List size={20} />
                  </div>
                  <span>Todas ({situacionesAgrupadas.Pistola.length + situacionesAgrupadas.FAL.length})</span>
                </button>
                <button
                  className={`${styles.dropdownItem} ${filterArma === 'Pistola' ? styles.active : ''}`}
                  onClick={() => {
                    setFilterArma('Pistola');
                    setIsArmaDropdownOpen(false);
                  }}
                >
                  <div className={styles.filterIconWrapper}>
                    <img src={pistolaIcon} alt="Pistola" className={styles.weaponIcon} />
                  </div>
                  <span>Pistola ({situacionesAgrupadas.Pistola.length})</span>
                </button>
                <button
                  className={`${styles.dropdownItem} ${filterArma === 'FAL' ? styles.active : ''}`}
                  onClick={() => {
                    setFilterArma('FAL');
                    setIsArmaDropdownOpen(false);
                  }}
                >
                  <div className={styles.filterIconWrapper}>
                    <img src={fusilIcon} alt="FAL" className={styles.weaponIcon} />
                  </div>
                  <span>FAL ({situacionesAgrupadas.FAL.length})</span>
                </button>
              </div>
            )}
          </div>

          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar situaciones..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              disabled={loading}
            />
            {searchTerm && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchTerm('')}
                disabled={loading}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Dropdown de Vistas */}
          <div className={styles.viewDropdown}>
            <button 
              className={styles.dropdownTrigger}
              onClick={() => setIsViewDropdownOpen(!isViewDropdownOpen)}
              disabled={loading}
            >
              {vistaMode === 'netflix' && <Grid3X3 size={20} />}
              {vistaMode === 'lista' && <List size={20} />}
              {vistaMode === 'table' && <Rows3 size={20} />}
              <svg
                className={`${styles.dropdownArrow} ${isViewDropdownOpen ? styles.open : ''}`}
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {isViewDropdownOpen && (
              <div className={`${styles.dropdownMenu} ${styles.viewMenu}`}>
                <button
                  className={`${styles.dropdownItem} ${vistaMode === 'netflix' ? styles.active : ''}`}
                  onClick={() => {
                    setVistaMode('netflix');
                    setIsViewDropdownOpen(false);
                  }}
                >
                  <Grid3X3 size={20} />
                  <span>Grilla</span>
                </button>
                <button
                  className={`${styles.dropdownItem} ${vistaMode === 'lista' ? styles.active : ''}`}
                  onClick={() => {
                    setVistaMode('lista');
                    setIsViewDropdownOpen(false);
                  }}
                >
                  <List size={20} />
                  <span>Lista</span>
                </button>
                <button
                  className={`${styles.dropdownItem} ${vistaMode === 'table' ? styles.active : ''}`}
                  onClick={() => {
                    setVistaMode('table');
                    setIsViewDropdownOpen(false);
                  }}
                >
                  <Rows3 size={20} />
                  <span>Tabla</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className={styles.contentLoadingContainer}>
            <div className={styles.spinner} />
            <p>Cargando situaciones ARA...</p>
          </div>
        ) : situacionesFiltradas.length === 0 ? (
          <div className={styles.noResults}>
            <SearchX size={64} strokeWidth={1.5} />
            <p>No se encontraron situaciones</p>
            <span>Intenta con otros términos de búsqueda</span>
          </div>
        ) : vistaMode === 'netflix' ? (
          <NetflixStyle
            situacionesAgrupadas={situacionesAgrupadas}
            filterArma={filterArma}
            onSelect={setSituacionSeleccionada}
            animating={animating}
          />
        ) : vistaMode === 'lista' ? (
          <ListStyle
            situacionesAgrupadas={situacionesAgrupadas}
            filterArma={filterArma}
            onSelect={setSituacionSeleccionada}
            animating={animating}
          />
        ) : (
          <TableStyle
            situacionesAgrupadas={situacionesAgrupadas}
            filterArma={filterArma}
            onSelect={setSituacionSeleccionada}
            animating={animating}
          />
        )}
      </div>

      {createPortal(
        <AsideARA
          situacionSeleccionada={situacionSeleccionada}
          tiradoresSeleccionados={tiradoresSeleccionados}
          setTiradoresSeleccionados={setTiradoresSeleccionados}
          onIniciarEjercicio={handleIniciarEjercicio}
          cargando={cargando}
          setCargando={setCargando}
          setSituacionSeleccionada={setSituacionSeleccionada}
          modo={modo}
          loading={loading}
        />,
        document.body
      )}
      </div>
    </>
  );
};
