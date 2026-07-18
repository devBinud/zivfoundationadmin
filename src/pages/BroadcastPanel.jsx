/* BroadcastPanel - Publishing active banners and alerts to application users */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaBullhorn, FaBan, FaTrash, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaPaperPlane } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const BroadcastPanel = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    target: 'All',
    category: 'Info'
  });

  const fetchBroadcasts = async () => {
    try {
      setLoading(true);
      const data = await api.broadcasts.list();
      setBroadcasts(data);
      setLoading(false);
    } catch (err) {
      Swal.fire('Error', 'Failed to retrieve active broadcasts.', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      return Swal.fire('Error', 'Please fill in all required broadcast fields.', 'error');
    }

    try {
      await api.broadcasts.create(formData);
      setFormData({ title: '', message: '', target: 'All', category: 'Info' });
      fetchBroadcasts();
      Swal.fire({
        title: 'Broadcast Published!',
        text: 'The banner alert is now active for mobile app users.',
        icon: 'success',
        confirmButtonColor: 'var(--primary)'
      });
    } catch (err) {
      Swal.fire('Error', `Publishing failed: ${err.message}`, 'error');
    }
  };

  const handleExpire = async (id) => {
    try {
      await api.broadcasts.expire(id);
      fetchBroadcasts();
      Swal.fire({
        title: 'Expired!',
        text: 'The broadcast status has been set to expired.',
        icon: 'success',
        confirmButtonColor: 'var(--primary)'
      });
    } catch (err) {
      Swal.fire('Error', `Action failed: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Broadcast Alert?',
      text: 'This will remove the alert logs permanently from databases.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.broadcasts.delete(id);
        fetchBroadcasts();
        Swal.fire({
          title: 'Deleted!',
          text: 'The alert has been deleted.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } catch (err) {
        Swal.fire('Error', `Delete failed: ${err.message}`, 'error');
      }
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category.toLowerCase()) {
      case 'success': return 'badge-success';
      case 'danger': return 'badge-danger';
      case 'warning': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'success': return <FaCheckCircle style={{ marginRight: '6px' }} />;
      case 'danger': return <FaExclamationTriangle style={{ marginRight: '6px' }} />;
      case 'warning': return <FaExclamationTriangle style={{ marginRight: '6px' }} />;
      default: return <FaInfoCircle style={{ marginRight: '6px' }} />;
    }
  };

  return (
    <div className="broadcasts-view">
      <div className="page-header mb-6">
        <h1 className="page-title">
          System Broadcast Panel
        </h1>
        <p className="page-subtitle">
          Publish and manage persistent alert banners visible to users across the Ziv mobile network.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Side: Create Broadcast Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 className="card-headline mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBullhorn style={{ color: 'var(--primary)' }} /> Draft Alert Banner
          </h3>
          <form onSubmit={handleSubmit} className="custom-form">
            <div className="broadcast-form-grid">
              <div className="form-group col-title">
                <label className="form-label">Alert Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Blood Drive Campaign" 
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group col-target">
                <label className="form-label">Target Audience</label>
                <select name="target" value={formData.target} onChange={handleChange} className="form-input">
                  <option value="All">All Users</option>
                  <option value="Donors">Donors Only</option>
                  <option value="Seekers">Seekers Only</option>
                  <option value="Partners">Partners Only</option>
                </select>
              </div>

              <div className="form-group col-category">
                <label className="form-label">Alert Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="form-input">
                  <option value="Info">Info (Blue)</option>
                  <option value="Success">Success (Green)</option>
                  <option value="Warning">Warning (Gold)</option>
                  <option value="Danger">Danger (Red)</option>
                </select>
              </div>

              <div className="form-group col-message">
                <label className="form-label">Alert Message *</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write the message text that will scroll on the app..." 
                  className="form-input"
                  rows="2"
                  required
                  style={{ resize: 'none' }}
                ></textarea>
              </div>

              <div className="col-actions">
                <button type="submit" className="btn btn-primary">
                  <FaPaperPlane /> Publish Broadcast
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Bottom Side: Active Broadcast Log */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 className="card-headline mb-4">Active Alert Dispatch</h3>

          {loading ? (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Audience</th>
                    <th>Category</th>
                    <th>State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(3).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td><Skeleton width={130} height={14} /></td>
                      <td><Skeleton width={85} height={14} /></td>
                      <td><Skeleton width={60} height={20} borderRadius={6} /></td>
                      <td><Skeleton width={65} height={20} borderRadius={20} /></td>
                      <td><Skeleton width={80} height={24} borderRadius={6} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : broadcasts.length === 0 ? (
            <p className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>No broadcast alerts created yet.</p>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Audience</th>
                    <th>Category</th>
                    <th>State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcasts.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.message}>
                          {b.message}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{b.target}</td>
                      <td>
                        <span className={`badge ${getCategoryBadgeClass(b.category)}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {getCategoryIcon(b.category)} {b.category}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${b.status.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <div className="partner-actions-cell">
                          {b.status === 'Active' && (
                            <button className="btn-action-outline btn-edit-outline" onClick={() => handleExpire(b.id)} title="Expire Broadcast">
                              <FaBan /> Expire
                            </button>
                          )}
                          <button className="btn-action-outline btn-delete-outline" onClick={() => handleDelete(b.id)} title="Delete Broadcast">
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
      </div>
    </div>
  );
};

export default BroadcastPanel;
