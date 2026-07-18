/* Header - Top Navigation Panel */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuToggle, theme, setTheme }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Resolve current view label
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':                    return 'System Overview';
      case '/users':               return 'User Directories';
      case '/partners':            return 'Partner Records';
      case '/partners/add':        return 'Add New Organization';
      case '/requests':            return 'Request Moderation';
      case '/flagged-reviews':     return 'Flagged Reviews Board';
      case '/on-behalf':           return 'User Creation';
      case '/certificates':        return 'Honors & Awards';
      case '/broadcasts':          return 'Broadcast Panel';
      case '/push-notifications':  return 'Push Campaigns';
      case '/settings':            return 'System Settings';
      case '/masters/org-types':   return 'Organization Types Master';
      default:
        if (location.pathname.startsWith('/users/'))        return 'User Details';
        if (location.pathname.startsWith('/certificates/')) return 'View Certificate';
        return 'Ziv Foundation Admin';
    }
  };

  // Short display name — show only the first name or just "Admin"
  const getShortName = () => {
    if (!user?.name) return 'Admin';
    const parts = user.name.trim().split(' ');
    // If name is "Ziv Admin" → show "Admin", otherwise show first word
    return parts[parts.length - 1];
  };

  // Resolve breadcrumbs for current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return ['Ziv Foundation', 'Dashboard'];
    if (path === '/users') return ['Directory Records', 'Users Directory'];
    if (path.startsWith('/users/')) return ['Directory Records', 'User Details'];
    if (path === '/partners') return ['Directory Records', 'Partners Directory'];
    if (path === '/partners/add') return ['Directory Records', 'Add New Organization'];
    if (path === '/requests') return ['Verification Board', 'Request Queue'];
    if (path === '/flagged-reviews') return ['Verification Board', 'Flagged Reviews'];
    if (path === '/on-behalf') return ['User Creation', 'On-Behalf Creation'];
    if (path === '/certificates') return ['Certifications', 'Honors & Awards'];
    if (path.startsWith('/certificates/view/')) return ['Certifications', 'View Certificate'];
    if (path === '/broadcasts') return ['Notifications Setting', 'Broadcast Panel'];
    if (path === '/push-notifications') return ['Notifications Setting', 'Push Campaigns'];
    if (path === '/settings') return ['System Operations', 'System Settings'];
    if (path === '/masters/org-types') return ['Masters', 'Organization Types'];
    return ['Ziv Foundation', 'Console'];
  };

  return (
    <header className="header-nav">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={onMenuToggle} aria-label="Toggle Sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"/>
            <line x1="4" x2="20" y1="6" y2="6"/>
            <line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
        </button>
        <div className="header-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 500 }}>
          {getBreadcrumbs().map((crumb, idx, arr) => (
            <React.Fragment key={idx}>
              <span style={{ color: idx === arr.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {crumb}
              </span>
              {idx < arr.length - 1 && <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>/</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="header-actions-wrapper">
        <div className="header-profile-container" ref={profileRef}>
          <div 
            className={`header-profile ${profileDropdownOpen ? 'active' : ''}`}
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            role="button"
            tabIndex={0}
          >
            <div className="profile-details">
              <span className="profile-name">{getShortName()}</span>
            </div>
            <div className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'Z'}
            </div>
          </div>

          <div className={`profile-dropdown ${profileDropdownOpen ? 'show' : ''}`}>
            <div className="dropdown-user-info">
              <span className="dropdown-user-name">{user?.name || 'Ziv Admin'}</span>
              <span className="dropdown-user-email">{user?.email || 'admin@zivfoundation.org'}</span>
            </div>
            
            <div className="dropdown-divider"></div>
            
            <button className="dropdown-item" onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)' }}>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              View Profile
            </button>
            
            <button className="dropdown-item" onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)' }}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Account Settings
            </button>
            
            <div className="dropdown-divider"></div>
            
            <button className="dropdown-item logout-btn" onClick={() => { setProfileDropdownOpen(false); logout(); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .header-nav {
          height: var(--header-height);
          background: rgba(11, 12, 16, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.25rem;
          position: sticky;
          top: 0;
          z-index: 90;
        }

        .header-title h1 {
          font-size: 1.25rem;
          font-weight: 700;
          font-family: var(--font-heading);
          color: var(--text-primary);
        }

        .header-subtitle {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .header-actions-wrapper {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-profile {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .profile-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .profile-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .profile-role {
          font-size: 0.72rem;
          color: var(--primary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .profile-avatar {
          width: 40px;
          height: 40px;
          background: var(--primary);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 1.1rem;
          box-shadow: var(--shadow);
        }
        
        html.light-theme .profile-avatar {
          border-color: var(--border);
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .menu-toggle-btn {
          display: none;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          width: 38px;
          height: 38px;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .menu-toggle-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.1);
        }

        html.light-theme .menu-toggle-btn {
          background: #f1f5f9;
        }
        html.light-theme .menu-toggle-btn:hover {
          background: #e2e8f0;
        }

        @media (max-width: 992px) {
          .menu-toggle-btn {
            display: flex;
          }
        }

        @media (max-width: 768px) {
          .header-nav {
            padding: 0 1rem;
          }
          .profile-details {
            display: none;
          }
          .header-subtitle {
            display: none;
          }
          .header-title h1 {
            font-size: 1.05rem;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        @media (max-width: 480px) {
          .header-title h1 {
            max-width: 140px;
          }
          .header-actions-wrapper {
            gap: 0.75rem;
          }
        }

        /* Profile Dropdown Styles */
        .header-profile-container {
          position: relative;
        }

        .header-profile {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          cursor: pointer;
          padding: 0.35rem 0.65rem;
          border-radius: 30px;
          transition: all 0.2s ease;
          user-select: none;
          background: rgba(255, 255, 255, 0.05);
        }

        html.light-theme .header-profile {
          background: rgba(0, 0, 0, 0.03);
        }

        .header-profile:hover, .header-profile.active {
          background: rgba(255, 255, 255, 0.08);
        }

        html.light-theme .header-profile:hover, html.light-theme .header-profile.active {
          background: rgba(0, 0, 0, 0.05);
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: rgba(22, 24, 30, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 12px;
          width: 220px;
          box-shadow: var(--shadow-lg);
          z-index: 1000;
          transform: translateY(-8px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .profile-dropdown.show {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        html.light-theme .profile-dropdown {
          background: #ffffff;
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
        }

        .dropdown-user-info {
          padding: 1rem 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }

        .dropdown-user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-user-email {
          font-size: 0.72rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border);
          margin: 0.2rem 0;
        }

        html.light-theme .dropdown-divider {
          background: rgba(0, 0, 0, 0.06);
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.15rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.825rem;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s ease;
        }

        .dropdown-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        html.light-theme .dropdown-item:hover {
          color: #1e293b;
          background: rgba(0, 0, 0, 0.02);
        }

        .dropdown-item.logout-btn {
          color: var(--primary) !important;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
        }

        .dropdown-item.logout-btn:hover {
          background: var(--primary-light) !important;
        }
      `}</style>
    </header>
  );
};

export default Header;
