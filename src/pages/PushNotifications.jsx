/* PushNotifications - Triggering immediate target campaigns to mobile devices */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaMobileAlt, FaPaperPlane, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PushNotifications = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'All Registered',
    sound: 'default'
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await api.campaigns.list();
      setCampaigns(data);
      setLoading(false);
    } catch (err) {
      Swal.fire('Error', 'Failed to retrieve notification campaigns.', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      return Swal.fire('Error', 'Please fill in all campaign fields.', 'error');
    }

    try {
      await api.campaigns.dispatch(formData);
      setFormData({ title: '', body: '', audience: 'All Registered', sound: 'default' });
      fetchCampaigns();
      Swal.fire({
        title: 'Campaign Dispatched!',
        text: 'The push notifications are queuing for mobile delivery networks.',
        icon: 'success',
        confirmButtonColor: 'var(--primary)'
      });
    } catch (err) {
      Swal.fire('Error', `Dispatch failed: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Campaign Log?',
      text: 'This will purge the sending log record. It cannot be recovered.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, purge it!'
    });

    if (result.isConfirmed) {
      try {
        await api.campaigns.delete(id);
        fetchCampaigns();
        Swal.fire({
          title: 'Purged!',
          text: 'Campaign log removed.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } catch (err) {
        Swal.fire('Error', `Purging failed: ${err.message}`, 'error');
      }
    }
  };

  return (
    <div className="push-campaigns-view">
      <div className="page-header mb-6">
        <h1 className="page-title">
          Mobile Push Notifications
        </h1>
        <p className="page-subtitle">
          Dispatch real-time device push notifications to targeted donor tiers or emergency matching lists.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Top: Push Composer Form */}
        <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '650px', margin: '0', width: '100%' }}>
          <h3 className="card-headline mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaMobileAlt style={{ color: 'var(--primary)' }} /> Compose Campaign
          </h3>
          <form onSubmit={handleSubmit} className="custom-form">
            <div className="form-group mb-4">
              <label className="form-label">Notification Title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Urgent Matching Needed in Assam" 
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group mb-4">
              <label className="form-label">Notification Body *</label>
              <textarea 
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Type the message body that will display on device lock screens..." 
                className="form-input"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="form-row mb-4">
              <div className="form-group flex-1">
                <label className="form-label">Target Segment</label>
                <select name="audience" value={formData.audience} onChange={handleChange} className="form-input">
                  <option value="All Registered">All Registered (Donors & Seekers)</option>
                  <option value="Platinum Donors">Platinum Tier Donors</option>
                  <option value="Gold Donors">Gold Tier Donors</option>
                  <option value="Emergency Matching List">Emergency Matching List</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label className="form-label">Chime / Alert Sound</label>
                <select name="sound" value={formData.sound} onChange={handleChange} className="form-input">
                  <option value="default">Default Sound</option>
                  <option value="urgent">Urgent Siren</option>
                  <option value="soft">Soft Chime</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full-width" style={{ gap: '8px' }}>
              <FaPaperPlane /> Dispatch Campaign
            </button>
          </form>
        </div>

        {/* Bottom: Campaign Dispatch History Log */}
        <div className="glass-card" style={{ padding: '1.5rem', width: '100%' }}>
          <h3 className="card-headline mb-4">Campaign Send Log</h3>

          {loading ? (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Notification Message</th>
                    <th>Audience</th>
                    <th>Delivered Devices</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(3).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td><Skeleton width={150} height={14} /></td>
                      <td><Skeleton width={80} height={14} /></td>
                      <td><Skeleton width={50} height={14} /></td>
                      <td><Skeleton width={60} height={20} borderRadius={20} /></td>
                      <td><Skeleton width={55} height={24} borderRadius={6} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>No campaigns launched yet.</p>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Notification Message</th>
                    <th>Audience</th>
                    <th>Delivered Devices</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.body}>
                          {c.body}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Sent: {c.dateSent}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{c.audience}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        {c.reached} Devices
                      </td>
                      <td>
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FaCheckCircle /> {c.status}
                        </span>
                      </td>
                      <td>
                        <div className="partner-actions-cell">
                          <button className="btn-action-outline btn-delete-outline" onClick={() => handleDelete(c.id)} title="Purge Record">
                            <FaTrash /> Purge
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

export default PushNotifications;
