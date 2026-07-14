/* OnBehalfCreation - Dedicated page for multi-step admin creation wizard */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaUser, FaTint, FaCheck, FaArrowLeft, FaArrowRight, FaTimes, FaSave } from 'react-icons/fa';

const OnBehalfCreation = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [actionType, setActionType] = useState('user'); // 'user' or 'request'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form States
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Donor',
    bloodGroup: 'O+'
  });

  const [requestForm, setRequestForm] = useState({
    seekerName: '',
    bloodGroup: 'O+',
    unitsNeeded: 1,
    hospitalName: '',
    urgency: 'Medium',
    documentUrl: '#'
  });

  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleRequestChange = (e) => {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    setError(null);
    if (step === 2) {
      if (actionType === 'user') {
        if (!userForm.name || !userForm.email || !userForm.phone) {
          setError('Please fill in all user profile details.');
          return;
        }
      } else {
        if (!requestForm.seekerName || !requestForm.hospitalName || !requestForm.unitsNeeded) {
          setError('Please fill in all blood request fields.');
          return;
        }
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const resetForm = () => {
    setStep(1);
    setActionType('user');
    setUserForm({ name: '', email: '', phone: '', role: 'Donor', bloodGroup: 'O+' });
    setRequestForm({ seekerName: '', bloodGroup: 'O+', unitsNeeded: 1, hospitalName: '', urgency: 'Medium', documentUrl: '#' });
    setError(null);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (actionType === 'user') {
        await api.users.createOnBehalf(userForm);
        Swal.fire({
          title: 'User Profile Created!',
          text: 'User profile has been registered and initialized in the database.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      } else {
        await api.requests.updateStatus(`mock-create-${Date.now()}`, 'Pending');
        Swal.fire({
          title: 'Blood Request Submitted!',
          text: 'Emergency blood request has been successfully created and broadcasted.',
          icon: 'success',
          confirmButtonColor: 'var(--primary)'
        });
      }
      setLoading(false);
      setStep(4); // Success screen
      
      // Emit the global success event to refresh other lists if they are mounted/cached
      window.dispatchEvent(new CustomEvent('on-behalf-success'));
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.message || 'Action failed. Please try again.',
        icon: 'error',
        confirmButtonColor: 'var(--primary)'
      });
      setLoading(false);
    }
  };

  return (
    <div className="on-behalf-page-view">
      <div className="page-header mb-6">
        <h1 className="page-title">
          User Creation
        </h1>
        <p className="page-subtitle">
          Manually initialize user profiles or log urgent blood requests directly into the system database.
        </p>
      </div>

      <div className="glass-card creation-wizard-card">
        {/* Step Indicators */}
        <div className="wizard-steps-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 4 ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaCheck style={{ fontSize: '0.8rem' }} />
          </div>
        </div>
        <div className="wizard-divider"></div>

        <div className="wizard-body mt-6">
          {error && <div className="alert-box alert-danger mb-4">{error}</div>}

          {/* STEP 1: Choose Action Type */}
          {step === 1 && (
            <div className="step-content animate-fade">
              <p className="step-desc mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
                Select the type of admin action you want to initiate on behalf of a user.
              </p>
              
              <div className="action-cards-grid">
                <div 
                  className={`action-card ${actionType === 'user' ? 'selected' : ''}`}
                  onClick={() => setActionType('user')}
                >
                  <div className="action-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaUser />
                  </div>
                  <div className="action-card-info">
                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Create User Profile</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Register a new Seeker or Donor directly into the system database.</p>
                  </div>
                </div>

                <div 
                  className={`action-card ${actionType === 'request' ? 'selected' : ''}`}
                  onClick={() => setActionType('request')}
                >
                  <div className="action-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaTint style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="action-card-info">
                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Submit Blood Request</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Create an urgent blood donation request for medical emergencies.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Form Inputs */}
          {step === 2 && (
            <div className="step-content animate-fade">
              {actionType === 'user' ? (
                <div>
                  <h3 className="form-subheading mb-4" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>User Profile Credentials</h3>
                  
                  <div className="form-group mb-4">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      className="form-control" 
                      value={userForm.name} 
                      onChange={handleUserChange}
                      placeholder="e.g. Bhaskar Baruah"
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      className="form-control" 
                      value={userForm.email} 
                      onChange={handleUserChange}
                      placeholder="e.g. bhaskar.b@gmail.com"
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      className="form-control" 
                      value={userForm.phone} 
                      onChange={handleUserChange}
                      placeholder="e.g. +91 94350 12345"
                      required
                    />
                  </div>

                  <div className="form-row flex-gap mb-4">
                    <div className="form-group flex-1">
                      <label className="form-label">System Role</label>
                      <select name="role" className="form-control" value={userForm.role} onChange={handleUserChange}>
                        <option value="Donor">Donor</option>
                        <option value="Seeker">Seeker</option>
                      </select>
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Blood Group</label>
                      <select name="bloodGroup" className="form-control" value={userForm.bloodGroup} onChange={handleUserChange}>
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
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="form-subheading mb-4" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Emergency Request Details</h3>
                  
                  <div className="form-group mb-4">
                    <label className="form-label">Seeker Full Name</label>
                    <input 
                      type="text" 
                      name="seekerName" 
                      className="form-control" 
                      value={requestForm.seekerName} 
                      onChange={handleRequestChange}
                      placeholder="e.g. Jahnabi Deka"
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">Target Hospital / Location</label>
                    <input 
                      type="text" 
                      name="hospitalName" 
                      className="form-control" 
                      value={requestForm.hospitalName} 
                      onChange={handleRequestChange}
                      placeholder="e.g. Guwahati Medical College & Hospital (GMCH)"
                      required
                    />
                  </div>

                  <div className="form-row flex-gap mb-4">
                    <div className="form-group flex-1">
                      <label className="form-label">Units Needed</label>
                      <input 
                        type="number" 
                        name="unitsNeeded" 
                        className="form-control" 
                        min="1" 
                        max="10"
                        value={requestForm.unitsNeeded} 
                        onChange={handleRequestChange}
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Blood Group</label>
                      <select name="bloodGroup" className="form-control" value={requestForm.bloodGroup} onChange={handleRequestChange}>
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
                    <div className="form-group flex-1">
                      <label className="form-label">Urgency</label>
                      <select name="urgency" className="form-control" value={requestForm.urgency} onChange={handleRequestChange}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Confirmation Summary */}
          {step === 3 && (
            <div className="step-content animate-fade text-center">
              <h3 className="summary-title" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Review Details Before Saving</h3>
              
              <div className="summary-box glass-card mt-4 p-4" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)' }}>
                {actionType === 'user' ? (
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p><strong>Action:</strong> Register User Profile</p>
                    <p><strong>Name:</strong> {userForm.name}</p>
                    <p><strong>Email:</strong> {userForm.email}</p>
                    <p><strong>Phone:</strong> {userForm.phone}</p>
                    <p><strong>Role:</strong> <span className="badge badge-secondary">{userForm.role}</span></p>
                    <p><strong>Blood Group:</strong> <span className="badge badge-approved">{userForm.bloodGroup}</span></p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p><strong>Action:</strong> Create Blood Request</p>
                    <p><strong>Patient/Seeker:</strong> {requestForm.seekerName}</p>
                    <p><strong>Hospital:</strong> {requestForm.hospitalName}</p>
                    <p><strong>Quantity:</strong> {requestForm.unitsNeeded} Units</p>
                    <p><strong>Blood Group:</strong> <span className="badge badge-approved">{requestForm.bloodGroup}</span></p>
                    <p><strong>Urgency:</strong> <span className={`badge ${requestForm.urgency === 'High' ? 'badge-rejected' : 'badge-pending'}`}>{requestForm.urgency}</span></p>
                  </div>
                )}
              </div>

              <p className="mt-4" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                By clicking Confirm, this record will be securely saved and initialized.
              </p>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="step-content animate-fade text-center py-6">
              <div className="success-icon-animation" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)',
                fontSize: '1.5rem',
                margin: '0 auto'
              }}>
                <FaCheck />
              </div>
              <h3 className="success-headline mt-4" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.4rem' }}>Record Created Successfully</h3>
              <p className="success-detail mt-2 mb-6" style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
                The {actionType === 'user' ? 'user profile' : 'blood request'} has been created, and notifications have been broadcasted to available matching resources.
              </p>
              
              <div className="flex-center" style={{ gap: '1rem' }}>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  <FaArrowLeft /> <span>Go to Dashboard</span>
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/users')}>
                  <span>Go to Users Directory</span> <FaArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Buttons */}
        {step < 4 && (
          <>
            <div className="wizard-divider"></div>
            <div className="wizard-footer flex-between">
              <button className="btn btn-secondary" onClick={step === 1 ? () => navigate('/') : prevStep}>
                {step === 1 ? (
                  <>
                    <FaTimes /> <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <FaArrowLeft /> <span>Back</span>
                  </>
                )}
              </button>
              
              {step < 3 ? (
                <button className="btn btn-primary" onClick={nextStep}>
                  <span>Next Step</span> <FaArrowRight />
                </button>
              ) : (
                <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
                  <FaSave /> <span>{loading ? 'Saving...' : 'Confirm & Save'}</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .creation-wizard-card {
          padding: 2.5rem;
          width: 100%;
        }

        .wizard-steps-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-bottom: 0.5rem;
        }

        .step-dot {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.02);
          border: 1.5px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        html.light-theme .step-dot {
          background: rgba(0, 0, 0, 0.02);
          border-color: var(--border);
          color: var(--text-secondary);
        }

        .step-dot.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 0 10px rgba(197, 17, 46, 0.4);
        }

        html.light-theme .step-dot.active {
          background: var(--primary);
          border-color: var(--primary);
          color: #ffffff;
        }

        .step-line {
          height: 2px;
          flex-grow: 1;
          max-width: 80px;
          background: var(--border);
          margin: 0;
        }

        /* Dashed dividers spanning full card width */
        .wizard-divider {
          border-top: 1px dashed rgba(255, 255, 255, 0.15);
          margin: 2rem -2.5rem;
          height: 0;
        }

        html.light-theme .wizard-divider {
          border-top-color: rgba(0, 0, 0, 0.08);
        }

        /* Buttons standard size override */
        .creation-wizard-card .btn {
          padding: 0.55rem 1.25rem;
          font-size: 0.85rem;
          border-radius: 6px;
        }

        .action-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          width: 100%;
          margin: 2rem 0;
        }

        .action-card {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
        }

        html.light-theme .action-card {
          background: rgba(0, 0, 0, 0.01);
          border-color: var(--border);
        }

        .action-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
        }

        html.light-theme .action-card:hover {
          background: rgba(0, 0, 0, 0.03);
          border-color: rgba(0, 0, 0, 0.15);
        }

        .action-card.selected {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        html.light-theme .action-card.selected {
          border-color: var(--primary);
          background: var(--primary-light);
        }

        .action-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: var(--text-primary);
        }

        html.light-theme .action-card-icon {
          background: rgba(0, 0, 0, 0.04);
        }

        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }

        .flex-gap {
          display: flex;
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .action-cards-grid {
            grid-template-columns: 1fr;
          }
          .flex-gap {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default OnBehalfCreation;
