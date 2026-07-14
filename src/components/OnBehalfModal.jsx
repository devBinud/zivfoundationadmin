/* OnBehalfModal - Multi-step Admin Creation Wizard */

import React, { useState } from 'react';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaUser, FaTint, FaCheck, FaTimes } from 'react-icons/fa';

const OnBehalfModal = ({ isOpen, onClose, onSuccess }) => {
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

  if (!isOpen) return null;

  const handleUserChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleRequestChange = (e) => {
    setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    setError(null);
    if (step === 2) {
      // Validate forms
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

  const handleClose = () => {
    resetForm();
    onClose();
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
        // Mock a request submission on behalf of someone
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
      if (onSuccess) onSuccess();
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">On-Behalf Creation</h2>
          <button className="modal-close-btn" onClick={handleClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes /></button>
        </div>

        {/* Step Indicators */}
        <div className="modal-steps-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 4 ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheck style={{ fontSize: '0.8rem' }} /></div>
        </div>

        <div className="modal-body">
          {error && <div className="alert-box alert-danger">{error}</div>}

          {/* STEP 1: Choose Action Type */}
          {step === 1 && (
            <div className="step-content animate-fade">
              <p className="step-desc">Select the type of admin action you want to initiate on behalf of a user.</p>

              <div className="action-cards-grid">
                <div
                  className={`action-card ${actionType === 'user' ? 'selected' : ''}`}
                  onClick={() => setActionType('user')}
                >
                  <div className="action-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUser /></div>
                  <div className="action-card-info">
                    <h4>Create User Profile</h4>
                    <p>Register a new Seeker or Donor directly into the system database.</p>
                  </div>
                </div>

                <div
                  className={`action-card ${actionType === 'request' ? 'selected' : ''}`}
                  onClick={() => setActionType('request')}
                >
                  <div className="action-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTint style={{ color: 'var(--primary)' }} /></div>
                  <div className="action-card-info">
                    <h4>Submit Blood Request</h4>
                    <p>Create an urgent blood donation request for medical emergencies.</p>
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
                  <h3 className="form-subheading">User Profile Credentials</h3>
                  <div className="form-group">
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
                  <div className="form-group">
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
                  <div className="form-group">
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
                  <div className="form-row">
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
                  <h3 className="form-subheading">Emergency Request Details</h3>
                  <div className="form-group">
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
                  <div className="form-group">
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
                  <div className="form-row">
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
              <h3 className="summary-title">Review Details Before Saving</h3>

              <div className="summary-box glass-card mt-4">
                {actionType === 'user' ? (
                  <div style={{ textAlign: 'left' }}>
                    <p><strong>Action:</strong> Register User Profile</p>
                    <p><strong>Name:</strong> {userForm.name}</p>
                    <p><strong>Email:</strong> {userForm.email}</p>
                    <p><strong>Phone:</strong> {userForm.phone}</p>
                    <p><strong>Role:</strong> <span className="badge badge-secondary">{userForm.role}</span></p>
                    <p><strong>Blood Group:</strong> <span className="badge badge-approved">{userForm.bloodGroup}</span></p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'left' }}>
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
                By clicking Submit, this record will be securely appended to the database and initialized.
              </p>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="step-content animate-fade text-center py-6">
              <div className="success-icon-animation" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheck /></div>
              <h3 className="success-headline mt-4">Record Created Successfully</h3>
              <p className="success-detail mt-2" style={{ color: 'var(--text-secondary)' }}>
                The {actionType === 'user' ? 'user profile' : 'blood request'} has been created, and notifications have been broadcasted to available matching resources.
              </p>
            </div>
          )}
        </div>

        {/* Modal Buttons Footer */}
        <div className="modal-footer">
          {step < 4 && (
            <button className="btn btn-secondary" onClick={step === 1 ? handleClose : prevStep}>
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
          )}
          {step < 3 && (
            <button className="btn btn-primary" onClick={nextStep}>
              Next Step
            </button>
          )}
          {step === 3 && (
            <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm & Save'}
            </button>
          )}
          {step === 4 && (
            <button className="btn btn-primary" onClick={handleClose}>
              Close Portal
            </button>
          )}
        </div>
      </div>

      <style>{`
        .modal-steps-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem 1.5rem 0.5rem;
        }

        .step-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1.5px solid var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .step-dot.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 0 10px rgba(197, 17, 46, 0.4);
        }

        .step-line {
          height: 2px;
          flex-grow: 1;
          max-width: 60px;
          background: var(--border);
          margin: 0 8px;
        }

        .step-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .action-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .action-card.selected {
          background: var(--primary-light);
          border-color: var(--primary);
        }

        .action-card-icon {
          font-size: 2.25rem;
          background: rgba(0, 0, 0, 0.2);
          width: 55px;
          height: 55px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-card-info h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.2rem;
        }

        .action-card-info p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .form-subheading {
          font-family: var(--font-heading);
          font-size: 1.05rem;
          color: #ffffff;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.5rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .flex-1 {
          flex: 1;
        }

        .summary-box {
          background: rgba(0, 0, 0, 0.25);
          padding: 1.25rem;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .summary-box p {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .summary-box p strong {
          color: var(--text-secondary);
          display: inline-block;
          width: 140px;
        }

        .success-icon-animation {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          font-size: 2.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          border: 2.5px solid var(--success);
          animation: pulseSuccess 2s infinite;
        }

        .alert-box {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .alert-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        @keyframes pulseSuccess {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .animate-fade {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OnBehalfModal;
