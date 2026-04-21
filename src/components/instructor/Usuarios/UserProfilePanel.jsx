import React from 'react';
import {
  User, Mail, CreditCard, Shield, Calendar,
  Target, Clock, CheckCircle, AlertCircle, Layers, Users,
} from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { getRoleConfig } from '@gestep/shared/types';
import styles from './UserProfilePanel.module.css';

const getInitials = (nombre, apellido) =>
  `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase();

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  // Parsear como fecha local para evitar desfase UTC
  const [year, month, day] = String(dateStr).split('T')[0].split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatDni = (dni) => {
  if (!dni) return '—';
  const s = String(dni).replace(/\D/g, '');
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${date} – ${time}`;
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className={styles.infoItem}>
    <div className={styles.infoIcon}>
      <Icon size={13} />
    </div>
    <div className={styles.infoTexts}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value ?? '—'}</span>
    </div>
  </div>
);

const StatBox = ({ label, value, color }) => (
  <div className={styles.statBox} style={{ borderTopColor: color }}>
    <span className={styles.statValue} style={{ color }}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

// ─── Panel vacío ─────────────────────────────────────────────────────────────
const EmptyPanel = () => (
  <div className={styles.emptyPanel}>
    <div className={styles.emptyIconWrap}>
      <Users size={32} />
    </div>
    <p className={styles.emptyPanelTitle}>Sin selección</p>
    <p className={styles.emptyPanelText}>
      Seleccioná un usuario de la lista para ver su información aquí
    </p>
  </div>
);

// ─── Panel con perfil ─────────────────────────────────────────────────────────
export const UserProfilePanel = ({ user }) => {
  if (!user) return <EmptyPanel />;

  const isPending = user.type === 'pending';

  return (
    <div className={styles.panel}>
      {/* Badge de rol sobre el vértice superior derecho */}
      {(() => {
        const rc = getRoleConfig(user.tipoUsuario);
        const RoleIcon = rc?.icon;
        return RoleIcon ? (
          <div className={styles.roleBadge} style={{ color: rc.color }} title={rc.label}>
            <RoleIcon size={18} />
          </div>
        ) : null;
      })()}
      {/* Header del perfil */}
      <div className={`${styles.panelHeader} ${isPending ? styles.panelHeaderPending : ''}`}>
        <div className={styles.avatarLarge}>
          {user.fotoPerfil ? (
            <img src={user.fotoPerfil} alt={user.nombre} className={styles.avatarImg} />
          ) : (
            <div className={`${styles.avatarPlaceholder} ${isPending ? styles.avatarPending : ''}`}>
              {getInitials(user.nombre, user.apellido)}
            </div>
          )}
          {!isPending && (
            <span className={styles.activeBadge} title="Activo">
              <CheckCircle size={13} />
            </span>
          )}
          {isPending && (
            <span className={styles.pendingBadge} title="Pendiente">
              <Clock size={13} />
            </span>
          )}
        </div>

        <div className={styles.headerInfo}>
          <h2 className={styles.fullName}>{user.nombre} {user.apellido}</h2>
          <div className={styles.rankBadge}>
            <Shield size={12} />
            <span>{user.rango}</span>
          </div>
          {isPending && (
            <span className={styles.pendingTag}>
              <AlertCircle size={11} />
              Solicitud pendiente
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={styles.panelBody}>
        {/* Datos personales */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <User size={13} />
            Datos personales
          </h3>
          <div className={styles.infoGrid}>
            <InfoItem icon={CreditCard} label="DNI" value={formatDni(user.dni)} />
            <InfoItem icon={Mail} label="Email" value={user.email} />
            <InfoItem icon={CreditCard} label="Matrícula" value={user.matriculaRevista ?? '—'} />
            <InfoItem icon={Calendar} label="Nacimiento" value={formatDate(user.fechaNacimiento)} />
          </div>
        </section>

        {/* Datos militares */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <Shield size={13} />
            Información militar
          </h3>
          <div className={styles.infoGrid}>
            <InfoItem icon={Shield} label="Rango" value={user.rango} />
            <InfoItem icon={Layers} label="Agrupamiento" value={user.agrupamiento ?? '—'} />
            <InfoItem icon={Shield} label="Fuerza" value={user.fuerza ?? '—'} />
            <InfoItem icon={Users} label="Categoría" value={user.categoriaPersonal || '—'} />
          </div>
        </section>

        {/* Stats - solo tiradores activos */}
        {!isPending && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Target size={13} />
              Estadísticas
            </h3>
            <div className={styles.statsGrid}>
              <StatBox label="Ejercicios" value="—" color="#3b82f6" />
              <StatBox label="Promedio" value="—" color="#10b981" />
              <StatBox label="Horas" value="—" color="#f59e0b" />
              <StatBox label="Disparos" value="—" color="#8b5cf6" />
            </div>
          </section>
        )}

        {/* Info de solicitud - solo pendientes */}
        {isPending && user.fechaRegistro && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Clock size={13} />
              Solicitud
            </h3>
            <div className={styles.evalCard}>
              <div className={styles.evalRow}>
                <span className={styles.evalLabel}>Fecha de solicitud</span>
                <span className={styles.evalValue}>
                  {formatDateTime(user.fechaRegistro)}
                </span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
