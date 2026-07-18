/* Sidebar - Navigation Panel with Dropdowns */

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoZf from '../assets/logo_zf.png';
import Swal from 'sweetalert2';

const Sidebar = ({ isOpen, onClose, theme, setTheme }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const menuStructure = [
    {
      id: 'dashboard',
      type: 'link',
      path: '/',
      label: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      )
    },
    {
      id: 'usercreation',
      type: 'link',
      path: '/on-behalf',
      label: 'User Creation',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="16" y1="11" x2="22" y2="11" />
        </svg>
      )
    },
    {
      id: 'masters',
      type: 'dropdown',
      label: 'Masters',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <path d="M7 7h.01" />
        </svg>
      ),
      items: [
        {
          path: '/masters/org-types',
          label: 'Organization Types',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'directory',
      type: 'dropdown',
      label: 'Directory Records',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      items: [
        {
          path: '/users',
          label: 'Users Directory',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          )
        },
        {
          path: '/partners/add',
          key: 'partners-add',
          label: 'Add New Organization',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )
        },
        {
          path: '/partners',
          key: 'partners-view',
          label: 'View All Organizations',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1" />
              <path d="M5 21V10.85" />
              <path d="M19 21V10.85" />
              <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'vetting',
      type: 'dropdown',
      label: 'Verification Board',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      items: [
        {
          path: '/requests',
          label: 'Request Queue',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
          )
        },
        {
          path: '/flagged-reviews',
          label: 'Flagged Reviews',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'certifications',
      type: 'dropdown',
      label: 'Certifications',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      items: [
        {
          path: '/certificates',
          label: 'Honors & Awards',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6" />
              <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'notifications',
      type: 'dropdown',
      label: 'Notifications Setting',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      items: [
        {
          path: '/broadcasts',
          label: 'Broadcast Panel',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <path d="m22 6-10 7L2 6" />
            </svg>
          )
        },
        {
          path: '/push-notifications',
          label: 'Push Campaigns',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'system',
      type: 'dropdown',
      label: 'System Operations',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      items: [
        {
          path: '/settings',
          label: 'System Settings',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'theme',
      type: 'theme-dropdown',
      label: 'Theme Selection'
    },
    {
      id: 'public-portal',
      type: 'external-link',
      label: 'Public Portal',
      url: 'https://brittofoundation.vercel.app/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      )
    },
    {
      id: 'help-docs',
      type: 'link',
      path: '/help-center',
      label: 'Help & Docs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      )
    }
  ];

  // Auto-expand dropdown section that contains current active path on load/route changes
  useEffect(() => {
    const currentPath = location.pathname;
    const activeSection = menuStructure.find(
      section => section.type === 'dropdown' &&
        section.items.some(item => currentPath === item.path || currentPath.startsWith(item.path + '/'))
    );
    if (activeSection) {
      setExpandedSections(prev => ({
        ...prev,
        [activeSection.id]: true
      }));
    }
  }, [location.pathname]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem' }}>
        <img src={logoZf} alt="Ziv Logo" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
        <span className="logo-text">Ziv <span style={{ color: 'var(--primary)' }}>Foundation</span></span>
      </div>

      <nav className="sidebar-nav">
        {menuStructure.map((section) => {
          if (section.type === 'link') {
            return (
              <NavLink
                key={section.path}
                to={section.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={section.path === '/'}
                onClick={onClose}
              >
                <span className="nav-item-icon">{section.icon}</span>
                <span className="nav-item-label">{section.label}</span>
              </NavLink>
            );
          }

          if (section.type === 'theme-dropdown') {
            return (
              <div key={section.id} className="sidebar-dropdown-wrapper">
                <button
                  className={`nav-dropdown-header ${themeDropdownOpen ? 'expanded' : ''}`}
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                >
                  <div className="nav-dropdown-header-left">
                    <span className="nav-item-icon">
                      {theme === 'light' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="4" />
                          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                        </svg>
                      )}
                    </span>
                    <span className="nav-item-label">Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
                  </div>
                  <span className="nav-chevron-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`chevron-icon-arrow ${themeDropdownOpen ? 'rotated' : ''}`}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </button>
                <div className={`nav-dropdown-children-container ${themeDropdownOpen ? 'open' : ''}`}>
                  <div className="nav-dropdown-children-inner">
                    <button
                      className={`nav-sub-item-btn ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => setTheme('light')}
                    >
                      <span className="nav-sub-item-dot">•</span>
                      <span className="nav-sub-item-label">Light Theme</span>
                    </button>
                    <button
                      className={`nav-sub-item-btn ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => setTheme('dark')}
                    >
                      <span className="nav-sub-item-dot">•</span>
                      <span className="nav-sub-item-label">Dark Theme</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (section.type === 'external-link') {
            if (section.isAction) {
              return (
                <button
                  key={section.id}
                  onClick={section.onClick}
                  className="nav-item"
                  style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span className="nav-item-icon">{section.icon}</span>
                  <span className="nav-item-label">{section.label}</span>
                </button>
              );
            }
            return (
              <a
                key={section.id}
                href={section.url}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-item"
              >
                <span className="nav-item-icon">{section.icon}</span>
                <span className="nav-item-label">{section.label}</span>
              </a>
            );
          }

          const isExpanded = !!expandedSections[section.id];
          const hasActiveChild = section.items.some(
            item => location.pathname === item.path || location.pathname.startsWith(item.path + '/')
          );

          return (
            <div key={section.id} className="sidebar-dropdown-wrapper">
              <button
                className={`nav-dropdown-header ${isExpanded ? 'expanded' : ''} ${hasActiveChild ? 'has-active-child' : ''}`}
                onClick={() => toggleSection(section.id)}
              >
                <div className="nav-dropdown-header-left">
                  <span className="nav-item-icon">{section.icon}</span>
                  <span className="nav-item-label">{section.label}</span>
                </div>
                <span className="nav-chevron-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </button>
              <div className={`nav-dropdown-children-container ${isExpanded ? 'open' : ''}`}>
                <div className="nav-dropdown-children-inner">
                  {section.items.map((item) => {
                    const isItemActive = location.pathname === item.path;

                    return (
                      <NavLink
                        key={item.key || item.path}
                        to={item.path}
                        className={() => `nav-sub-item ${isItemActive ? 'active' : ''}`}
                        onClick={onClose}
                      >
                        <span className="nav-sub-item-dot">•</span>
                        <span className="nav-sub-item-label">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={logout}>
          <span className="nav-item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span className="nav-item-label">Log Out</span>
        </button>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background: rgba(15, 17, 23, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        html.light-theme .sidebar {
          background: #ffffff;
          border-right: 1px solid rgba(0, 0, 0, 0.07);
        }

        @media (max-width: 992px) {
          .sidebar {
            transform: translateX(-100%);
            background: rgba(15, 17, 23, 0.95);
            box-shadow: none;
          }
          html.light-theme .sidebar {
            background: #ffffff;
          }
          .sidebar.open {
            transform: translateX(0);
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
          }
          html.light-theme .sidebar.open {
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.08);
          }
        }

        .sidebar-brand {
          height: var(--header-height);
          display: flex;
          align-items: center;
          padding: 0 1.5rem;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }

        html.light-theme .sidebar-brand {
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .logo-text {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.25rem;
          letter-spacing: 0.5px;
          color: var(--text-primary);
        }



        /* Sidebar Nav Container */
        .sidebar-nav {
          flex-grow: 1;
          padding: 0.5rem 0.75rem 1.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow-y: auto;
        }

        /* Top level item styling */
        .nav-item, .nav-dropdown-header {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.7rem 0.85rem;
          color: var(--text-secondary);
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.875rem;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .nav-dropdown-header {
          justify-content: space-between;
        }

        .nav-item {
          justify-content: flex-start;
          gap: 0.85rem;
        }

        .nav-dropdown-header-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .nav-item:hover, .nav-dropdown-header:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        html.light-theme .nav-item:hover, html.light-theme .nav-dropdown-header:hover {
          color: #1e293b;
          background: rgba(0, 0, 0, 0.02);
        }

        .nav-item.active {
          color: var(--primary) !important;
          background: var(--primary-light) !important;
          font-weight: 600;
        }

        html.light-theme .nav-item.active {
          color: var(--primary) !important;
          background: var(--primary-light) !important;
        }

        .nav-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Chevron Icon Styling */
        .nav-chevron-icon {
          display: flex;
          align-items: center;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-muted);
          margin-left: auto;
        }

        .nav-dropdown-header.expanded .nav-chevron-icon {
          transform: rotate(90deg);
          color: var(--text-secondary);
        }

        /* Active highlight for parent dropdown if child is active */
        .nav-dropdown-header.has-active-child {
          color: var(--text-primary);
          font-weight: 600;
        }

        html.light-theme .nav-dropdown-header.has-active-child {
          color: #1e293b;
        }

        /* Dropdown transition animation styles */
        .nav-dropdown-children-container {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-dropdown-children-container.open {
          grid-template-rows: 1fr;
        }

        .nav-dropdown-children-inner {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          padding-top: 0.15rem;
        }

        /* Sub-item NavLink and Button styles */
        .nav-sub-item, .nav-sub-item-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 0.85rem 0.55rem 2.25rem;
          color: var(--text-secondary);
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.825rem;
          text-decoration: none;
          transition: all 0.2s ease;
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-sans);
        }

        .nav-sub-item:hover, .nav-sub-item-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        html.light-theme .nav-sub-item:hover, html.light-theme .nav-sub-item-btn:hover {
          color: #1e293b;
          background: rgba(0, 0, 0, 0.015);
        }

        .nav-sub-item.active, .nav-sub-item-btn.active {
          color: var(--primary) !important;
          background: var(--primary-light) !important;
          font-weight: 600;
        }

        html.light-theme .nav-sub-item.active, html.light-theme .nav-sub-item-btn.active {
          color: var(--primary) !important;
          background: var(--primary-light) !important;
        }

        .nav-sub-item-dot {
          color: var(--text-muted);
          opacity: 0.5;
          font-size: 1.1rem;
          line-height: 0;
          margin-right: 0.1rem;
          transition: color 0.2s ease;
        }

        .nav-sub-item.active .nav-sub-item-dot, .nav-sub-item-btn.active .nav-sub-item-dot {
          color: var(--primary);
          opacity: 1;
        }

        .sidebar-footer {
          padding: 0.75rem;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }

        html.light-theme .sidebar-footer {
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .logout-btn {
          color: #ef4444 !important;
          width: 100%;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #ef4444 !important;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
