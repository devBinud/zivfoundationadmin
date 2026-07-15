/* FlaggedReviews - Comment flagging and reviews moderation panel */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaArrowRight } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const FlaggedReviews = () => {
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFlaggedReviews = async () => {
    try {
      setLoading(true);
      const data = await api.disputes.list();
      setFlaggedReviews(data);
      setLoading(false);
    } catch (err) {
      setError('Could not load flagged reviews.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedReviews();
  }, []);

  const handleResolveReview = async (reviewId) => {
    const result = await Swal.fire({
      title: 'Resolve Flagged Review?',
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
        await api.disputes.resolve(reviewId);
        await fetchFlaggedReviews();
        Swal.fire({
          title: 'Resolved!',
          text: 'Flags have been resolved and settled.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: `Failed to resolve flags: ${err.message}`,
          icon: 'error',
          confirmButtonColor: 'var(--primary)'
        });
      }
    }
  };

  return (
    <div className="flagged-reviews-view">
      <div className="glass-card controls-card mb-4 flex-between">
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Flagged Reviews Board</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Moderate community reviews, flag comments, or resolve abusive/commercial solicitation reports.
          </p>
        </div>
        <span className="badge badge-secondary">
          Awaiting Action: {flaggedReviews.filter(r => r.status === 'Pending').length}
        </span>
      </div>

      {error && <div className="alert-box alert-danger mb-4">{error}</div>}

      {/* Flagged reviews list */}
      {loading ? (
        <div className="flagged-reviews-stack">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card flagged-review-card mb-4">
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
      ) : flaggedReviews.length === 0 ? (
        <div className="glass-card text-center py-6" style={{ color: 'var(--text-muted)' }}>
          No flagged reviews registered. All clean!
        </div>
      ) : (
        <div className="flagged-reviews-stack">
          {flaggedReviews.map(r => (
            <div key={r.id} className="glass-card flagged-review-card mb-4 animate-fade">
              <div className="flagged-review-header flex-between mb-4">
                <div className="flagged-review-origin">
                  <span className="badge badge-rejected" style={{ fontSize: '0.7rem' }}>
                    {r.reason}
                  </span>
                  <span className="flagged-review-date-text ml-4">
                    Reported on: {r.dateReported}
                  </span>
                </div>
                <div className="flagged-review-state">
                  <span className={`badge ${r.status === 'Pending' ? 'badge-pending' : 'badge-approved'}`}>
                    {r.status}
                  </span>
                </div>
              </div>

              <div className="flagged-review-participants mb-4">
                <div className="participant">
                  <span className="participant-role">Reporter:</span>
                  <span className="participant-name">{r.reporterName}</span>
                </div>
                <div className="participant-separator" style={{ display: 'flex', alignItems: 'center' }}>
                  <FaArrowRight style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="participant">
                  <span className="participant-role text-red">Offender:</span>
                  <span className="participant-name">{r.offenderName}</span>
                </div>
              </div>

              <div className="flagged-review-comment-bubble">
                <p className="comment-bubble-label">Flagged Comment Context:</p>
                <blockquote className="comment-quote">
                  "{r.commentText}"
                </blockquote>
              </div>

              <div className="flagged-review-actions mt-4 flex-between">
                <span className="flagged-review-id-tag">Report ID: {r.id}</span>
                {r.status === 'Pending' ? (
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleResolveReview(r.id)}
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
        .flagged-reviews-stack {
          display: flex;
          flex-direction: column;
        }

        .flagged-review-card {
          padding: 1.5rem 2rem;
          text-align: left;
        }

        .flagged-review-date-text {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .ml-4 {
          margin-left: 1rem;
        }

        .flagged-review-participants {
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

        .flagged-review-comment-bubble {
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

        .flagged-review-id-tag {
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

export default FlaggedReviews;
