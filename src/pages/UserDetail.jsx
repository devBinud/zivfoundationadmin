/* UserDetail - Full profile view for a single user */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import {
  FaArrowLeft, FaChevronRight, FaHome,
  FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaMapPin,
  FaUser, FaVenusMars, FaBirthdayCake, FaTint,
  FaWeight, FaHospital, FaAmbulance, FaHandHoldingHeart,
  FaBan, FaCheckCircle, FaShieldAlt, FaIdBadge, FaCalendarAlt,
  FaUserSlash, FaUserCheck, FaFileAlt, FaBuilding
} from 'react-icons/fa';
import { MdBloodtype } from 'react-icons/md';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await api.users.list();
      const found = data.find(u => String(u.id) === String(id));
      setUser(found || null);
    } catch (err) {
      console.error('Failed to load user detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    const isActive = user.status === 'Active';
    const actionWord = isActive ? 'suspend' : 'activate';
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
      setActionLoading(true);
      try {
        await api.users.toggleStatus(user.id);
        await fetchUser();
        Swal.fire({ title: 'Done!', text: `User has been ${actionWord}d.`, icon: 'success', confirmButtonColor: 'var(--primary)' });
      } catch (err) {
        Swal.fire('Error!', err.message, 'error');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const InfoRow = ({ label, icon: Icon, value, highlight }) => (
    <div className="ud-info-row">
      <span className="ud-label">
        {Icon && <Icon style={{
          marginRight: 6,
          opacity: 0.6,
          flexShrink: 0,
          transform: Icon === FaPhone ? 'rotate(90deg)' : 'none'
        }} />}
        {label}
      </span>
      <span className={`ud-value${highlight ? ' ud-highlight' : ''}`}>{value || '—'}</span>
    </div>
  );

  const Section = ({ title, icon: Icon, color = 'var(--primary)', children }) => (
    <div className="ud-section">
      <div className="ud-section-header">
        <span className="ud-section-icon-wrap" style={{ background: color + '18', color }}>
          <Icon size={14} style={{ transform: Icon === FaPhone ? 'rotate(90deg)' : 'none' }} />
        </span>
        <h4>{title}</h4>
      </div>
      <div className="ud-section-body">{children}</div>
    </div>
  );

  const isActive = user?.status === 'Active';

  return (
    <div className="ud-page">

      {/* ── Breadcrumb Bar ── */}
      <nav className="ud-breadcrumb-bar" aria-label="breadcrumb">
        <div className="ud-breadcrumb-inner">
          <span className="ud-crumb ud-crumb-home" onClick={() => navigate('/')}>
            <FaHome size={12} />
            <span>Home</span>
          </span>
          <FaChevronRight className="ud-crumb-sep" size={10} />
          <span className="ud-crumb ud-crumb-link" onClick={() => navigate('/users')}>
            User Directory
          </span>
          <FaChevronRight className="ud-crumb-sep" size={10} />
          <span className="ud-crumb ud-crumb-active">
            {loading ? <Skeleton width={90} height={12} /> : (user?.name || 'Not Found')}
          </span>
        </div>

        <button className="btn btn-secondary ud-back-btn" onClick={() => navigate('/users')}>
          <FaArrowLeft size={12} />
          Back to Directory
        </button>
      </nav>

      {loading ? (
        <div className="ud-skeleton-wrap glass-card">
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
            <Skeleton circle width={80} height={80} />
            <div style={{ flex: 1 }}>
              <Skeleton width={180} height={22} />
              <Skeleton width={130} height={14} style={{ marginTop: 8 }} />
              <Skeleton width={100} height={12} style={{ marginTop: 6 }} />
            </div>
          </div>
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} height={16} style={{ marginBottom: 14 }} />
          ))}
        </div>
      ) : !user ? (
        <div className="glass-card ud-not-found">
          <FaUserSlash size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>User Not Found</h3>
          <p>The user profile you are looking for does not exist or has been removed.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/users')}>
            <FaArrowLeft size={12} /> Back to Directory
          </button>
        </div>
      ) : (
        <div className="ud-content-grid">

          {/* ── LEFT — Profile Hero Card ── */}
          <div className="ud-left-col">
            <div className="glass-card ud-hero-card">

              {/* Avatar */}
              <div className="ud-avatar">{user.name?.charAt(0).toUpperCase()}</div>

              {/* Status indicator — separate pill, clearly visible */}
              <div className={`ud-status-pill ${isActive ? 'ud-status-active' : 'ud-status-suspended'}`}>
                {isActive
                  ? <>Active</>
                  : <><FaBan size={10} /> Suspended</>
                }
              </div>

              <h2 className="ud-hero-name">{user.name}</h2>
              <p className="ud-hero-email"><FaEnvelope size={11} style={{ marginRight: 5, opacity: 0.6 }} />{user.email}</p>
              <p className="ud-hero-phone"><FaPhone size={11} style={{ marginRight: 5, opacity: 0.6, transform: 'rotate(90deg)' }} />{user.phone}</p>

              {/* Role & Blood pills */}
              <div className="ud-pills">
                <span className={`badge ${user.role === 'Donor' ? 'role-donor-badge' : 'role-seeker-badge'}`}>
                  {user.role === 'Donor'
                    ? <><FaTint size={10} style={{ marginRight: 4 }} />Donor</>
                    : <><FaAmbulance size={10} style={{ marginRight: 4 }} />Seeker</>
                  }
                </span>
                <span className="blood-badge-lg">
                  <MdBloodtype size={13} style={{ marginRight: 3 }} />
                  {user.bloodGroup}
                </span>
              </div>

              <div className="ud-divider" />

              {/* Joined date */}
              <div className="ud-meta-row">
                <FaCalendarAlt size={12} style={{ color: 'var(--text-muted)' }} />
                <span>Joined <strong>{user.joinedDate}</strong></span>
              </div>
              <div className="ud-meta-row">
                <FaIdBadge size={12} style={{ color: 'var(--text-muted)' }} />
                <span>ID <strong>#{user.id}</strong></span>
              </div>

              <div className="ud-divider" />

              {/* Action Button */}
              <button
                className={`btn ud-action-btn ${isActive ? 'btn-danger-outline' : 'btn-success-outline'}`}
                onClick={handleToggleStatus}
                disabled={actionLoading}
              >
                {actionLoading
                  ? 'Updating...'
                  : isActive
                    ? <><FaUserSlash size={13} /> Suspend Account</>
                    : <><FaUserCheck size={13} /> Activate Account</>
                }
              </button>
            </div>
          </div>

          {/* ── RIGHT — Detail Sections ── */}
          <div className="ud-right-col">

            <Section title="Contact Information" icon={FaPhone}>
              <InfoRow label="Email Address" icon={FaEnvelope} value={user.email} />
              <InfoRow label="Phone Number" icon={FaPhone} value={user.phone} />
            </Section>

            <Section title="Address & Region" icon={FaMapMarkerAlt}>
              <InfoRow label="State" icon={FaMapMarkerAlt} value={user.state} />
              <InfoRow label="District" icon={FaMapMarkerAlt} value={user.district} />
              <InfoRow label="Area / Locality" icon={FaMapPin} value={user.area} />
              <InfoRow label="Pincode" icon={FaMapPin} value={user.pincode} />
              <InfoRow label="Current Address" icon={FaHome} value={user.currentAddress} />
              <InfoRow label="Permanent Address" icon={FaBuilding} value={user.permanentAddress} />
            </Section>

            <Section title="Personal Information" icon={FaUser}>
              <InfoRow label="Gender" icon={FaVenusMars} value={user.gender} />
              <InfoRow label="Date of Birth" icon={FaBirthdayCake} value={user.dob} />
              <InfoRow label="Blood Group" icon={FaTint} value={user.bloodGroup} highlight />
            </Section>

            {user.role === 'Donor' ? (
              <Section title="Donor Profile" icon={FaHandHoldingHeart}>
                <InfoRow label="Weight" icon={FaWeight} value={user.weight ? `${user.weight} kg` : null} />
                <InfoRow label="Last Donation" icon={FaCalendarAlt} value={user.lastDonationDate || 'Never donated'} />
                <InfoRow label="Availability" icon={FaCheckCircle} value={user.availability} />
                <InfoRow label="Preferred Locations" icon={FaHospital} value={user.preferredLocations} />
                <InfoRow label="Associated With" icon={FaBuilding} value={user.associatedWith} />
                <InfoRow label="Emergency Contact" icon={FaPhone}
                  value={user.emergencyContactName ? `${user.emergencyContactName} — ${user.emergencyContactPhone}` : null}
                />
              </Section>
            ) : (
              <Section title="Requestor Profile" icon={FaAmbulance}>
                <InfoRow 
                  label="Verification Doc" 
                  icon={FaFileAlt} 
                  value={
                    user.documentName ? (
                      <span className="badge badge-info" style={{ textTransform: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '0.15rem 0.45rem', border: 'none' }}>
                        📄 {user.documentName}
                      </span>
                    ) : (
                      'None uploaded'
                    )
                  } 
                />
              </Section>
            )}

            <Section title="Account Status" icon={FaShieldAlt}>
              <InfoRow label="System Role" icon={FaIdBadge} value={user.role} />
              <InfoRow label="Account Status" icon={FaShieldAlt} value={user.status} highlight />
              <InfoRow label="Registered On" icon={FaCalendarAlt} value={user.joinedDate} />
              <InfoRow label="User ID" icon={FaIdBadge} value={`#${user.id}`} />
            </Section>

          </div>
        </div>
      )}

      <style>{`
        .ud-page { padding: 0; }

        /* ── Breadcrumb Bar ── */
        .ud-breadcrumb-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding: 0.65rem 1rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 10px;
        }
        html.light-theme .ud-breadcrumb-bar {
          background: #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .ud-breadcrumb-inner {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
        }
        .ud-crumb {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .ud-crumb-home, .ud-crumb-link {
          cursor: pointer;
          color: var(--text-secondary);
        }
        .ud-crumb-home:hover, .ud-crumb-link:hover {
          color: var(--primary);
          background: var(--primary-light);
        }
        .ud-crumb-active {
          font-weight: 600;
          color: var(--text-primary);
          background: rgba(255,255,255,0.05);
        }
        html.light-theme .ud-crumb-active {
          background: rgba(0,0,0,0.04);
        }
        .ud-crumb-sep {
          color: var(--text-muted);
          opacity: 0.5;
        }
        .ud-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          padding: 0.35rem 0.85rem;
          white-space: nowrap;
        }

        /* ── Skeleton ── */
        .ud-skeleton-wrap { padding: 2rem; }

        /* ── Not Found ── */
        .ud-not-found {
          padding: 4rem 2rem;
          text-align: center;
          color: var(--text-secondary);
        }
        .ud-not-found h3 {
          margin: 1rem 0 0.5rem;
          color: var(--text-primary);
          font-size: 1.2rem;
        }

        /* ── Layout ── */
        .ud-content-grid {
          display: grid;
          grid-template-columns: 270px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* ── Hero Card ── */
        .ud-hero-card {
          padding: 2rem 1.5rem;
          text-align: center;
          position: sticky;
          top: 80px;
        }
        .ud-avatar {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), hsl(var(--primary-h), var(--primary-s), 62%));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0 auto 0.75rem;
          box-shadow: 0 6px 20px hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.4);
        }

        /* Status Pill — separate row, clearly visible */
        .ud-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 0.85rem;
        }
        .ud-status-active {
          background: rgba(16, 185, 129, 0.12) !important;
          color: #10b981 !important;
          border: none !important;
        }
        .ud-status-suspended {
          background: rgba(239, 68, 68, 0.1) !important;
          color: #ef4444 !important;
          border: none !important;
        }
        .ud-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
          display: inline-block;
          animation: ud-pulse 2s ease infinite;
        }
        @keyframes ud-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }

        .ud-hero-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.3rem;
        }
        .ud-hero-email {
          font-size: 0.76rem;
          color: var(--text-secondary);
          margin-bottom: 0.15rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ud-hero-phone {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ud-pills {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .role-donor-badge {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          border: none;
          font-size: 0.73rem;
          padding: 0.22rem 0.7rem;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
        }
        html.light-theme .role-donor-badge {
          background: rgba(0, 0, 0, 0.04);
          color: var(--text-secondary);
        }
        .role-seeker-badge {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          border: none;
          font-size: 0.73rem;
          padding: 0.22rem 0.7rem;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
        }
        html.light-theme .role-seeker-badge {
          background: rgba(0, 0, 0, 0.04);
          color: var(--text-secondary);
        }
        .blood-badge-lg {
          font-weight: 700;
          color: var(--text-primary);
          background: transparent;
          border: none;
          padding: 0;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
        }
        .ud-divider {
          height: 1px;
          background: var(--border);
          margin: 0.85rem 0;
        }
        .ud-meta-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.76rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .ud-meta-row strong { color: var(--text-secondary); }

        .ud-action-btn {
          width: 100%;
          margin-top: 0.5rem;
          font-size: 0.82rem;
          padding: 0.5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }

        /* ── Right column ── */
        .ud-right-col {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .ud-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        html.light-theme .ud-section {
          background: #ffffff;
          box-shadow: 0 1px 5px rgba(0,0,0,0.05);
        }
        .ud-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.7rem 1.25rem;
          background: rgba(255,255,255,0.025);
          border-bottom: 1px solid var(--border);
        }
        html.light-theme .ud-section-header { background: #f8f9fa; }
        .ud-section-icon-wrap {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ud-section-header h4 {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }
        .ud-section-body { padding: 0.4rem 0; }
        .ud-info-row {
          display: flex;
          align-items: center;
          padding: 0.5rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          gap: 1rem;
        }
        html.light-theme .ud-info-row { border-bottom-color: rgba(0,0,0,0.04); }
        .ud-info-row:last-child { border-bottom: none; }
        .ud-label {
          min-width: 165px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.4px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .ud-value {
          font-size: 0.86rem;
          color: var(--text-primary);
          word-break: break-word;
        }
        .ud-highlight {
          color: var(--primary);
          font-weight: 700;
        }

        /* Buttons */
        .btn-danger-outline {
          background: rgba(239,68,68,0.05);
          border: 1px solid rgba(239,68,68,0.3);
          color: var(--danger);
        }
        .btn-danger-outline:hover { background: var(--danger); color: white; }
        .btn-success-outline {
          background: rgba(16,185,129,0.05);
          border: 1px solid rgba(16,185,129,0.3);
          color: var(--success);
        }
        .btn-success-outline:hover { background: var(--success); color: white; }

        @media (max-width: 860px) {
          .ud-content-grid { grid-template-columns: 1fr; }
          .ud-hero-card { position: static; }
        }
      `}</style>
    </div>
  );
};

export default UserDetail;
