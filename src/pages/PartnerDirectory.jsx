import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import indiaFlag from '../assets/icons/india.png';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PartnerDirectory = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit mode state
  const [formMode, setFormMode] = useState('list'); // 'list', 'edit'
  const [activePartnerId, setActivePartnerId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Hospital',
    address: '',
    phone: '',
    email: '',
    contactPerson: ''
  });

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await api.partners.list();
      setPartners(data);
      setLoading(false);
    } catch (err) {
      setError('Could not load partners directories.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const sanitized = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, phone: sanitized });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const startCreate = () => {
    navigate('/partners/add');
  };

  const startEdit = (partner) => {
    const cleanedPhone = partner.phone ? partner.phone.replace(/[\s\-()]/g, '').replace(/^(\+91|91)/, '') : '';
    setFormData({
      name: partner.name,
      type: partner.type,
      address: partner.address,
      phone: cleanedPhone,
      email: partner.email,
      contactPerson: partner.contactPerson
    });
    setActivePartnerId(partner.id);
    setFormMode('edit');
    setError(null);
  };

  const handleView = (partner) => {
    const getBadgeStyle = (type) => {
      switch (type) {
        case 'Hospital':
          return 'background: rgba(59, 130, 246, 0.1); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.2);';
        case 'Blood Bank':
          return 'background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.2);';
        default:
          return 'background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.2);';
      }
    };

    Swal.fire({
      title: `<span style="font-family: var(--font-heading); font-weight: 700; color: var(--text-primary);">${partner.name}</span>`,
      html: `
        <div style="text-align: left; font-family: var(--font-sans); color: var(--text-primary); font-size: 0.9rem; line-height: 1.8; margin-top: 1rem;">
          <div style="margin-bottom: 0.6rem; display: flex; align-items: center; gap: 8px;">
            <strong style="width: 120px; color: var(--text-secondary);">Facility Type:</strong> 
            <span class="badge" style="font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px; ${getBadgeStyle(partner.type)}">${partner.type}</span>
          </div>
          <div style="margin-bottom: 0.6rem; display: flex; align-items: flex-start; gap: 8px;">
            <strong style="width: 120px; color: var(--text-secondary);">Address:</strong> 
            <span style="flex: 1;">${partner.address}</span>
          </div>
          <div style="margin-bottom: 0.6rem; display: flex; align-items: center; gap: 8px;">
            <strong style="width: 120px; color: var(--text-secondary);">Phone:</strong> 
            <span>${partner.phone}</span>
          </div>
          <div style="margin-bottom: 0.6rem; display: flex; align-items: center; gap: 8px;">
            <strong style="width: 120px; color: var(--text-secondary);">Email:</strong> 
            <span>${partner.email}</span>
          </div>
          <div style="margin-bottom: 0.6rem; display: flex; align-items: center; gap: 8px; border-top: 1px solid var(--border); padding-top: 0.6rem; margin-top: 0.6rem;">
            <strong style="width: 120px; color: var(--text-secondary);">Contact Liaison:</strong> 
            <span>${partner.contactPerson}</span>
          </div>
        </div>
      `,
      confirmButtonColor: 'var(--primary)',
      confirmButtonText: 'Close Details'
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.address || !formData.phone || !formData.email || !formData.contactPerson) {
      Swal.fire({
        title: 'Incomplete Details',
        text: 'Please fill in all clinical profile details.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)'
      });
      return;
    }

    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        title: 'Invalid Email Address',
        text: 'Please enter a valid email address.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)'
      });
      return;
    }

    // Validate phone number: exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      Swal.fire({
        title: 'Invalid Phone Number',
        text: 'Please enter a valid 10-digit phone number.',
        icon: 'warning',
        confirmButtonColor: 'var(--primary)'
      });
      return;
    }

    try {
      if (formMode === 'create') {
        await api.partners.create({
          ...formData,
          phone: `+91 ${formData.phone}`
        });
        Swal.fire({
          title: 'Registered!',
          text: 'New partner facility has been registered successfully.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } else {
        await api.partners.update(activePartnerId, {
          ...formData,
          phone: `+91 ${formData.phone}`
        });
        Swal.fire({
          title: 'Updated!',
          text: 'Partner facility details updated successfully.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      }
      setFormMode('list');
      fetchPartners();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: `Failed to save record: ${err.message}`,
        icon: 'error',
        confirmButtonColor: 'var(--primary)'
      });
    }
  };

  const handleDelete = async (partnerId) => {
    const result = await Swal.fire({
      title: 'Delete Partner Record?',
      text: 'Are you sure you want to delete this clinical partner record? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setError(null);
      try {
        await api.partners.delete(partnerId);
        fetchPartners();
        Swal.fire({
          title: 'Deleted!',
          text: 'The partner record has been deleted.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: `Failed to delete record: ${err.message}`,
          icon: 'error',
          confirmButtonColor: 'var(--primary)'
        });
      }
    }
  };

  return (
    <div className="partners-view">
      {/* Header Controls */}
      <div className="glass-card controls-card partners-header">
        <div>
          <h2 className="controls-title" style={{ fontSize: '1.1rem', margin: 0 }}>
            {formMode === 'list' ? 'Organizations & Partners' : 'Edit Organization Details'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            {formMode === 'list'
              ? 'Manage affiliated blood banks, hospitals, NGOs, and student camps.'
              : 'Modify organization details or primary contact liaison.'}
          </p>
        </div>

        {formMode === 'list' && (
          <button className="btn btn-primary" onClick={startCreate}>
            + Add Organization
          </button>
        )}
      </div>

      {error && <div className="alert-box alert-danger mt-4">{error}</div>}

      {/* CRUD CONTENT SWAPPER */}
      {formMode === 'list' ? (
        <div className="partners-list-content mt-4">
          {loading ? (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S.No.</th>
                    <th>Facility Name</th>
                    <th>Type</th>
                    <th>Contact Details</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center' }}><Skeleton width={20} /></td>
                      <td><Skeleton width={180} height={14} /></td>
                      <td><Skeleton width={80} height={22} borderRadius={20} /></td>
                      <td><Skeleton width={140} height={14} /><br /><Skeleton width={100} height={12} style={{ marginTop: 4 }} /></td>
                      <td><Skeleton width={160} height={14} /></td>
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
          ) : partners.length === 0 ? (
            <div className="glass-card text-center py-6" style={{ color: 'var(--text-muted)' }}>
              No partner records found. Click '+ Add Partner Site' to register one.
            </div>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S.No.</th>
                    <th>Facility Name</th>
                    <th>Type</th>
                    <th>Contact Details</th>
                    <th>Address</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p, index) => (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'center', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {index + 1}
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{p.name}</td>
                      <td>
                        <span className={`badge partner-type-tag type-${p.type.toLowerCase().replace(' ', '')}`}>
                          {p.type}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.email}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{p.phone}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.address}</td>
                      <td>
                        <div className="partner-actions-cell">
                          <button className="btn-action-outline btn-view-outline" onClick={() => handleView(p)} title="View Details">
                            <FaEye /> View
                          </button>
                          <button className="btn-action-outline btn-edit-outline" onClick={() => startEdit(p)} title="Edit Details">
                            <FaEdit /> Edit
                          </button>
                          <button className="btn-action-outline btn-delete-outline" onClick={() => handleDelete(p.id)} title="Delete Site">
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
      ) : (
        /* Edit Form view */
        <div className="glass-card mt-4 form-card-container animate-fade">
          <form onSubmit={handleSave} className="partner-crud-form">
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">Organization / Partner Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Guwahati Blood Bank"
                  required
                />
              </div>
              <div className="form-group flex-1">
                <label className="form-label">Facility Type</label>
                <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
                  <option value="Hospital">Hospital</option>
                  <option value="Blood Bank">Blood Bank</option>
                  <option value="College">College Camp</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. G.S. Road, Christian Basti, Guwahati, Assam"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">Primary Telephone</label>
                <div className="phone-input-group">
                  <div className="phone-prefix-box">
                    <img src={indiaFlag} alt="IN" style={{ width: '18px', height: '12px', borderRadius: '2px', objectFit: 'cover' }} />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    className="phone-input-field"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="94350 99999"
                    maxLength={10}
                    required
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Must be exactly 10 digits.
                </span>
              </div>
              <div className="form-group flex-1">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. contact@guwahatibloodbank.org"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Contact Person (Staff / Liaison)</label>
              <input
                type="text"
                name="contactPerson"
                className="form-control"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g. Dr. Nabajit Baruah"
                required
              />
            </div>

            <div className="form-actions mt-6 flex-between">
              <button type="button" className="btn btn-secondary" onClick={() => setFormMode('list')}>Cancel</button>
              <button type="submit" className="btn btn-success">Save Organization Updates</button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .partner-type-tag {
          font-size: 0.7rem;
        }

        .type-hospital { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }
        .type-bloodbank { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.2); }
        .type-college { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }

        html.light-theme .type-hospital { color: #2563eb; }
        html.light-theme .type-bloodbank { color: #dc2626; }
        html.light-theme .type-college { color: #059669; }

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

        .form-card-container {
          width: 100%;
          margin: 1.5rem 0 0;
          padding: 2.5rem;
        }

        .partner-crud-form {
          text-align: left;
        }

        .partner-crud-form .btn {
          padding: 0.55rem 1.25rem;
          font-size: 0.85rem;
          border-radius: 6px;
        }

        .phone-input-group {
          display: flex;
          align-items: stretch;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
          width: 100%;
          overflow: hidden;
        }

        html.light-theme .phone-input-group {
          background: #ffffff;
          border-color: var(--border);
        }

        .phone-input-group:focus-within {
          outline: none;
          border-color: hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.7) !important;
          box-shadow: 0 0 6px hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.25) !important;
          background: rgba(0, 0, 0, 0.4);
        }

        html.light-theme .phone-input-group:focus-within {
          background: #ffffff;
          border-color: hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.65) !important;
          box-shadow: 0 0 6px hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.18) !important;
        }

        .phone-prefix-box {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-right: 1px solid var(--border);
          padding: 0 0.75rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          gap: 8px;
          user-select: none;
        }

        html.light-theme .phone-prefix-box {
          background: rgba(0, 0, 0, 0.02);
          border-right-color: var(--border);
        }

        .phone-input-field {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          padding: 0.55rem 0.85rem;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 0.85rem;
          width: 100%;
          outline: none !important;
        }

        .phone-input-field:invalid {
          box-shadow: none !important;
          outline: none !important;
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

        .partners-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        @media (max-width: 576px) {
          .partners-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .partners-header .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default PartnerDirectory;
