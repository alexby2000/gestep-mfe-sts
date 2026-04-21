import React, { useState, useEffect } from 'react';
import { Search, Target, X, Zap, Loader2, WifiOff } from 'lucide-react';
import styles from './Alineacion.module.css';
import { gunService } from '../../../services/Simulador/gunService';
import { webSocketService } from '../../../services/webSocketService';
import { SimpleModal } from '../../common/Modal';
import { WeaponCard } from './WeaponCard';

// Modal para editar nombre
const EditNameModal = ({ isOpen, onClose, currentName, onSave }) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(name);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Editar Nombre del Arma</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <label className={styles.label}>Nombre personalizado</label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Pistola de entrenamiento 1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.saveButton} onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// Función de prueba para descubrir armas (solo desarrollo)
const discoverTestWeapons = async (setWeapons, setIsDiscovering) => {
  setIsDiscovering(true);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Cargar nombres personalizados existentes
    const savedCustomNames = localStorage.getItem('guns_custom_names');
    const customNames = savedCustomNames ? JSON.parse(savedCustomNames) : {};
    
    // Armas de prueba
    const testWeapons = [
      {
        id: '1',
        nombre: 'Pistola 1',
        tipo: 'pistola',
        mac: 'AA:BB:CC:DD:EE:01',
        offsetX: -20.53445,
        offsetY: -12.82797
      },
      {
        id: '2',
        nombre: 'Fusil 1',
        tipo: 'fusil',
        mac: 'AA:BB:CC:DD:EE:02',
        offsetX: 3.2,
        offsetY: 0.5
      }
    ];
    
    // Aplicar nombres personalizados existentes
    const weaponsWithCustomNames = testWeapons.map(weapon => ({
      ...weapon,
      customName: customNames[weapon.mac] || ''
    }));
    
    setWeapons(weaponsWithCustomNames);
    sessionStorage.setItem('guns_list', JSON.stringify(testWeapons));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsDiscovering(false);
  }
};

// #########################################################
//                COMPONENTE PRINCIPAL
// #########################################################
export const Alineacion = () => {
  const [weapons, setWeapons] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', icon: Target });

  const showTestButtons = import.meta.env.VITE_DEV_SHOW_DESCUBRIR_ARMAS_BTN === 'true';

  // Cargar armas al montar el componente
  useEffect(() => {
    const savedWeapons = gunService.loadWeapons();
    setWeapons(savedWeapons);
  }, []);

  const handleDiscoverWeapons = async () => {
    setIsDiscovering(true);
    
    try {
      const discoveredWeapons = await gunService.discoverWeapons();
      setWeapons(discoveredWeapons);
      console.log(`${discoveredWeapons.length} arma(s) descubierta(s)`);
    } catch (error) {
      if (error.message === 'no_connection') {
        setAlertConfig({
          title: 'No estás conectado al simulador',
          message: 'Debes estar conectado para usar esta función.',
          icon: WifiOff
        });
        setShowAlert(true);
      } else if (error.message === 'timeout') {
        console.log('Timeout: No se recibió respuesta del servidor');
      } else {
        console.error('Error al descubrir armas:', error);
      }
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAlign = () => {
    // Verificar conexión primero
    if (!webSocketService.isConnected) {
      setAlertConfig({
        title: 'No estás conectado al simulador',
        message: 'Debes estar conectado para usar esta función.',
        icon: WifiOff
      });
      setShowAlert(true);
      return;
    }

    // Verificar que haya armas descubiertas
    if (weapons.length === 0) {
      setAlertConfig({
        title: 'No hay armas visibles',
        message: 'Debes reconocer las armas primero para poder alinearlas.',
        icon: Target
      });
      setShowAlert(true);
      return;
    }

    // TODO: Implementar lógica de alineación con popup
  };

  const handleEditName = (weapon) => {
    setSelectedWeapon(weapon);
    setIsEditModalOpen(true);
  };

  const handleSaveName = (newName) => {
    const updatedWeapons = gunService.updateWeaponName(weapons, selectedWeapon.id, newName);
    setWeapons(updatedWeapons);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Alineación de armas</h1>
        <div className={styles.actions}>
          {showTestButtons && (
            <button
              className={styles.testButton}
              onClick={() => discoverTestWeapons(setWeapons, setIsDiscovering)}
              disabled={isDiscovering}
            >
              <Zap className={styles.buttonIcon} />
              <span>Test: Descubrir</span>
            </button>
          )}
          
          <button
            className={styles.discoverButton}
            onClick={handleDiscoverWeapons}
            disabled={isDiscovering}
          >
            <Search className={styles.buttonIcon} />
            <span>{isDiscovering ? 'Descubriendo...' : 'Descubrir Armas'}</span>
          </button>
          
          <button
            className={styles.alignButton}
            onClick={handleAlign}
          >
            <Target className={styles.buttonIcon} />
            <span>Alinear Armas</span>
          </button>
        </div>
      </div>

      {isDiscovering ? (
        <div className={styles.loadingState}>
          <Loader2 size={48} className={styles.loadingIcon} />
          <h3 className={styles.loadingTitle}>Buscando armas...</h3>
          <p className={styles.loadingDescription}>
            Esperando respuesta del simulador
          </p>
        </div>
      ) : weapons.length === 0 ? (
        <div className={styles.emptyState}>
          <Search size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No hay armas detectadas</h3>
          <p className={styles.emptyDescription}>
            Haz clic en "Descubrir Armas" para buscar armas disponibles en el sistema
          </p>
        </div>
      ) : (
        <>
          <div className={styles.weaponsHeader}>
            <h2 className={styles.weaponsTitle}>
              Armas Vinculadas <span className={styles.weaponsCount}>({weapons.length})</span>
            </h2>
          </div>
          <div className={styles.weaponsGrid}>
            {weapons.map((weapon) => (
              <WeaponCard
                key={weapon.id}
                weapon={weapon}
                onEditName={handleEditName}
              />
            ))}
          </div>
        </>
      )}

      {/* Modales */}
      <SimpleModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
      />

      <EditNameModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={selectedWeapon?.customName || selectedWeapon?.nombre || ''}
        onSave={handleSaveName}
      />
    </div>
  );
};