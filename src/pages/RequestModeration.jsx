/* RequestModeration - Emergency Blood Requests Vetting Dashboard */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaFileAlt, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const RequestModeration = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Document modal simulation
  const [activeDoc, setActiveDoc] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.requests.list();
      setRequests(data);
      setLoading(false);
    } catch (err) {
      setError('Could not load blood request queues.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const handleGlobalSuccess = () => {
      fetchRequests();
    };
    window.addEventListener('on-behalf-success', handleGlobalSuccess);
    return () => {
      window.removeEventListener('on-behalf-success', handleGlobalSuccess);
    };
  }, []);

  const handleUpdateStatus = async (requestId, status) => {
    const actionWord = status === 'Approved' ? 'approve' : 'reject';
    const result = await Swal.fire({
      title: `${status} Request?`,
      text: `Are you sure you want to ${actionWord} this emergency blood request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'Approved' ? '#10b981' : 'var(--danger)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionWord}!`
    });

    if (result.isConfirmed) {
      setError(null);
      try {
        await api.requests.updateStatus(requestId, status);
        await fetchRequests();
        Swal.fire({
          title: `${status}!`,
          text: `Request has been successfully ${status.toLowerCase()}.`,
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: `Failed to update request: ${err.message}`,
          icon: 'error',
          confirmButtonColor: 'var(--primary)'
        });
      }
    }
  };

  const startEdit = (req) => {
    setEditingRequest({ ...req });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.requests.update(editingRequest.id, {
        seekerName: editingRequest.seekerName,
        bloodGroup: editingRequest.bloodGroup,
        unitsNeeded: editingRequest.unitsNeeded,
        hospitalName: editingRequest.hospitalName,
        urgency: editingRequest.urgency
      });
      setEditingRequest(null);
      fetchRequests();
      Swal.fire({
        title: 'Updated!',
        text: 'Blood request details updated successfully.',
        icon: 'success',
        confirmButtonColor: 'var(--primary)'
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: `Failed to save changes: ${err.message}`,
        icon: 'error',
        confirmButtonColor: 'var(--primary)'
      });
    }
  };

  const handleDelete = async (requestId) => {
    const result = await Swal.fire({
      title: 'Delete Request?',
      text: 'Are you sure you want to delete this emergency blood request record? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.requests.delete(requestId);
        fetchRequests();
        Swal.fire({
          title: 'Deleted!',
          text: 'The request record has been deleted.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: `Failed to delete request: ${err.message}`,
          icon: 'error',
          confirmButtonColor: 'var(--primary)'
        });
      }
    }
  };

  const showDocument = (req) => {
    setActiveDoc(req);
  };

  const closeDocument = () => {
    setActiveDoc(null);
  };

  return (
    <div className="moderation-view">
      {/* Overview stats cards */}
      <div className="glass-card controls-card mb-4 flex-between">
        <div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Verification Queue</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Verify medical files and certify urgent blood requests before broadcasting notifications to matches.
          </p>
        </div>
        <span className="badge badge-secondary">
          Pending: {requests.filter(r => r.status === 'Pending').length}
        </span>
      </div>

      {error && <div className="alert-box alert-danger mb-4">{error}</div>}

      {/* Requests table grid */}
      <div className="glass-card table-card">
        {loading ? (
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient/Seeker</th>
                  <th>Required Blood</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td><Skeleton width={150} height={14} /></td>
                    <td><Skeleton width={45} height={22} borderRadius={6} /></td>
                    <td><Skeleton width={75} height={22} borderRadius={20} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Skeleton width={55} height={26} borderRadius={6} />
                        <Skeleton width={55} height={26} borderRadius={6} />
                        <Skeleton width={55} height={26} borderRadius={6} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : requests.length === 0 ? (
          <p style={{ padding: '3rem', color: 'var(--text-muted)' }} className="text-center">No blood requests found in queue.</p>
        ) : (
          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient/Seeker</th>
                  <th>Required Blood</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{r.seekerName}</td>
                    <td>
                      <span className="blood-badge-mod">{r.bloodGroup}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div className="partner-actions-cell">
                        <button className="btn-action-outline btn-view-outline" onClick={() => showDocument(r)} title="Review Medical File">
                          <FaEye /> View
                        </button>
                        <button className="btn-action-outline btn-edit-outline" onClick={() => startEdit(r)} title="Edit Details">
                          <FaEdit /> Edit
                        </button>
                        <button className="btn-action-outline btn-delete-outline" onClick={() => handleDelete(r.id)} title="Delete Request">
                          <FaTrash /> Delete
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

      {/* Edit Request Modal */}
      {editingRequest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Blood Request</h2>
              <button className="modal-close-btn" onClick={() => setEditingRequest(null)}>&times;</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ textAlign: 'left' }}>
                <div className="form-group mb-4">
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Patient Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRequest.seekerName}
                    onChange={(e) => setEditingRequest({ ...editingRequest, seekerName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row flex-gap mb-4" style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group flex-1" style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Blood Group</label>
                    <select
                      className="form-control"
                      value={editingRequest.bloodGroup}
                      onChange={(e) => setEditingRequest({ ...editingRequest, bloodGroup: e.target.value })}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="form-group flex-1" style={{ flex: 1 }}>
                    <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Units Needed</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="10"
                      value={editingRequest.unitsNeeded}
                      onChange={(e) => setEditingRequest({ ...editingRequest, unitsNeeded: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Clinical Facility</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingRequest.hospitalName}
                    onChange={(e) => setEditingRequest({ ...editingRequest, hospitalName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Urgency</label>
                  <select
                    className="form-control"
                    value={editingRequest.urgency}
                    onChange={(e) => setEditingRequest({ ...editingRequest, urgency: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRequest(null)}>Cancel</button>
                <button type="submit" className="btn btn-success">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supporting Document Viewer Modal */}
      {activeDoc && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Medical Certificate Vetting</h2>
              <button className="modal-close-btn" onClick={closeDocument}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="mock-pdf-viewport glass-card">
                <div className="pdf-header flex-between mb-4">
                  <div>
                    <h4>METRO GENERAL HOSPITAL CLINICS</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Department of Pathology & Hematology</p>
                  </div>
                  <span className="pdf-official-seal">CONFIDENTIAL</span>
                </div>

                <div className="pdf-body mt-4" style={{ fontSize: '0.85rem', lineHeight: 1.6, textAlign: 'left' }}>
                  <p><strong>Date:</strong> {activeDoc.dateRequested || '2026-07-12'}</p>
                  <p><strong>Patient Name:</strong> {activeDoc.seekerName}</p>
                  <p><strong>Diagnosis:</strong> Severe anemia / acute trauma blood transfusion replacement request.</p>
                  <p><strong>Required Transfusion:</strong> {activeDoc.unitsNeeded} units of whole packed red cells ({activeDoc.bloodGroup} type).</p>
                  <p style={{ marginTop: '1rem', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '1rem' }}>
                    This certifies that the patient listed above is currently admitted under clinical emergency code red. Immediate donor matching is approved by head duty hematologist.
                  </p>
                </div>

                <div className="pdf-signature mt-6 flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div>
                    <p style={{ textDecoration: 'underline' }}>Dr. Rachel Green, MD</p>
                    <p>Licence ID: #NY-991204</p>
                  </div>
                  <div className="qr-code-placeholder">
                    [SECURE SYSTEM VERIFIED]
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDocument}>Close Document</button>
              {activeDoc.status === 'Pending' && (
                <>
                  <button className="btn btn-danger" onClick={() => { handleUpdateStatus(activeDoc.id, 'Rejected'); closeDocument(); }}>Reject Request</button>
                  <button className="btn btn-success" onClick={() => { handleUpdateStatus(activeDoc.id, 'Approved'); closeDocument(); }}>Approve & Broadcast</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .blood-badge-mod {
          font-weight: 700;
          color: var(--primary);
          background: rgba(197, 17, 46, 0.1);
          border: 1px solid rgba(197, 17, 46, 0.2);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }

        .urgency-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.15rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 9999px;
          text-transform: uppercase;
        }

        .urgency-high { background: rgba(239, 68, 68, 0.12); color: var(--danger); }
        .urgency-medium { background: rgba(245, 158, 11, 0.12); color: var(--warning); }
        .urgency-low { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }

        .btn-doc-link {
          background: none;
          border: none;
          color: #60a5fa;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.85rem;
          text-decoration: underline;
          transition: color 0.2s ease;
        }
        .btn-doc-link:hover {
          color: #3b82f6;
        }

        .partner-actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .btn-action-outline {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          transition: all 0.2s ease;
        }

        .btn-view-outline {
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .btn-view-outline:hover {
          background: var(--primary-light);
          color: var(--primary);
          border-color: var(--primary);
        }

        .btn-edit-outline {
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }

        html.light-theme .btn-edit-outline {
          color: #2563eb;
          border-color: rgba(37, 99, 235, 0.3);
        }

        .btn-edit-outline:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .btn-delete-outline {
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--danger);
        }

        .btn-delete-outline:hover {
          background: var(--danger);
          color: white;
        }

        .mock-pdf-viewport {
          background: #ffffff !important;
          color: #0b0c10 !important;
          border: 1px solid #e5e7eb;
          padding: 2.5rem;
          font-family: 'Times New Roman', Times, serif;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .mock-pdf-viewport h4 {
          color: #0b0c10 !important;
          font-family: Arial, Helvetica, sans-serif;
          font-weight: 700;
        }

        .pdf-official-seal {
          border: 2px solid #ef4444;
          color: #ef4444;
          padding: 0.2rem 0.6rem;
          font-weight: 700;
          font-size: 0.8rem;
          transform: rotate(-5deg);
          border-radius: 4px;
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

export default RequestModeration;
