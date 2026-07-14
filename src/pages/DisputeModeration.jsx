/* DisputeModeration - Comment flagging and reviews disputes panel */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaArrowRight } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const DisputeModeration = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const data = await api.disputes.list();
      setDisputes(data);
      setLoading(false);
    } catch (err) {
      setError('Could not load dispute boards.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolveDispute = async (disputeId) => {
    const result = await Swal.fire({
      title: 'Resolve Dispute?',
      text: 'Are you sure you want to resolve and dismiss flags for this comment?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, resolve!'
    });

    if (result.isConfirmed) {
      setError(null);
      try {
        await api.disputes.resolve(disputeId);
        await fetchDisputes();
        Swal.fire({
          title: 'Resolved!',
          text: 'Dispute has been resolved and settled.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: `Failed to resolve dispute: ${err.message}`,
          icon: 'error',
          confirmButtonColor: 'var(--primary)'
        });
      }
    }
  };

  return (
    <div className="disputes-view">
      <div className="glass-card controls-card mb-4 flex-between">
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Flagged Disputes Board</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Moderate community reviews, ratings disputes, or abusive/commercial solicitation comments.
          </p>
        </div>
        <span className="badge badge-secondary">
          Awaiting Action: {disputes.filter(d => d.status === 'Pending').length}
        </span>
      </div>

      {error && <div className="alert-box alert-danger mb-4">{error}</div>}

      {/* Disputes list */}
      {loading ? (
        <div className="disputes-stack">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card dispute-item-card mb-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Skeleton width={90} height={22} borderRadius={20} />
                  <Skeleton width={130} height={14} />
                </div>
                <Skeleton width={80} height={22} borderRadius={20} />
              </div>
              <Skeleton width={200} height={15} style={{ marginBottom: '0.4rem' }} />
              <Skeleton width={280} height={13} style={{ marginBottom: '0.4rem' }} />
              <Skeleton width={240} height={13} style={{ marginBottom: '1rem' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Skeleton width={130} height={32} borderRadius={8} />
              </div>
            </div>
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="glass-card text-center py-6" style={{ color: 'var(--text-muted)' }}>
          No disputes or flagged contents registered. All clean!
        </div>
      ) : (
        <div className="disputes-stack">
          {disputes.map(d => (
            <div key={d.id} className="glass-card dispute-item-card mb-4 animate-fade">
              <div className="dispute-item-header flex-between mb-4">
                <div className="dispute-origin">
                  <span className="badge badge-rejected" style={{ fontSize: '0.7rem' }}>
                    {d.reason}
                  </span>
                  <span className="dispute-date-text ml-4">
                    Reported on: {d.dateReported}
                  </span>
                </div>
                <div className="dispute-state">
                  <span className={`badge ${d.status === 'Pending' ? 'badge-pending' : 'badge-approved'}`}>
                    {d.status}
                  </span>
                </div>
              </div>

              <div className="dispute-participants mb-4">
                <div className="participant">
                  <span className="participant-role">Reporter:</span>
                  <span className="participant-name">{d.reporterName}</span>
                </div>
                <div className="participant-separator" style={{ display: 'flex', alignItems: 'center' }}>
                  <FaArrowRight style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="participant">
                  <span className="participant-role text-red">Offender:</span>
                  <span className="participant-name">{d.offenderName}</span>
                </div>
              </div>

              <div className="dispute-comment-bubble">
                <p className="comment-bubble-label">Flagged Comment Context:</p>
                <blockquote className="comment-quote">
                  "{d.commentText}"
                </blockquote>
              </div>

              <div className="dispute-actions mt-4 flex-between">
                <span className="dispute-id-tag">Case ID: {d.id}</span>
                {d.status === 'Pending' ? (
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleResolveDispute(d.id)}
                  >
                    Resolve & Dismiss Flags
                  </button>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 6 }}>
                    Resolved & Settled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .disputes-stack {
          display: flex;
          flex-direction: column;
        }

        .dispute-item-card {
          padding: 1.5rem 2rem;
          text-align: left;
        }

        .dispute-date-text {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .ml-4 {
          margin-left: 1rem;
        }

        .dispute-participants {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          font-size: 0.85rem;
        }

        .participant {
          display: flex;
          gap: 0.5rem;
        }

        .participant-role {
          color: var(--text-secondary);
        }

        .participant-role.text-red {
          color: var(--danger);
        }

        .participant-name {
          color: var(--text-primary);
          font-weight: 600;
        }

        .participant-separator {
          color: var(--text-muted);
        }

        .dispute-comment-bubble {
          background: rgba(239, 68, 68, 0.03);
          border-left: 4px solid var(--danger);
          padding: 1rem 1.25rem;
          border-radius: 0 8px 8px 0;
        }

        .comment-bubble-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .comment-quote {
          font-style: italic;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .dispute-id-tag {
          font-family: var(--mono);
          font-size: 0.75rem;
          color: var(--text-muted);
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
      `}</style>
    </div>
  );
};

export default DisputeModeration;
