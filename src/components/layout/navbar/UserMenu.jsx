import React from 'react';
import { LogOut, Settings, User, ChevronDown, Moon } from 'lucide-react';
import styles from './UserMenu.module.css';

export const UserMenu = ({ 
  currentUser,
  isDark,
  showDropdown,
  dropdownRef,
  onToggle,
  onToggleTheme,
  onSettings,
  onLogout,
  getUserInitials,
  getUserType
}) => {
  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button 
        onClick={onToggle}
        className={styles.userButton}
      >
        <div className={styles.userAvatar}>
          {currentUser?.photoUrl ? (
            <img src={currentUser.photoUrl} alt="Avatar" className={styles.avatarImage} />
          ) : (
            <span className={styles.avatarInitials}>{getUserInitials()}</span>
          )}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {currentUser?.nombreCompleto || ''}
          </span>
          <span className={styles.userType}>{getUserType()}</span>
        </div>
        <ChevronDown className={styles.chevron} />
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <div className={styles.userProfileHeader}>
              <div className={styles.userAvatarLarge}>
                {currentUser?.photoUrl ? (
                  <img src={currentUser.photoUrl} alt="Avatar" className={styles.avatarImageLarge} />
                ) : (
                  <span className={styles.avatarInitialsLarge}>{getUserInitials()}</span>
                )}
              </div>
              <div className={styles.userDetailsHeader}>
                <h3 className={styles.userNameHeader}>
                  {currentUser?.nombreCompleto || ''}
                </h3>
                <span className={styles.userTypeHeader}>{getUserType()}</span>
                {currentUser?.email && (
                  <span className={styles.userEmail}>{currentUser.email}</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.menuList}>
            <div className={styles.menuItem} style={{ cursor: 'default', padding: '0.75rem 1rem' }}>
              <Moon className={styles.menuIcon} />
              <span style={{ flex: 1 }}>Modo Oscuro</span>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={isDark}
                  onChange={onToggleTheme}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <button 
              onClick={onSettings}
              className={styles.menuItem}
            >
              <Settings className={styles.menuIcon} />
              <span>Configuración</span>
            </button>
            <button 
              onClick={onLogout}
              className={`${styles.menuItem} ${styles.logoutItem}`}
            >
              <LogOut className={styles.menuIcon} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
