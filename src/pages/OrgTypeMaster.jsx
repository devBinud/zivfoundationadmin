/* OrgTypeMaster - Organization Facility Type Master Configuration */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaPlus, FaTrash, FaTags, FaEdit } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const TYPE_COLORS = [
  { label: 'Blue (Hospital)',   value: 'blue',   bg: 'rgba(59,130,246,0.1)',   color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  { label: 'Red (Blood Bank)',  value: 'red',    bg: 'rgba(239,68,68,0.1)',    color: '#f87171', border: 'rgba(239,68,68,0.25)' },
  { label: 'Purple (NGO)',      value: 'purple', bg: 'rgba(139,92,246,0.1)',   color: '#a78bfa', border: 'rgba(139,92,246,0.25)' },
  { label: 'Amber (Clinic)',    value: 'amber',  bg: 'rgba(245,158,11,0.1)',   color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  { label: 'Green (College)',   value: 'green',  bg: 'rgba(16,185,129,0.1)',   color: '#34d399', border: 'rgba(16,185,129,0.25)' },
  { label: 'Pink (Other)',      value: 'pink',   bg: 'rgba(236,72,153,0.1)',   color: '#f472b6', border: 'rgba(236,72,153,0.25)' },
];

const OrgTypeMaster = () => {
  const [types, setTypes]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('blue');

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const data = await api.orgTypes.list();
      setTypes(data);
    } catch (err) {
      Swal.fire('Error', 'Failed to load organization types.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    if (types.some(t => t.label.toLowerCase() === trimmed.toLowerCase())) {
      return Swal.fire('Duplicate', 'This organization type already exists.', 'warning');
    }
    try {
      await api.orgTypes.create({ label: trimmed, color: newColor });
      setNewLabel('');
      setNewColor('blue');
      fetchTypes();
      Swal.fire({ title: 'Added!', text: `"${trimmed}" type has been added.`, icon: 'success', confirmButtonColor: 'var(--primary)' });
    } catch (err) {
      Swal.fire('Error', `Failed to add type: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id, label) => {
    const result = await Swal.fire({
      title: `Delete "${label}"?`,
      text: 'Organizations already registered under this type will keep their current type value.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        await api.orgTypes.delete(id);
        fetchTypes();
        Swal.fire({ title: 'Deleted!', text: `"${label}" type removed.`, icon: 'success', confirmButtonColor: 'var(--primary)' });
      } catch (err) {
        Swal.fire('Error', `Failed to delete: ${err.message}`, 'error');
      }
    }
  };

  const handleEdit = async (typeItem) => {
    // Generate options dynamically
    const optionsHtml = TYPE_COLORS.map(c => 
      `<option value="${c.value}" ${c.value === typeItem.color ? 'selected' : ''}>${c.label}</option>`
    ).join('');

    const isLight = document.documentElement.classList.contains('light-theme');
    const inputBg = isLight ? '#ffffff' : '#1e1f29';
    const inputColor = isLight ? '#1e293b' : '#f8fafc';
    const inputBorder = isLight ? '#cbd5e1' : 'rgba(255,255,255,0.1)';

    const { value: formValues } = await Swal.fire({
      title: 'Edit Organization Type',
      html:
        `<div style="text-align: left; margin-bottom: 15px;">` +
          `<label style="font-weight: 600; font-size: 0.85rem; color: ${isLight ? '#475569' : '#94a3b8'}; display: block; margin-bottom: 6px;">Type Name *</label>` +
          `<input id="swal-type-label" class="swal2-input" style="width: 100%; margin: 0; box-sizing: border-box; background: ${inputBg}; color: ${inputColor}; border: 1px solid ${inputBorder}; height: 42px; border-radius: 6px; padding: 0 10px; font-size: 0.9rem;" value="${typeItem.label}">` +
        `</div>` +
        `<div style="text-align: left;">` +
          `<label style="font-weight: 600; font-size: 0.85rem; color: ${isLight ? '#475569' : '#94a3b8'}; display: block; margin-bottom: 6px;">Badge Color</label>` +
          `<select id="swal-type-color" class="swal2-input" style="width: 100%; margin: 0; box-sizing: border-box; background: ${inputBg}; color: ${inputColor}; border: 1px solid ${inputBorder}; height: 42px; border-radius: 6px; padding: 0 10px; font-size: 0.9rem;">` +
            optionsHtml +
          `</select>` +
        `</div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Changes',
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#6b7280',
      background: isLight ? '#ffffff' : '#11131c',
      color: isLight ? '#1e293b' : '#f8fafc',
      preConfirm: () => {
        const label = document.getElementById('swal-type-label').value.trim();
        const color = document.getElementById('swal-type-color').value;
        if (!label) {
          Swal.showValidationMessage('Please enter a type name');
          return false;
        }
        return { label, color };
      }
    });

    if (formValues) {
      try {
        await api.orgTypes.update(typeItem.id, formValues);
        fetchTypes();
        Swal.fire({
          title: 'Updated!',
          text: `"${formValues.label}" type has been successfully updated.`,
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } catch (err) {
        Swal.fire('Error', `Failed to update type: ${err.message}`, 'error');
      }
    }
  };

  const getColorMeta = (colorVal) => TYPE_COLORS.find(c => c.value === colorVal) || TYPE_COLORS[0];

  return (
    <div className="org-type-master-view">
      {/* Page Header */}
      <div className="page-header mb-6">
        <h1 className="page-title">Organization Type Master</h1>
        <p className="page-subtitle">
          Define and manage the organization types available when registering a new organization or partner.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Add New Type Form */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 className="card-headline mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaPlus style={{ color: 'var(--primary)', fontSize: '0.9rem' }} /> Add New Organization Type
          </h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Type Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="e.g. Diagnostic Centre, Pharmacy, Hospice..."
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Badge Color</label>
                <select className="form-input" value={newColor} onChange={e => setNewColor(e.target.value)}>
                  {TYPE_COLORS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 1.25rem', fontSize: '0.85rem', borderRadius: '6px' }}>
                <FaPlus /> Add Type
              </button>
            </div>
          </form>
        </div>

        {/* Existing Types Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 className="card-headline mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaTags style={{ color: 'var(--primary)', fontSize: '0.9rem' }} /> Registered Organization Types
          </h3>

          {loading ? (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>S.No.</th>
                    <th>Type Name</th>
                    <th>Badge Preview</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center' }}><Skeleton width={20} /></td>
                      <td><Skeleton width={150} height={14} /></td>
                      <td><Skeleton width={90} height={22} borderRadius={6} /></td>
                      <td><Skeleton width={65} height={26} borderRadius={6} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : types.length === 0 ? (
            <p className="text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
              No organization types defined yet. Add your first type above.
            </p>
          ) : (
            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>S.No.</th>
                    <th>Type Name</th>
                    <th>Badge Preview</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((t, i) => {
                    const meta = getColorMeta(t.color);
                    return (
                      <tr key={t.id}>
                        <td style={{ textAlign: 'center', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {i + 1}
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {t.label}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.22rem 0.6rem',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: meta.bg,
                            color: meta.color,
                            border: `1px solid ${meta.border}`
                          }}>
                            {t.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              className="btn-action-outline btn-edit-outline"
                              onClick={() => handleEdit(t)}
                              title="Edit Type"
                            >
                              <FaEdit style={{ fontSize: '0.85rem' }} /> Edit
                            </button>
                            <button
                              className="btn-action-outline btn-delete-outline"
                              onClick={() => handleDelete(t.id, t.label)}
                              disabled={t.isSystem}
                              style={t.isSystem ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                              title={t.isSystem ? "System defaults cannot be deleted" : "Delete Type"}
                            >
                              <FaTrash style={{ fontSize: '0.85rem' }} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
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

        .btn-delete-outline:hover:not(:disabled) {
          background: var(--danger);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default OrgTypeMaster;
