import React, { useState, useMemo, useCallback } from 'react';
import { User, Clock, CheckCircle, XCircle, Eye, MoreVertical } from 'lucide-react';
import styles from './PendingRequests.module.css';

export const PendingRequests = () => {
  const REQUESTS_PER_PAGE = 3;
  
  // TODO: Obtener solicitudes pendientes de la base de datos
  const [requests, setRequests] = useState([
    {
      id: 1,
      fullName: 'Juan Carlos Pérez',
      email: 'juan.perez@mail.com',
      rank: 'Cabo',
      unit: 'Regimiento de Infantería 1',
      dni: '35.421.789',
      requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      profilePicture: null
    },
    {
      id: 2,
      fullName: 'María Fernanda López',
      email: 'maria.lopez@mail.com',
      rank: 'Soldado',
      unit: 'Regimiento de Caballería 3',
      dni: '38.654.321',
      requestDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
      profilePicture: null
    },
    {
      id: 3,
      fullName: 'Roberto Sánchez',
      email: 'roberto.sanchez@mail.com',
      rank: 'Cabo 1ro',
      unit: 'Regimiento de Artillería 5',
      dni: '34.789.456',
      requestDate: new Date(Date.now() - 30 * 60 * 1000),
      profilePicture: null
    },
    {
      id: 4,
      fullName: 'Ana Patricia Rodríguez',
      email: 'ana.rodriguez@mail.com',
      rank: 'Soldado',
      unit: 'Regimiento de Infantería 1',
      dni: '39.123.654',
      requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      profilePicture: null
    }
  ]);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular paginación con useMemo
  const totalPages = useMemo(() => 
    Math.ceil(requests.length / REQUESTS_PER_PAGE), 
    [requests.length]
  );
  
  const currentRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * REQUESTS_PER_PAGE;
    const endIndex = startIndex + REQUESTS_PER_PAGE;
    const pageRequests = requests.slice(startIndex, endIndex);
    
    // Rellenar con placeholders vacíos para mantener consistencia de altura (mínimo 3)
    const emptySlots = REQUESTS_PER_PAGE - pageRequests.length;
    if (pageRequests.length > 0 && emptySlots > 0) {
      return [...pageRequests, ...Array(emptySlots).fill(null)];
    }
    
    return pageRequests;
  }, [requests, currentPage]);

  // Calcula el tiempo transcurrido desde la solicitud
  const getTimeAgo = useCallback((date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else {
      return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    }
  }, []);

  const handleApprove = useCallback((requestId) => {
    // TODO: Llamar a la API para aprobar la solicitud
    console.log('Aprobando solicitud:', requestId);
    const newRequests = requests.filter(req => req.id !== requestId);
    setRequests(newRequests);
    
    // Ajustar página si es necesario
    const newTotalPages = Math.ceil(newRequests.length / REQUESTS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [requests, currentPage]);

  const handleReject = useCallback((requestId) => {
    // TODO: Llamar a la API para rechazar la solicitud
    console.log('Rechazando solicitud:', requestId);
    const newRequests = requests.filter(req => req.id !== requestId);
    setRequests(newRequests);
    
    // Ajustar página si es necesario
    const newTotalPages = Math.ceil(newRequests.length / REQUESTS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [requests, currentPage]);

  const handleViewDetails = useCallback((request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  }, []);

  const getInitials = (fullName) => {
    const names = fullName.split(' ');
    return names.length >= 2 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Solicitudes Pendientes
            {requests.length > 0 && (
              <span className={styles.badge}>{requests.length}</span>
            )}
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle className={styles.emptyIcon} />
            <p className={styles.emptyText}>Todas las solicitudes procesadas</p>
            <p className={styles.emptySubtext}>Los alumnos aprobados aparecerán en la sección de usuarios</p>
          </div>
        ) : (
          <>
            <div className={styles.requestsList}>
              {currentRequests.map((request, index) => 
                request ? (
            <div key={request.id} className={styles.requestCard}>
              {/* Avatar y Info Principal */}
              <div className={styles.requestInfo}>
                <div className={styles.avatar}>
                  {request.profilePicture ? (
                    <img src={request.profilePicture} alt={request.fullName} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {getInitials(request.fullName)}
                    </div>
                  )}
                </div>
                
                <div className={styles.userInfo}>
                  <h3 className={styles.userName}>{request.fullName}</h3>
                  <div className={styles.userDetails}>
                    <span className={styles.rank}>{request.rank}</span>
                    <span className={styles.separator}>•</span>
                    <span className={styles.dni}>DNI {request.dni}</span>
                  </div>
                  <div className={styles.timeInfo}>
                    <Clock className={styles.clockIcon} />
                    <span className={styles.timeText}>{getTimeAgo(request.requestDate)}</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className={styles.actions}>
                <button
                  className={`${styles.actionBtn} ${styles.detailsBtn}`}
                  onClick={() => handleViewDetails(request)}
                  title="Ver detalles"
                >
                  <Eye className={styles.actionIcon} />
                  <span className={styles.actionText}>Detalles</span>
                </button>
                
                <button
                  className={`${styles.actionBtn} ${styles.approveBtn}`}
                  onClick={() => handleApprove(request.id)}
                  title="Aprobar solicitud"
                >
                  <CheckCircle className={styles.actionIcon} />
                  <span className={styles.actionText}>Aprobar</span>
                </button>
                
                <button
                  className={`${styles.actionBtn} ${styles.rejectBtn}`}
                  onClick={() => handleReject(request.id)}
                  title="Rechazar solicitud"
                >
                  <XCircle className={styles.actionIcon} />
                  <span className={styles.actionText}>Rechazar</span>
                </button>
              </div>
            </div>
                ) : (
                  <div key={`placeholder-${index}`} className={styles.requestPlaceholder}></div>
                )
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && selectedRequest && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Detalles de la Solicitud</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.modalAvatar}>
                {selectedRequest.profilePicture ? (
                  <img src={selectedRequest.profilePicture} alt={selectedRequest.fullName} />
                ) : (
                  <div className={styles.modalAvatarPlaceholder}>
                    {getInitials(selectedRequest.fullName)}
                  </div>
                )}
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Nombre completo</span>
                  <span className={styles.detailValue}>{selectedRequest.fullName}</span>
                </div>
                
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>DNI</span>
                  <span className={styles.detailValue}>{selectedRequest.dni}</span>
                </div>
                
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Rango</span>
                  <span className={styles.detailValue}>{selectedRequest.rank}</span>
                </div>
                
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Unidad</span>
                  <span className={styles.detailValue}>{selectedRequest.unit}</span>
                </div>
                
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{selectedRequest.email}</span>
                </div>
                
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Fecha de solicitud</span>
                  <span className={styles.detailValue}>
                    {selectedRequest.requestDate.toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  className={`${styles.modalBtn} ${styles.modalApproveBtn}`}
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setShowDetailsModal(false);
                  }}
                >
                  <CheckCircle className={styles.modalBtnIcon} />
                  Aprobar Alumno
                </button>
                
                <button
                  className={`${styles.modalBtn} ${styles.modalRejectBtn}`}
                  onClick={() => {
                    handleReject(selectedRequest.id);
                    setShowDetailsModal(false);
                  }}
                >
                  <XCircle className={styles.modalBtnIcon} />
                  Rechazar Solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

PendingRequests.displayName = 'PendingRequests';
