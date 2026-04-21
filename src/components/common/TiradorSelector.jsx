import React, { useState, useEffect } from 'react';
import { Search, X, UserX, Calendar, CalendarRange, Target } from 'lucide-react';
import alumnosData from '../instructor/alumnos.json'; // TODO: Cambiar a llamada a BD
import situacionesData from '../instructor/Ejercicios/ARA/situacionesARA.json';
import styles from './TiradorSelector.module.css';

export const TiradorSelector = ({ isOpen, onClose, onSelectTirador, tiradoresSeleccionados = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('nombre');
  const [alumnos, setAlumnos] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Estados para filtros complejos
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [diasMin, setDiasMin] = useState('');
  const [diasMax, setDiasMax] = useState('');
  const [situacionSeleccionada, setSituacionSeleccionada] = useState('');
  const [armaSeleccionada, setArmaSeleccionada] = useState('');
  
  // Obtener situaciones únicas de la BD
  const situacionesUnicas = [...new Set(situacionesData.situacionesARA.map(s => s.nombre))];
  const armasUnicas = [...new Set(situacionesData.situacionesARA.map(s => s.arma))];

  // Calcular edad desde fecha de nacimiento
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Calcular días transcurridos desde fecha de evaluación (formato DD/MM/YYYY)
  const calcularDiasTranscurridos = (fechaStr) => {
    if (!fechaStr) return 0;
    const [dia, mes, anio] = fechaStr.split('/');
    const fechaEvaluacion = new Date(anio, mes - 1, dia);
    const hoy = new Date();
    const diferencia = hoy - fechaEvaluacion;
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  };

  // Convertir fecha DD/MM/YYYY a Date
  const parseFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const [dia, mes, anio] = fechaStr.split('/');
    return new Date(anio, mes - 1, dia);
  };
  
  // Limpiar filtros complejos al cambiar tipo de filtro
  const handleFilterChange = (newFilter) => {
    setFilterBy(newFilter);
    setSearchTerm('');
    setFechaDesde('');
    setFechaHasta('');
    setDiasMin('');
    setDiasMax('');
    setSituacionSeleccionada('');
    setArmaSeleccionada('');
    setIsFilterOpen(false);
  };

  useEffect(() => {
    // TODO: Llamada a BD para obtener alumnos del instructor
    setAlumnos(alumnosData.alumnos.sort((a, b) => a.apellido.localeCompare(b.apellido)));
  }, []);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const filteredAlumnos = alumnos.filter(alumno => {
    // Excluir ya seleccionados (filtrar null/undefined)
    if (tiradoresSeleccionados.filter(Boolean).some(t => t.id === alumno.id)) return false;
    
    const value = searchTerm.toLowerCase();
    
    switch (filterBy) {
      case 'nombre':
        if (!searchTerm) return true;
        return `${alumno.nombre} ${alumno.apellido}`.toLowerCase().includes(value);
        
      case 'dni':
        if (!searchTerm) return true;
        return alumno.dni.includes(value);
        
      case 'rango':
        if (!searchTerm) return true;
        return alumno.rango.toLowerCase().includes(value);
        
      case 'especialidad':
        if (!searchTerm) return true;
        return (alumno.especialidad || '').toLowerCase().includes(value);
        
      case 'fechaEvaluacion':
        if (!fechaDesde && !fechaHasta) return true;
        const fechaEval = parseFecha(alumno.ultimaEvaluacion?.fecha);
        if (!fechaEval) return false;
        
        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta) : null;
        
        if (desde && hasta) return fechaEval >= desde && fechaEval <= hasta;
        if (desde) return fechaEval >= desde;
        if (hasta) return fechaEval <= hasta;
        return true;
        
      case 'diasEvaluacion':
        if (!diasMin && !diasMax) return true;
        const dias = calcularDiasTranscurridos(alumno.ultimaEvaluacion?.fecha);
        const min = diasMin ? parseInt(diasMin) : null;
        const max = diasMax ? parseInt(diasMax) : null;
        
        if (min !== null && max !== null) return dias >= min && dias <= max;
        if (min !== null) return dias >= min;
        if (max !== null) return dias <= max;
        return true;
        
      default:
        return true;
    }
  });

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Seleccionar Tirador</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.searchSection}>
          <label className={styles.filterLabel}>Filtrar por:</label>
          
          <div className={styles.customSelect}>
            <button
              className={styles.selectButton}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              type="button"
            >
              <span>
                {filterBy === 'nombre' && 'Nombre'}
                {filterBy === 'dni' && 'DNI'}
                {filterBy === 'rango' && 'Rango'}
                {filterBy === 'especialidad' && 'Especialidad'}
                {filterBy === 'fechaEvaluacion' && 'Fecha Ult. Evaluación'}
                {filterBy === 'diasEvaluacion' && 'Días desde Evaluación'}
              </span>
              <svg
                className={`${styles.selectArrow} ${isFilterOpen ? styles.open : ''}`}
                width="20"
                height="20"
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
            {isFilterOpen && (
              <div className={styles.selectDropdown}>
                <button
                  className={`${styles.selectOption} ${filterBy === 'nombre' ? styles.selected : ''}`}
                  onClick={() => handleFilterChange('nombre')}
                  type="button"
                >
                  Nombre
                </button>
                <button
                  className={`${styles.selectOption} ${filterBy === 'dni' ? styles.selected : ''}`}
                  onClick={() => handleFilterChange('dni')}
                  type="button"
                >
                  DNI
                </button>
                <button
                  className={`${styles.selectOption} ${filterBy === 'rango' ? styles.selected : ''}`}
                  onClick={() => handleFilterChange('rango')}
                  type="button"
                >
                  Rango
                </button>
                <button
                  className={`${styles.selectOption} ${filterBy === 'especialidad' ? styles.selected : ''}`}
                  onClick={() => handleFilterChange('especialidad')}
                  type="button"
                >
                  Especialidad
                </button>
                <button
                  className={`${styles.selectOption} ${filterBy === 'fechaEvaluacion' ? styles.selected : ''}`}
                  onClick={() => handleFilterChange('fechaEvaluacion')}
                  type="button"
                >
                  Fecha Ult. Evaluación
                </button>
                <button
                  className={`${styles.selectOption} ${filterBy === 'diasEvaluacion' ? styles.selected : ''}`}
                  onClick={() => handleFilterChange('diasEvaluacion')}
                  type="button"
                >
                  Días desde Evaluación
                </button>
              </div>
            )}
          </div>
          
          {/* Filtros de texto simple */}
          {['nombre', 'dni', 'rango', 'especialidad'].includes(filterBy) && (
            <div className={styles.searchInputWrapper}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder={`Buscar por ${
                  filterBy === 'nombre' ? 'nombre' : 
                  filterBy === 'dni' ? 'DNI' : 
                  filterBy === 'rango' ? 'rango' : 
                  'especialidad'
                }...`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {searchTerm && (
                <button className={styles.clearBtn} onClick={() => setSearchTerm('')}>
                  <X size={16} />
                </button>
              )}
            </div>
          )}
          
          {/* Filtro de rango de fechas */}
          {filterBy === 'fechaEvaluacion' && (
            <>
              <div className={styles.dateInputWrapper}>
                <CalendarRange size={16} className={styles.dateIcon} />
                <label className={styles.dateLabel}>Desde:</label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={e => setFechaDesde(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              <div className={styles.dateInputWrapper}>
                <label className={styles.dateLabel}>Hasta:</label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={e => setFechaHasta(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
              {(fechaDesde || fechaHasta) && (
                <button 
                  className={styles.clearFilterBtn} 
                  onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                >
                  <X size={16} />
                </button>
              )}
            </>
          )}
          
          {/* Filtro de días (min-max) */}
          {filterBy === 'diasEvaluacion' && (
            <>
              <div className={styles.rangeInputWrapper}>
                <Calendar size={16} className={styles.rangeIcon} />
                <label className={styles.rangeLabel}>Mín:</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={diasMin}
                  onChange={e => setDiasMin(e.target.value)}
                  className={styles.rangeInput}
                />
              </div>
              <div className={styles.rangeInputWrapper}>
                <label className={styles.rangeLabel}>Máx:</label>
                <input
                  type="number"
                  min="0"
                  placeholder="∞"
                  value={diasMax}
                  onChange={e => setDiasMax(e.target.value)}
                  className={styles.rangeInput}
                />
              </div>
              {(diasMin || diasMax) && (
                <button 
                  className={styles.clearFilterBtn} 
                  onClick={() => { setDiasMin(''); setDiasMax(''); }}
                >
                  <X size={16} />
                </button>
              )}
            </>
          )}
        </div>

        <div className={styles.alumnosList}>
          {filteredAlumnos.length === 0 ? (
            <div className={styles.noResults}>
              <UserX size={48} />
              <p>No se encontraron alumnos que coincidan con la búsqueda.</p>
            </div>
          ) : (
            filteredAlumnos.map(alumno => (
              <div
                key={alumno.id}
                className={styles.alumnoCard}
                onClick={() => {
                  onSelectTirador(alumno);
                  onClose();
                }}
              >
                <div className={styles.alumnoFoto}>
                  {alumno.fotoPerfil ? (
                    <img 
                      src={alumno.fotoPerfil} 
                      alt={`${alumno.nombre} ${alumno.apellido}`}
                      onError={(e) => {
                        if (e.target.getAttribute('data-error') !== 'true') {
                          e.target.setAttribute('data-error', 'true');
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<span>${alumno.nombre.charAt(0)}${alumno.apellido.charAt(0)}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span>{alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}</span>
                  )}
                </div>
                <div className={styles.fichaTecnica}>
                  <div className={styles.fichaIzquierda}>
                    <div className={styles.nombreConRango}>
                      <span className={styles.fichaNombre}>
                        {alumno.nombre} {alumno.apellido}
                      </span>
                      <span className={styles.rangoBadge}>{alumno.rango}</span>
                    </div>
                    
                    <div className={styles.dni}>
                      <span className={styles.dniLabel}>DNI:</span>
                      <span className={styles.dniValue}>{alumno.dni}</span>
                    </div>
                    
                    <div className={styles.infoLinea}>
                      <span className={styles.infoItem}>
                        <span className={styles.infoLabel}>Edad:</span>
                        <span className={styles.infoValue}>{calcularEdad(alumno.fechaNacimiento)} años</span>
                      </span>
                      <span className={styles.infoDivider}>•</span>
                      <span className={styles.infoItem}>
                        <span className={styles.infoLabel}>Especialidad:</span>
                        <span className={styles.infoValue}>{alumno.especialidad || 'N/A'}</span>
                      </span>
                    </div>
                  </div>
                  
                  {alumno.ultimaEvaluacion && (
                    <>
                      <div className={styles.separadorVertical}></div>
                      
                      <div className={styles.fichaDerecha}>
                        <div className={styles.evaluacionHeader}>
                          <Calendar size={12} />
                          <span>Última Evaluación</span>
                        </div>
                        
                        <div className={styles.evaluacionInfo}>
                          <div className={styles.evaluacionLinea}>
                            <span className={styles.evaluacionLabel}>Fecha:</span>
                            <span className={styles.evaluacionValue}>
                              {alumno.ultimaEvaluacion.fecha} <span className={styles.diasTranscurridos}>({calcularDiasTranscurridos(alumno.ultimaEvaluacion.fecha)}d)</span>
                            </span>
                          </div>
                          <div className={styles.evaluacionLinea}>
                            <span className={styles.evaluacionLabel}>Situación:</span>
                            <span className={styles.evaluacionValue}>{alumno.ultimaEvaluacion.situacion}</span>
                          </div>
                          <div className={styles.evaluacionLinea}>
                            <span className={styles.evaluacionLabel}>Arma:</span>
                            <span className={styles.evaluacionValue}>{alumno.ultimaEvaluacion.arma}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};