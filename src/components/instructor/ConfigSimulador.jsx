import React, { useState, useEffect, useRef } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { configService } from '../../services/Simulador/configService';
import { webSocketService } from '../../services/webSocketService';
import styles from './ConfigSimulador.module.css';

export const ConfigSimulador = () => {
  const [config, setConfig] = useState({
    alturaPantalla: '', // metros
    anchoPantalla: '', // metros
    distTiradorPantalla: '', // metros
    alturaPiso: '' // metros
  });

  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, success, error
  const [hasChanges, setHasChanges] = useState(false);
  const timeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Cargar configuración desde localStorage al montar
  useEffect(() => {
    const saved = configService.getConfig();
    if (saved) {
      setConfig(saved);
    }
  }, []);

  // Efecto para guardar cambios después de 5 segundos
  useEffect(() => {
    // Solo iniciar si hay cambios
    if (!hasChanges) return;

    // Limpiar timeouts anteriores
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Iniciar contador de 5 segundos
    setSaveStatus('saving');
    
    timeoutRef.current = setTimeout(() => {
      sendConfiguration();
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [config, hasChanges]);

  const sendConfiguration = async () => {
    try {
      // Guardar en localStorage usando el servicio
      configService.saveConfig(config);
      
      // Enviar configuración al simulador si hay conexión y está completa
      if (configService.isConfigComplete()) {
        const connectionStatus = webSocketService.getConnectionStatus();
        if (connectionStatus.isConnected) {
          const configForSimulator = configService.getConfigForSimulator();
          webSocketService.enviarConfiguracion(configForSimulator);
          console.log('Mensaje enviado:', configForSimulator);
        }
      }
      
      // Simular éxito
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaveStatus('success');
      
      // Mostrar checkmark durante 2 segundos
      setTimeout(() => {
        setSaveStatus('idle');
        setHasChanges(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setSaveStatus('error');
      
      // Reintentar después de 5 segundos
      retryTimeoutRef.current = setTimeout(() => {
        sendConfiguration();
      }, 5000);
    }
  };

  const handleChange = (field, value) => {
    const numValue = value === '' ? '' : parseFloat(value) || '';
    setConfig(prev => ({
      ...prev,
      [field]: numValue
    }));
    setHasChanges(true);
  };

  const renderStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Loader2 className={`${styles.statusIcon} ${styles.saving}`} />;
      case 'success':
        return <Check className={`${styles.statusIcon} ${styles.success}`} />;
      case 'error':
        return <AlertCircle className={`${styles.statusIcon} ${styles.error}`} />;
      default:
        return null;
    }
  };

  // Verificar si hay valores válidos para dibujar
  const hasValidValues = () => {
    return config.alturaPantalla !== '' && 
           config.anchoPantalla !== '' && 
           config.distTiradorPantalla !== '' && 
           config.alturaPiso !== '';
  };

  // Calcular posiciones para el SVG (coordenadas fijas para mejor visualización)
  const getSVGPositions = () => {
    if (!hasValidValues()) return null;

    // Convertir a números
    const altura = parseFloat(config.alturaPantalla) || 0;
    const ancho = parseFloat(config.anchoPantalla) || 0;
    const distancia = parseFloat(config.distTiradorPantalla) || 0;
    const alturaPiso = parseFloat(config.alturaPiso) || 0;

    // Posiciones fijas en el SVG (600x400)
  const pisoY = 320;
  const pantallaX = 450;
  const proyectorX = 150;

  // Altura de la pantalla en el dibujo (proporcional pero limitada)
  const alturaPantallaDrawing = Math.min(altura * 60, 180);
  const pantallaBaseY = pisoY - (alturaPiso * 50);
  const pantallaTopY = pantallaBaseY - alturaPantallaDrawing;

  // Centro vertical de la pantalla
  const pantallaCenterY = pantallaTopY + alturaPantallaDrawing / 2;

  // Colocamos el proyector alineado verticalmente con el centro de la pantalla
  const proyectorY = pantallaCenterY;

    return {
      pisoY,
      pantallaX,
      proyectorX,
      proyectorY,
      pantallaBaseY,
      pantallaTopY,
      pantallaCenterY,
      alturaPantallaDrawing,
      valores: { altura, ancho, distancia, alturaPiso }
    };
  };

  const positions = getSVGPositions();

  const formatNumber = (n) => {
    if (n === '' || n === null || n === undefined) return '';
    const v = Number(n);
    if (Number.isNaN(v)) return '';
    return v.toFixed(2).replace(/\.0+$|(?<=(\.\d+))0+$/,'');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Parámetros del Simulador</h1>
        {!hasChanges ? (
          <div className={styles.statusContainer}>
            <span className={styles.statusTextIdle}>No hay cambios por guardar</span>
          </div>
        ) : (
          <div className={styles.statusContainer}>
            {renderStatusIcon()}
            {saveStatus === 'saving' && <span className={styles.statusText}>Guardando...</span>}
            {saveStatus === 'success' && <span className={styles.statusTextSuccess}>Cambios guardados</span>}
            {saveStatus === 'error' && <span className={styles.statusTextError}>Error al guardar</span>}
          </div>
        )}
      </div>

      <div className={styles.content}>
        {/* Sección izquierda: Formulario */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Configuración</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Altura de la Pantalla (m)
            </label>
            <input
              type="number"
              className={styles.input}
              value={config.alturaPantalla}
              onChange={(e) => handleChange('alturaPantalla', e.target.value)}
              min="0.5"
              max="5"
              step="0.1"
              placeholder="Ej: 2.0"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ancho de la Pantalla (m)
            </label>
            <input
              type="number"
              className={styles.input}
              value={config.anchoPantalla}
              onChange={(e) => handleChange('anchoPantalla', e.target.value)}
              min="1"
              max="8"
              step="0.1"
              placeholder="Ej: 3.0"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Distancia Tirador-Pantalla (m)
            </label>
            <input
              type="number"
              className={styles.input}
              value={config.distTiradorPantalla}
              onChange={(e) => handleChange('distTiradorPantalla', e.target.value)}
              min="1"
              max="10"
              step="0.1"
              placeholder="Ej: 4.0"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Altura desde el Piso (m)
            </label>
            <input
              type="number"
              className={styles.input}
              value={config.alturaPiso}
              onChange={(e) => handleChange('alturaPiso', e.target.value)}
              min="0"
              max="3"
              step="0.1"
              placeholder="Ej: 1.0"
            />
          </div>
        </div>

        {/* Sección derecha: Visualización */}
        <div className={styles.visualSection}>
          <h2 className={styles.sectionTitle}>Vista Esquemática</h2>
          
          <svg 
            className={styles.diagram} 
            viewBox="0 0 600 350"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Small arrows (6x6) for each direction and color */}
              {/* Green arrows */}
              <marker id="arrowGreenRight" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0 0 L6 3 L0 6 z" fill="#10b981" />
              </marker>
              <marker id="arrowGreenLeft" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M6 0 L0 3 L6 6 z" fill="#10b981" />
              </marker>
              <marker id="arrowGreenUp" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto" markerUnits="strokeWidth">
                <path d="M0 6 L3 0 L6 6 z" fill="#10b981" />
              </marker>
              <marker id="arrowGreenDown" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto" markerUnits="strokeWidth">
                <path d="M0 0 L3 6 L6 0 z" fill="#10b981" />
              </marker>

              {/* Red arrows */}
              <marker id="arrowRedRight" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0 0 L6 3 L0 6 z" fill="#ef4444" />
              </marker>
              <marker id="arrowRedLeft" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M6 0 L0 3 L6 6 z" fill="#ef4444" />
              </marker>
              <marker id="arrowRedUp" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto" markerUnits="strokeWidth">
                <path d="M0 6 L3 0 L6 6 z" fill="#ef4444" />
              </marker>
              <marker id="arrowRedDown" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto" markerUnits="strokeWidth">
                <path d="M0 0 L3 6 L6 0 z" fill="#ef4444" />
              </marker>

              {/* Yellow arrows */}
              <marker id="arrowYellowRight" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0 0 L6 3 L0 6 z" fill="#fbbf24" />
              </marker>
              <marker id="arrowYellowLeft" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M6 0 L0 3 L6 6 z" fill="#fbbf24" />
              </marker>
              <marker id="arrowYellowUp" markerWidth="6" markerHeight="6" refX="3" refY="0" orient="auto" markerUnits="strokeWidth">
                <path d="M0 6 L3 0 L6 6 z" fill="#fbbf24" />
              </marker>
              <marker id="arrowYellowDown" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto" markerUnits="strokeWidth">
                <path d="M0 0 L3 6 L6 0 z" fill="#fbbf24" />
              </marker>

              {/* Violet arrows (match green triangle size — 8x8) */}
              <marker id="arrowVioletRight" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0 0 L8 4 L0 8 z" fill="#7c3aed" />
              </marker>
              <marker id="arrowVioletLeft" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M8 0 L0 4 L8 8 z" fill="#7c3aed" />
              </marker>
              <marker id="arrowVioletUp" markerWidth="8" markerHeight="8" refX="4" refY="0" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0 8 L4 0 L8 8 z" fill="#7c3aed" />
              </marker>
              <marker id="arrowVioletDown" markerWidth="8" markerHeight="8" refX="4" refY="8" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0 0 L4 8 L8 0 z" fill="#7c3aed" />
              </marker>
            </defs>
            {/* Centrar el contenido tras aplicar zoom 1.15: translate = (1-scale)*(view/2) */}
            {/* Ajuste: subir ligeramente en Y para dejar más espacio abajo */}
            <g transform="translate(-45 -60) scale(1.12)">
            {positions ? (
              <>
                {/* Piso */}
                <line
                  x1="50"
                  y1={positions.pisoY}
                  x2="550"
                  y2={positions.pisoY}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                <text x="300" y={positions.pisoY + 20} textAnchor="middle" fill="#64748b" fontSize="12">
                  Piso
                </text>

                {/* Pantalla */}
                <g>
                  <rect
                    x={positions.pantallaX}
                    y={positions.pantallaTopY}
                    width="20"
                    height={positions.alturaPantallaDrawing}
                    fill="#dbeafe"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    rx="2"
                  />


                  {/* Altura de pantalla: línea verde a la derecha de la pantalla */}
                  <line
                    x1={positions.pantallaX + 30}
                    y1={positions.pantallaBaseY}
                    x2={positions.pantallaX + 30}
                    y2={positions.pantallaTopY}
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  {/* Triángulos manuales para puntas verticales (verde) */}
                  <path d={
                    `M ${positions.pantallaX + 30} ${positions.pantallaTopY - 4} L ${positions.pantallaX + 26} ${positions.pantallaTopY + 4} L ${positions.pantallaX + 34} ${positions.pantallaTopY + 4} Z`
                  } fill="#10b981" />
                  <path d={
                    `M ${positions.pantallaX + 30} ${positions.pantallaBaseY + 4} L ${positions.pantallaX + 26} ${positions.pantallaBaseY - 4} L ${positions.pantallaX + 34} ${positions.pantallaBaseY - 4} Z`
                  } fill="#10b981" />
                  <text
                    x={positions.pantallaX + 40}
                    y={positions.pantallaTopY + positions.alturaPantallaDrawing / 2}
                    textAnchor="start"
                    fill="#10b981"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {positions.valores.altura}m
                  </text>

                  {/* Altura desde el piso: línea punteada separada del rectángulo y del piso */}
                  {
                    (() => {
                      const redX = positions.pantallaX + 40; // desplazada a la derecha para evitar tocar la pantalla
                      const gap = 8; // separación en px respecto a pantalla y piso
                      const yTop = positions.pantallaBaseY + gap; // empezar justo debajo de la pantalla con gap
                      const yBottom = positions.pisoY - gap; // terminar justo arriba del piso con gap
                      return (
                        <>
                          <line
                            x1={redX}
                            y1={yTop}
                            x2={redX}
                            y2={yBottom}
                            stroke="#ef4444"
                            strokeWidth="2"
                            strokeDasharray="3,3"
                          />
                          {/* Triángulos manuales para puntas verticales (rojo) colocados ligeramente fuera */}
                          <path d={`M ${redX} ${yTop - 4} L ${redX - 4} ${yTop + 4} L ${redX + 4} ${yTop + 4} Z`} fill="#ef4444" />
                          <path d={`M ${redX} ${yBottom + 4} L ${redX - 4} ${yBottom - 4} L ${redX + 4} ${yBottom - 4} Z`} fill="#ef4444" />
                          <text
                            x={redX - 6}
                            y={(yTop + yBottom) / 2}
                            textAnchor="end"
                            dominantBaseline="middle"
                            fill="#ef4444"
                            fontSize="12"
                            fontWeight="600"
                          >
                            {formatNumber(positions.valores.alturaPiso)}m
                          </text>
                        </>
                      );
                    })()
                  }
                  {/* Etiqueta 'Pantalla' arriba del rectángulo, centrada */}
                  <text
                    x={positions.pantallaX + 10}
                    y={positions.pantallaTopY - 8}
                    fill="#1e40af"
                    fontSize="14"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    Pantalla
                  </text>
                </g>

                {/* Persona (reemplaza al proyector visualmente, mantiene la lógica de posiciones) */}
                <g>
                  {/* Dibujar figura simple de persona centrada en (proyectorX + 20, proyectorY) */}
                  {
                    (() => {
                      const cx = positions.proyectorX + 20;
                      const cy = positions.proyectorY;
                      // aumentar tamaño de la persona
                      const headR = 9;
                      const bodyTop = cy - 12;
                      const bodyBottom = cy + 16;
                      const armLen = 12;
                      const legY = cy + 26;
                      return (
                        <g>
                          {/* cabeza */}
                          <circle cx={cx} cy={cy - 14} r={headR} fill="#334155" stroke="#1e293b" strokeWidth="1" />
                          {/* cuerpo */}
                          <line x1={cx} y1={bodyTop} x2={cx} y2={bodyBottom} stroke="#334155" strokeWidth="2" />
                          {/* brazos */}
                          <line x1={cx - armLen} y1={cy} x2={cx + armLen} y2={cy} stroke="#334155" strokeWidth="2" />
                          {/* piernas */}
                          <line x1={cx} y1={bodyBottom} x2={cx - 8} y2={legY} stroke="#334155" strokeWidth="2" />
                          <line x1={cx} y1={bodyBottom} x2={cx + 8} y2={legY} stroke="#334155" strokeWidth="2" />
                        </g>
                      );
                    })()
                  }

                  {/* Rayo (mirada) horizontal: origin desde la persona (cx) */}
                  {/* Ajustar extremos para no atravesar la persona ni la pantalla */}
                  <line
                    x1={positions.proyectorX + 20 + 11} /* pequeño offset fuera de la silueta */
                    y1={positions.pantallaCenterY}
                    x2={positions.pantallaX - 6} /* detener antes de la pantalla */
                    y2={positions.pantallaCenterY}
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.9"
                  />

                  {/* Etiqueta 'Persona' arriba de la figura, centrada */}
                  <text
                    x={positions.proyectorX + 20}
                    y={positions.proyectorY - 36}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="12"
                    fontWeight="600"
                  >
                    Tirador
                  </text>

                  {/* Distancia: arrancar fuera de la silueta de la persona y terminar antes de la pantalla (no cruzar) */}
                  {
                    (() => {
                      const startX = positions.proyectorX + 20 + 11; // offset para no cortar la silueta
                      const endX = positions.pantallaX - 6; // detener antes del rectángulo de la pantalla
                      const y = positions.proyectorY + 46;
                      return (
                        <>
                          {
                            (() => {
                              // Draw violet line with manual triangle endpoints to match green triangles
                              const triW = 8; // triangle width (same visual size as green)
                              const sx = startX + triW; // start line after left triangle
                              const ex = endX - triW; // end line before right triangle
                              return (
                                <>
                                  <line
                                    x1={sx}
                                    y1={y}
                                    x2={ex}
                                    y2={y}
                                    stroke="#7c3aed"
                                    strokeWidth="2"
                                  />
                                  {/* Left triangle (pointing left) */}
                                  <path d={`M ${startX} ${y} L ${startX + triW} ${y - triW/2} L ${startX + triW} ${y + triW/2} Z`} fill="#7c3aed" />
                                  {/* Right triangle (pointing right) */}
                                  <path d={`M ${endX} ${y} L ${endX - triW} ${y - triW/2} L ${endX - triW} ${y + triW/2} Z`} fill="#7c3aed" />
                                  <text
                                    x={(sx + ex) / 2}
                                    y={positions.proyectorY + 40}
                                    textAnchor="middle"
                                    fill="#7c3aed"
                                    fontSize="12"
                                    fontWeight="600"
                                  >
                                    {formatNumber(positions.valores.distancia)}m
                                  </text>
                                </>
                              );
                            })()
                          }
                        </>
                      );
                    })()
                  }
                </g>
              </>
            ) : (
              <text x="300" y="175" textAnchor="middle" fill="#9ca3af" fontSize="16">
                Ingresa los valores para ver el esquema
              </text>
            )}
            </g>
          </svg>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.colorGreen}`}></div>
              <span>Altura Pantalla</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.colorOrange}`}></div>
              <span>Altura desde el piso</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendColor} ${styles.colorPurple}`}></div>
              <span>Distancia Tirador-Pantalla</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};