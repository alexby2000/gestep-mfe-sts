import React from 'react';
import { Bell, Inbox, CheckCheck, X, AlertCircle, Info } from 'lucide-react';
import styles from './NotificationsDropdown.module.css';

export const NotificationsDropdown = ({ 
  notifications,
  unreadCount,
  showDropdown,
  dropdownRef,
  onToggle,
  onNotificationClick,
  onDeleteNotification
}) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertCircle className={styles.notificationIcon} />;
      case 'info':
        return <Info className={styles.notificationIcon} />;
      default:
        return <Bell className={styles.notificationIcon} />;
    }
  };

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button 
        onClick={onToggle}
        className={styles.iconButton}
      >
        <Bell className={styles.navIcon} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3 className={styles.dropdownTitle}>Notificaciones</h3>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount} nueva{unreadCount > 1 ? 's' : ''}</span>
            )}
          </div>
          <div className={styles.notificationList}>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''} ${notification.type === 'error' ? styles.notificationError : ''}`}
                >
                  <div className={styles.notificationIconWrapper}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div 
                    className={styles.notificationContent}
                    onClick={() => onNotificationClick(notification.id)}
                  >
                    <div className={styles.notificationText}>
                      <p className={styles.notificationMessage}>{notification.message}</p>
                      <span className={styles.notificationTime}>{notification.time}</span>
                    </div>
                  </div>
                  <div className={styles.notificationActions}>
                    {!notification.read && (
                      <button
                        className={styles.markReadButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNotificationClick(notification.id);
                        }}
                        title="Marcar como leída"
                      >
                        <CheckCheck className={styles.markReadIcon} />
                      </button>
                    )}
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNotification(notification.id);
                      }}
                      title="Eliminar notificación"
                    >
                      <X className={styles.deleteIcon} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyNotifications}>
                <Inbox className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>Nada nuevo por aquí</p>
                <p className={styles.emptySubtitle}>Te notificaremos cuando llegue algo importante</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
