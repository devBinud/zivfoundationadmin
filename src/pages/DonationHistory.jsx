/* DonationHistory - Dedicated Donation Log History page */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaCalendarAlt, FaHospital, FaTint, FaMedal, FaGem, FaTrophy, FaCertificate } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DonationHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setLoading(true);
        const certs = await api.certificates.list();
        const foundCert = certs.find(c => c.id === id);
        if (foundCert) {
          setCert(foundCert);
          
          // Generate the timeline history
          const historyList = [];
          const baseDate = new Date(foundCert.issueDate);
          
          for (let i = 0; i < foundCert.donationCount; i++) {
            const donationDate = new Date(baseDate);
            donationDate.setMonth(baseDate.getMonth() - (i * 3) - 1);
            const formattedDate = donationDate.toISOString().split('T')[0];
            
            const hospitals = [
              'Guwahati Medical College & Hospital',
              'Jorhat Medical College',
              'Assam Medical College, Dibrugarh',
              'Siloah Christian Hospital',
              'Narayana Superspeciality Hospital'
            ];
            const locations = ['Guwahati', 'Jorhat', 'Dibrugarh', 'Silchar'];
            
            historyList.push({
              id: `tx-${i}`,
              date: formattedDate,
              qty: '1 Unit (350ml)',
              hospital: hospitals[i % hospitals.length],
              location: locations[i % locations.length],
              type: 'Whole Blood',
              status: 'Completed'
            });
          }
          setHistory(historyList);
        } else {
          Swal.fire('Error', 'Donor record not found.', 'error');
          navigate('/certificates');
        }
        setLoading(false);
      } catch (err) {
        Swal.fire('Error', 'Could not load donation history.', 'error');
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [id, navigate]);

  const getTierIcon = (tier) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return <FaGem style={{ color: '#06b6d4', fontSize: '1.2rem' }} />;
      case 'gold': return <FaTrophy style={{ color: '#eab308', fontSize: '1.2rem' }} />;
      default: return <FaMedal style={{ color: '#94a3b8', fontSize: '1.2rem' }} />;
    }
  };

  const getTierBadgeClass = (tier) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'tier-badge-plat';
      case 'gold': return 'tier-badge-gold';
      default: return 'tier-badge-silver';
    }
  };

  return (
    <div className="donation-history-view">
      {/* Navigation Header */}
      <div className="glass-card mb-6" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/certificates')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <FaArrowLeft /> Back to Honors
          </button>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Donation Log Timeline</span>
        </div>

        {cert && (
          <button className="btn btn-primary" onClick={() => navigate(`/certificates/view/${cert.id}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <FaCertificate /> View Honors Certificate
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem' }}>
          <Skeleton height={24} width={300} style={{ marginBottom: '1.5rem' }} />
          <Skeleton count={5} height={40} style={{ marginBottom: '1rem' }} />
        </div>
      ) : cert ? (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }} className="history-grid">
          
          {/* Left Profile Panel */}
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '700',
              margin: '0 auto 1rem auto'
            }}>
              {cert.donorName.charAt(0).toUpperCase()}
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
              {cert.donorName}
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 1.25rem 0' }}>
              Ziv Lifesaver Donor Database
            </p>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              
              {/* Honor badge */}
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Recognition Level
                </span>
                <span className={`badge ${getTierBadgeClass(cert.tier)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.35rem 0.75rem', borderRadius: '30px', textTransform: 'none' }}>
                  {cert.tier.toLowerCase() === 'platinum' && <FaGem style={{ color: '#06b6d4' }} />}
                  {cert.tier.toLowerCase() === 'gold' && <FaTrophy style={{ color: '#eab308' }} />}
                  {cert.tier.toLowerCase() === 'silver' && <FaMedal style={{ color: '#94a3b8' }} />}
                  <span style={{ fontWeight: '600' }}>ৰক্তবন্ধু</span>
                  <span style={{ opacity: 0.8, fontSize: '0.78rem', fontWeight: '500' }}>({cert.tier})</span>
                </span>
              </div>

              {/* Total donations */}
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                  Lifesaving Impact
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', display: 'block' }}>
                  {cert.donationCount} Units
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Up to {cert.donationCount * 3} lives rescued
                </span>
              </div>
            </div>
          </div>

          {/* Right Log Timeline Panel */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Donation Log Timeline
            </h2>

            <div className="timeline-container">
              {history.map((item, index) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-badge-icon">
                    <FaTint />
                  </div>
                  <div className="timeline-card">
                    <div className="timeline-header">
                      <div className="timeline-title-group">
                        <span className="timeline-qty">{item.qty}</span>
                        <span className="timeline-dot">•</span>
                        <span className="timeline-type">{item.type}</span>
                      </div>
                      <span className="timeline-status">{item.status}</span>
                    </div>

                    <div className="timeline-body">
                      <div className="timeline-meta-item">
                        <FaHospital />
                        <span>{item.hospital} ({item.location})</span>
                      </div>
                      <div className="timeline-meta-item">
                        <FaCalendarAlt />
                        <span>Donated on {item.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

      <style>{`
        .timeline-container {
          position: relative;
          padding-left: 2rem;
          margin-top: 1rem;
        }

        .timeline-container::before {
          content: "";
          position: absolute;
          left: 9px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: var(--border);
        }

        .timeline-item {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-badge-icon {
          position: absolute;
          left: -2rem;
          top: 4px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.1);
          color: var(--danger);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          border: 2px solid var(--border);
          z-index: 1;
        }

        .timeline-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1rem 1.25rem;
          transition: all 0.2s ease;
        }

        .timeline-card:hover {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .timeline-title-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .timeline-qty {
          font-size: 0.9rem;
          fontWeight: 700;
          color: var(--text-primary);
        }

        .timeline-dot {
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .timeline-type {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .timeline-status {
          font-size: 0.72rem;
          font-weight: 700;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 0.15rem 0.5rem;
          border-radius: 30px;
          text-transform: uppercase;
        }

        .timeline-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .timeline-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .timeline-meta-item svg {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .tier-badge-plat {
          background: rgba(156, 163, 175, 0.12);
          color: var(--text-primary);
          border: 1px solid rgba(156, 163, 175, 0.25);
        }

        .tier-badge-gold {
          background: rgba(245, 158, 11, 0.12);
          color: #d97706;
          border: 1px solid rgba(245, 158, 11, 0.25);
        }

        html:not(.light-theme) .tier-badge-gold {
          color: #fbbf24;
        }

        .tier-badge-silver {
          background: rgba(148, 163, 184, 0.12);
          color: var(--text-primary);
          border: 1px solid rgba(148, 163, 184, 0.25);
        }

        @media (max-width: 768px) {
          .history-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DonationHistory;
