import React, { useState } from 'react';
import { UserPlus, X, Anchor, Play, Ruler, Package, Clock, CirclePlus } from 'lucide-react';
import { webSocketService } from '../../../../services/webSocketService';
import araIcon from '../../../../assets/tipos/ara.png';
import { TiradorSelector } from '../../../common/TiradorSelector';
import styles from './AsideARA.module.css';

// Componente para manejar la foto del tirador con fallback a iniciales
const TiradorFoto = ({ tirador }) => {
  const [imageError, setImageError] = useState(false);
  
  if (!tirador.fotoPerfil || imageError) {
    return <span>{tirador.nombre.charAt(0)}{tirador.apellido.charAt(0)}</span>;
  }
  
  return (
    <img 
      src={tirador.fotoPerfil} 
      alt={`${tirador.nombre} ${tirador.apellido}`}
      onError={() => setImageError(true)}
    />
  );
};

export const AsideARA = ({
  situacionSeleccionada,
  tiradoresSeleccionados,
  setTiradoresSeleccionados,
  onIniciarEjercicio,
  cargando,
  setCargando,
  setSituacionSeleccionada,
  modo = 'ejercitacion',
  loading = false
}) => {
  const maxSeleccion = 4;
  const [showSelector, setShowSelector] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isErrorExiting, setIsErrorExiting] = useState(false);


  // Lógica para quitar tirador - mantiene array compacto
  const handleQuitarTirador = (idx) => {
    const nuevos = [...tiradoresSeleccionados];
    nuevos.splice(idx, 1);
    setTiradoresSeleccionados(nuevos);
  };

  // Abrir selector de tirador - solo si hay espacio
  const handleOpenSlot = () => {
    if (tiradoresSeleccionados.length < maxSeleccion) {
      setShowSelector(true);
    }
  };

  // Seleccionar tirador - agrega en primera posición disponible
  const handleSelectTirador = (tirador) => {
    if (tiradoresSeleccionados.length < maxSeleccion) {
      setTiradoresSeleccionados([...tiradoresSeleccionados, tirador]);
    }
  };



  // Validación para habilitar botón
  const puedeIniciar = tiradoresSeleccionados.length > 0 && situacionSeleccionada;

  const handleQuitarEjercicio = () => {
    setSituacionSeleccionada(null);
  };

  // Render slots
  const slots = Array.from({ length: maxSeleccion }).map((_, idx) => {
    const tirador = tiradoresSeleccionados[idx];
    // Usar ID único del tirador como key cuando existe, sino usar un identificador único para slot vacío
    const uniqueKey = tirador ? `tirador-${tirador.id}` : `empty-${idx}`;
    return (
      <div key={uniqueKey} className={`${styles.tiradorSlotBox} ${tirador ? styles.selected : ''} ${loading ? styles.disabled : ''}`} onClick={() => !loading && !tirador && handleOpenSlot()}>
        {tirador ? (
          <div className={styles.tiradorBoxContent}>
            <div className={styles.tiradorFoto}>
              <TiradorFoto tirador={tirador} />
            </div>
            <div className={styles.tiradorInfo}>
              <p className={styles.tiradorNombre}>{tirador.nombre} {tirador.apellido}</p>
              <p className={styles.tiradorId}>DNI: {tirador.dni}</p>
            </div>
            <button className={styles.tiradorRemoveBtn} onClick={e => { e.stopPropagation(); if (!loading) handleQuitarTirador(idx); }} disabled={loading}><X size={16} /></button>
          </div>
        ) : (
          <div className={styles.tiradorBoxAdd}>
            <UserPlus size={28} />
            <span>Agregar Tirador</span>
          </div>
        )}
      </div>
    );
  });

  return (
    <>
      {errorMessage && <div className={`${styles.bannerError} ${isErrorExiting ? styles.bannerErrorExit : ''}`}>{errorMessage}</div>}
      <aside className={styles.asidePanel}>
      <div className={styles.asideHeader}>
        <h2 className={styles.asideTitle}>Selector de Situación</h2>
        <div className={styles.asideSubtitle}>Configure situación y participantes</div>
      </div>
      <div className={styles.situacionTitleSection}>
        <div className={styles.situacionBoxTitle}>Ejercicio Actual</div>
        <div className={`${styles.quitarEjercicio} ${loading ? styles.disabled : ''}`} onClick={() => !loading && handleQuitarEjercicio()}>Quitar</div>
      </div>
      <div className={`${styles.situacionBoxSection} ${!situacionSeleccionada ? styles.noSeleccion : ''}`}>
        {situacionSeleccionada && <img src={araIcon} alt="ARA" className={styles.anchorIcon} />}
        {situacionSeleccionada ? (
          <div key={situacionSeleccionada.id} className={`${styles.situacionBoxContent} ${styles.fadeIn}`}>
            <div className={`${styles.armaTag} ${styles[situacionSeleccionada.arma === 'Pistola' ? 'pistola' : 'fusil']}`}>
              {situacionSeleccionada.arma}
            </div>
            <div className={styles.situacionBoxNombre}>{situacionSeleccionada.nombre}</div>
            <div className={styles.situacionDetalles}>
              <div className={styles.detalle}>
                <Ruler size={14} />
                <span>{situacionSeleccionada.distancia} metros</span>
              </div>
              <div className={styles.detalle}>
                <Package size={14} />
                <span>{situacionSeleccionada.municionTotal} balas</span>
              </div>
              <div className={styles.detalle}>
                <Clock size={14} />
                <span>{situacionSeleccionada.tiempo === 'Sin límite' ? 'Sin límite' : `${situacionSeleccionada.tiempo} segundos`}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.situacionBoxPlaceholder}>
            <CirclePlus size={32} />
            <span>Selecciona una situación</span>
          </div>
        )}
      </div>
      <div className={styles.tiradoresSection}>
        <div className={styles.tiradoresTitle}>Tiradores ({tiradoresSeleccionados.length}/4)</div>
        <div className={styles.tiradoresSlots}>{slots}</div>
      </div>
      <button
        className={`${styles.iniciarBtnModal} ${cargando ? styles.loading : ''} ${modo === 'evaluacion' ? styles.evaluation : ''}`}
        disabled={loading || cargando}
        onClick={async () => {
          if (!puedeIniciar) {
            setErrorMessage(<span>Debes seleccionar una <em><u>Situación</u></em> y al menos un <em><u>Tirador</u></em>.</span>);
            setIsErrorExiting(false);
            
            // Animar salida y luego ocultar
            setTimeout(() => {
              setIsErrorExiting(true);
              setTimeout(() => setErrorMessage(null), 400);
            }, 2600);
            return;
          }
          
          setCargando(true);
          
          try {
            // Enviar cambio de escena por WebSocket
            webSocketService.cambiarEscena(situacionSeleccionada.escena);
          } catch (error) {
            console.error('Error al enviar escena por WebSocket:', error);
          }
          
          // Dar tiempo al simulador para cargar la escena
          setTimeout(() => {
            onIniciarEjercicio(situacionSeleccionada, tiradoresSeleccionados);
            setCargando(false);
          }, 3000);
        }}
      >
        <span>
          <Play size={16} fill="currentColor" />
          {cargando ? 'Iniciando...' : `Iniciar ${modo === 'ejercitacion' ? 'Ejercitación' : 'Evaluación'}`}
        </span>
      </button>
    </aside>
    <TiradorSelector
      isOpen={showSelector}
      onClose={() => setShowSelector(false)}
      onSelectTirador={handleSelectTirador}
      tiradoresSeleccionados={tiradoresSeleccionados}
    />
  </>
  );
};
