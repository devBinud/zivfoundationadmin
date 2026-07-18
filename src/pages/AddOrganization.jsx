import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import indiaFlag from '../assets/icons/india.png';

const AddOrganization = () => {
  const navigate = useNavigate();
  const [orgTypes, setOrgTypes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Hospital',
    address: '',
    phone: '',
    email: '',
    contactPerson: ''
  });

  useEffect(() => {
    api.orgTypes.list().then(data => {
      setOrgTypes(data);
      if (data.length > 0) setFormData(prev => ({ ...prev, type: data[0].label }));
    }).catch(() => {});
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      await api.partners.create({
        ...formData,
        phone: `+91 ${formData.phone}`
      });
      Swal.fire({
        title: 'Registered!',
        text: 'New partner facility has been registered successfully.',
        icon: 'success',
        confirmButtonColor: 'var(--primary)'
      }).then(() => {
        navigate('/partners');
      });
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: `Failed to save record: ${err.message}`,
        icon: 'error',
        confirmButtonColor: 'var(--primary)'
      });
    }
  };

  return (
    <div className="partners-view">
      {/* Header Controls */}
      <div className="glass-card controls-card add-org-header">
        <div>
          <h2 className="controls-title" style={{ fontSize: '1.1rem', margin: 0 }}>
            Add New Organization
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
            Register a new clinical partner, NGO, or healthcare organization.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => navigate('/partners')}>
          View All Organizations
        </button>
      </div>

      {/* Form */}
      <div className="glass-card mt-4 form-card-container animate-fade">
        <form onSubmit={handleSubmit} className="partner-crud-form">
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
              <label className="form-label">Organization Type</label>
              <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
                {orgTypes.length > 0
                  ? orgTypes.map(t => <option key={t.id} value={t.label}>{t.label}</option>)
                  : (
                    <>
                      <option value="Hospital">Hospital</option>
                      <option value="Blood Bank">Blood Bank</option>
                      <option value="NGO">NGO / Non-Profit</option>
                      <option value="Clinic">Clinic / Diagnostic Centre</option>
                      <option value="College">College Camp</option>
                    </>
                  )
                }
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

          <div className="form-actions mt-6" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-success">
              Register Organization
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .add-org-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        @media (max-width: 576px) {
          .add-org-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .add-org-header .btn {
            width: 100%;
            justify-content: center;
          }
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
      `}</style>
    </div>
  );
};

export default AddOrganization;
