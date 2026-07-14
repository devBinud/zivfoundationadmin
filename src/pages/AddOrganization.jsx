import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Swal from 'sweetalert2';

const AddOrganization = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Hospital',
    address: '',
    phone: '',
    email: '',
    contactPerson: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    try {
      await api.partners.create(formData);
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
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 94350 99999"
                required
              />
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
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/partners')}>
              View All Organizations
            </button>
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
      `}</style>
    </div>
  );
};

export default AddOrganization;
