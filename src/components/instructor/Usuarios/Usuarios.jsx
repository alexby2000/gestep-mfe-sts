import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, Search, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { UserProfilePanel } from './UserProfilePanel';
import { RejectModal } from './RejectModal';
import { LoadingOverlay } from '../../common/LoadingOverlay';
import { usersService } from '../../../services/UserInfo/usersService';
import { usePendingCount } from '../../../context/PendingCountContext';
import { getRoleConfig } from '@gestep/shared/types';
import styles from './Usuarios.module.css';

const getInitials = (nombre, apellido) => {
  return `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase();
};

const getTimeAgo = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 60) return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours} h`;
  return `Hace ${days} día${days !== 1 ? 's' : ''}`;
};

// ─── Tab: Tiradores asociados ────────────────────────────────────────────────
const TiradoresTab = ({ tiradores, loading, error, onViewProfile, selectedId }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return tiradores.filter(a => {
      const fullName = `${a.nombre} ${a.apellido}`.toLowerCase();
      return (
        fullName.includes(search.toLowerCase()) ||
        a.dni.includes(search) ||
        a.rango.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [tiradores, search]);

  return (
    <div className={styles.tabContent}>
      {/* Barra de búsqueda */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={16} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre, DNI o rango..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Estados */}
      {loading && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Cargando tiradores...</p>
        </div>
      )}
      {!loading && error && (
        <div className={styles.emptyState}>
          <AlertCircle size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Error al cargar</p>
          <p className={styles.emptyText}>{error}</p>
        </div>
      )}
      {!loading && !error && (
        <>
          {/* Contador */}
          <p className={styles.resultsCount}>
            {filtered.length} tirador{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>

          {/* Lista */}
          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={40} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>Sin resultados</p>
              <p className={styles.emptyText}>Probá cambiando los filtros de búsqueda</p>
            </div>
          ) : (
            <div className={styles.userGrid}>
              {filtered.map(alumno => {
                const rc = getRoleConfig(alumno.tipoUsuario);
                const RoleIcon = rc?.icon;
                return (
                <div
                  key={alumno.id}
                  className={`${styles.userCard} ${selectedId === alumno.id ? styles.userCardSelected : ''}`}
                  style={rc ? { '--role-color': rc.color } : undefined}
                  onClick={() => onViewProfile({ ...alumno, type: 'active' })}
                >
                  {RoleIcon && (
                    <div className={styles.roleBadge} style={{ color: rc.color }} title={rc.label}>
                      <RoleIcon size={16} />
                    </div>
                  )}
                  <div className={styles.userCardLeft}>
                    <div className={styles.avatarWrapper}>
                      {alumno.fotoPerfil ? (
                        <img src={alumno.fotoPerfil} alt={alumno.nombre} className={styles.avatarImg} />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          {getInitials(alumno.nombre, alumno.apellido)}
                        </div>
                      )}
                    </div>

                    <div className={styles.userInfo}>
                      <h3 className={styles.userName}>{alumno.nombre} {alumno.apellido}</h3>
                      <div className={styles.userMeta}>
                        <span className={styles.userRango}>{alumno.rango}</span>
                        <span className={styles.metaSep}>·</span>
                        <span className={styles.userFuerza}>{alumno.agrupamiento ?? '—'}</span>
                      </div>
                      <p className={styles.userUnidad}>
                        {alumno.fechaAprobacion
                          ? (() => {
                              const [y, m, d] = alumno.fechaAprobacion.split('T')[0].split('-').map(Number);
                              return `Miembro desde el ${new Date(y, m - 1, d).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}`;
                            })()
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className={styles.userCardRight}>
                    {alumno.ultimaEvaluacion && (
                      <div className={styles.lastEval}>
                        <span className={styles.evalLabel}>Última evaluación</span>
                        <span className={styles.evalValue}>{alumno.ultimaEvaluacion.situacion}</span>
                        <span className={styles.evalDate}>{alumno.ultimaEvaluacion.fecha}</span>
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Tab: Solicitudes pendientes ─────────────────────────────────────────────
const SolicitudesTab = ({ pendientes, loadingPendientes, errorPendientes, onViewProfile, selectedId, onRemovePending, onApproveSuccess }) => {
  const [rejectTarget, setRejectTarget] = useState(null);
  const [processingText, setProcessingText] = useState(null);

  const handleApprove = useCallback((id, alias) => {
    setProcessingText('Aprobando solicitud...');
    usersService.approveUser(alias)
      .then(() => {
        onRemovePending(id);
        onApproveSuccess();
      })
      .catch((err) => console.error('Error al aprobar:', err))
      .finally(() => setProcessingText(null));
  }, [onRemovePending, onApproveSuccess]);

  const handleRejectConfirm = useCallback((id, alias, justificacion) => {
    setRejectTarget(null);
    setProcessingText('Rechazando solicitud...');
    usersService.rejectUser(alias, justificacion)
      .then(() => onRemovePending(id))
      .catch((err) => console.error('Error al rechazar:', err))
      .finally(() => setProcessingText(null));
  }, [onRemovePending]);

  return (
    <div className={styles.tabContent}>
      {loadingPendientes && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Cargando solicitudes...</p>
        </div>
      )}
      {!loadingPendientes && errorPendientes && (
        <div className={styles.emptyState}>
          <AlertCircle size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Error al cargar</p>
          <p className={styles.emptyText}>{errorPendientes}</p>
        </div>
      )}
      {!loadingPendientes && !errorPendientes && (
        pendientes.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle size={40} className={styles.emptyIconGreen} />
            <p className={styles.emptyTitle}>Sin solicitudes pendientes</p>
            <p className={styles.emptyText}>Todas las solicitudes han sido procesadas</p>
          </div>
        ) : (
          <>
            <p className={styles.resultsCount}>
              {pendientes.length} solicitud{pendientes.length !== 1 ? 'es' : ''} pendiente{pendientes.length !== 1 ? 's' : ''}
            </p>
            <div className={styles.requestList}>
              {pendientes.map(req => {
                const rc = getRoleConfig(req.tipoUsuario);
                const RoleIcon = rc?.icon;
                return (
                <div
                  key={req.id}
                  className={`${styles.requestCard} ${selectedId === req.id ? styles.requestCardSelected : ''}`}
                  style={rc ? { '--role-color': rc.color } : undefined}
                  onClick={() => onViewProfile({ ...req, type: 'pending' })}
                >
                  {RoleIcon && (
                    <div className={styles.roleBadge} style={{ color: rc.color }} title={rc.label}>
                      <RoleIcon size={16} />
                    </div>
                  )}
                  <div className={styles.requestLeft}>
                    <div className={styles.avatarWrapper}>
                      {req.fotoPerfil ? (
                        <img src={req.fotoPerfil} alt={req.nombre} className={styles.avatarImg} />
                      ) : (
                        <div className={`${styles.avatarPlaceholder} ${styles.avatarPending}`}>
                          {getInitials(req.nombre, req.apellido)}
                        </div>
                      )}
                    </div>

                    <div className={styles.userInfo}>
                      <h3 className={styles.userName}>{req.nombre} {req.apellido}</h3>
                      <div className={styles.userMeta}>
                        <span className={styles.userRango}>{req.rango}</span>
                        <span className={styles.metaSep}>·</span>
                        <span className={styles.userFuerza}>{req.agrupamiento ?? '—'}</span>
                      </div>
                      <div className={styles.timeInfo}>
                        <Clock size={11} />
                        <span>{getTimeAgo(req.fechaRegistro)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.requestActions}>
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleApprove(req.id, req.alias)}
                    >
                      <CheckCircle size={14} />
                      <span>Aprobar</span>
                    </button>
                    <button
                      className={styles.rejectBtn}
                      onClick={() => setRejectTarget(req)}
                    >
                      <XCircle size={14} />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </>
        )
      )}

      {rejectTarget && (
        <RejectModal
          user={rejectTarget}
          onConfirm={(justificacion) => handleRejectConfirm(rejectTarget.id, rejectTarget.alias, justificacion)}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {processingText && <LoadingOverlay fullScreen text={processingText} />}
    </div>
  );
};

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export const Usuarios = () => {
  const { setPendingCount } = usePendingCount();
  const [activeTab, setActiveTab] = useState('tiradores');
  const [profileUser, setProfileUser] = useState(null);

  const [tiradores, setTiradores] = useState([]);
  const [loadingTiradores, setLoadingTiradores] = useState(true);
  const [errorTiradores, setErrorTiradores] = useState(null);

  const [pendientes, setPendientes] = useState([]);
  const [loadingPendientes, setLoadingPendientes] = useState(true);
  const [errorPendientes, setErrorPendientes] = useState(null);

  const fetchTiradores = useCallback(() => {
    setLoadingTiradores(true);
    usersService.getActiveUsers()
      .then(data => {
        setTiradores(data);
        setErrorTiradores(null);
      })
      .catch(() => setErrorTiradores('No se pudieron cargar los tiradores.'))
      .finally(() => setLoadingTiradores(false));
  }, []);

  useEffect(() => {
    fetchTiradores();
  }, [fetchTiradores]);;

  useEffect(() => {
    setLoadingPendientes(true);
    usersService.getPendingUsers()
      .then(data => {
        setPendientes(data);
        setPendingCount(data.length);
        setErrorPendientes(null);
      })
      .catch(() => setErrorPendientes('No se pudieron cargar las solicitudes.'))
      .finally(() => setLoadingPendientes(false));
  }, [setPendingCount]);

  const handleRemovePending = useCallback((id) => {
    setPendientes(prev => {
      const updated = prev.filter(p => p.id !== id);
      setPendingCount(updated.length);
      return updated;
    });
    setProfileUser(prev => (prev?.id === id ? null : prev));
  }, [setPendingCount]);

  const activeCount = tiradores.length;
  const pendingCount = pendientes.length;

  const tabs = [
    { id: 'tiradores', label: 'Tiradores', icon: UserCheck, count: activeCount },
    { id: 'solicitudes', label: 'Solicitudes', icon: Clock, count: pendingCount, alert: pendingCount > 0 },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Usuarios</h1>
        <p className={styles.pageSubtitle}>Gestión de tiradores y solicitudes de acceso</p>
      </div>

      {/* Layout dos columnas */}
      <div className={styles.splitLayout}>
        {/* Columna izquierda: tabs + lista */}
        <div className={styles.leftCol}>
          {/* Tabs */}
          <div className={styles.tabs}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                  <span className={`${styles.tabBadge} ${tab.alert ? styles.tabBadgeAlert : ''}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contenido del tab */}
          <div className={styles.tabPanel}>
            {activeTab === 'tiradores' && (
              <TiradoresTab
                tiradores={tiradores}
                loading={loadingTiradores}
                error={errorTiradores}
                onViewProfile={setProfileUser}
                selectedId={profileUser?.id}
              />
            )}
            {activeTab === 'solicitudes' && (
              <SolicitudesTab
                pendientes={pendientes}
                loadingPendientes={loadingPendientes}
                errorPendientes={errorPendientes}
                onViewProfile={setProfileUser}
                selectedId={profileUser?.id}
                onRemovePending={handleRemovePending}
                onApproveSuccess={fetchTiradores}
              />
            )}
          </div>
        </div>

        {/* Columna derecha: panel de perfil sticky */}
        <div className={styles.rightCol}>
          <UserProfilePanel user={profileUser} />
        </div>
      </div>
    </div>
  );
};
