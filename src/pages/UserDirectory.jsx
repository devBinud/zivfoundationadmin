/* UserDirectory - User profiles listing and moderation panel */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const UserDirectory = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [actionError, setActionError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.users.list();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load user directories', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const handleGlobalSuccess = () => {
      fetchUsers();
    };
    window.addEventListener('on-behalf-success', handleGlobalSuccess);
    return () => {
      window.removeEventListener('on-behalf-success', handleGlobalSuccess);
    };
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const actionWord = currentStatus === 'Active' ? 'suspend' : 'activate';
    const result = await Swal.fire({
      title: `${actionWord.charAt(0).toUpperCase() + actionWord.slice(1)} User?`,
      text: `Are you sure you want to ${actionWord} this user account?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionWord}!`
    });

    if (result.isConfirmed) {
      setActionError(null);
      try {
        await api.users.toggleStatus(userId);
        // Re-fetch users to sync view
        await fetchUsers();
        Swal.fire({
          title: 'Success!',
          text: `User account has been ${actionWord}ed successfully.`,
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: `Could not update user status: ${err.message}`,
          icon: 'error',
          confirmButtonColor: 'var(--primary)'
        });
      }
    }
  };

  // Filter logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="directory-view">
      {/* Search and Action Bar */}
      <div className="glass-card controls-card flex-between">
        <div className="filters-group">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            className="form-control filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Donor">Donors Only</option>
            <option value="Seeker">Seekers Only</option>
          </select>

          <select 
            className="form-control filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <Link to="/on-behalf" className="btn btn-primary">
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> On-Behalf Creation
        </Link>
      </div>

      {actionError && <div className="alert-box alert-danger mt-4">{actionError}</div>}

      {/* Directory Table */}
      <div className="glass-card mt-4 table-card">
        {loading ? (
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>S.No.</th>
                  <th>User Details</th>
                  <th>Contact Info</th>
                  <th>System Role</th>
                  <th>Blood Group</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array(6).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}><Skeleton width={20} /></td>
                    <td><Skeleton width={110} height={14} /></td>
                    <td><Skeleton width={150} height={14} /><br /><Skeleton width={100} height={12} style={{ marginTop: 4 }} /></td>
                    <td><Skeleton width={60} height={22} borderRadius={20} /></td>
                    <td><Skeleton width={40} height={22} borderRadius={6} /></td>
                    <td><Skeleton width={90} height={14} /></td>
                    <td><Skeleton width={70} height={22} borderRadius={20} /></td>
                    <td><Skeleton width={70} height={30} borderRadius={8} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p style={{ padding: '3rem', color: 'var(--text-muted)' }} className="text-center">No users matching search filters found.</p>
        ) : (
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>S.No.</th>
                  <th>User Details</th>
                  <th>Contact Info</th>
                  <th>System Role</th>
                  <th>Blood Group</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, index) => (
                  <tr key={u.id}>
                    <td style={{ textAlign: 'center', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {index + 1}
                    </td>
                    <td>
                      <span className="user-name">{u.name}</span>
                      {u.documentName && (
                        <div style={{ marginTop: '4px' }}>
                          <span className="badge badge-info" style={{ textTransform: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                            📄 {u.documentName}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="contact-details">
                        <span className="contact-email">{u.email}</span>
                        <span className="contact-phone">{u.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'Donor' ? 'role-donor-badge' : 'role-seeker-badge'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className="blood-badge">{u.bloodGroup}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.joinedDate}</td>
                    <td>
                      <span className={`badge badge-${u.status.toLowerCase()}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Details Button */}
                        <button
                          className="btn btn-sm btn-details-outline"
                          onClick={() => navigate(`/users/${u.id}`)}
                          title="View Full Details"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Details
                        </button>
                        {/* Suspend / Activate Button */}
                        <button
                          className={`btn btn-sm ${u.status === 'Active' ? 'btn-danger-outline' : 'btn-success-outline'}`}
                          onClick={() => handleToggleStatus(u.id, u.status)}
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .controls-card {
          padding: 1rem 1.5rem;
        }

        .filters-group {
          display: flex;
          gap: 1rem;
          flex-grow: 1;
          max-width: 800px;
        }

        .search-input {
          flex: 1.5;
        }

        .filter-select {
          flex: 1;
          background-position: right 1rem center;
        }

        .user-profile-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar-small {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-light);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .user-name {
          color: var(--text-primary);
          font-size: 0.85rem;
        }

        .contact-details {
          display: flex;
          flex-direction: column;
        }

        .contact-email {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .contact-phone {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-top: 0.1rem;
        }

        .role-donor-badge {
          background: rgba(197, 17, 46, 0.1);
          color: #ff4d6d;
          border: 1px solid rgba(197, 17, 46, 0.2);
        }

        .role-seeker-badge {
          background: rgba(59, 130, 246, 0.1);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .blood-badge {
          font-weight: 700;
          color: var(--primary);
          background: var(--primary-light);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border);
        }

        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
          border-radius: 6px;
        }

        .btn-danger-outline {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--danger);
        }
        .btn-danger-outline:hover {
          background: var(--danger);
          color: white;
        }

        .btn-success-outline {
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: var(--success);
        }
        .btn-success-outline:hover {
          background: var(--success);
          color: white;
        }

        .btn-details-outline {
          background: rgba(99, 102, 241, 0.06);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #818cf8;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .btn-details-outline:hover {
          background: #6366f1;
          border-color: #6366f1;
          color: white;
        }
        html.light-theme .btn-details-outline {
          background: rgba(99, 102, 241, 0.06);
          border-color: rgba(99, 102, 241, 0.3);
          color: #4f46e5;
        }
        html.light-theme .btn-details-outline:hover {
          background: #4f46e5;
          color: white;
        }

        .spinner-medium {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) {
          .controls-card {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .filters-group {
            flex-direction: column;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default UserDirectory;
