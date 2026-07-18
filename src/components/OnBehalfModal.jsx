/* OnBehalfModal - Multi-step Admin Creation Wizard */

import React, { useState } from 'react';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaUser, FaTint, FaCheck, FaTimes } from 'react-icons/fa';
import indiaFlag from '../assets/icons/india.png';

const OnBehalfModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [actionType, setActionType] = useState('donor'); // 'donor' or 'requestor'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [idFile, setIdFile] = useState(null);

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Form States
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    bloodGroup: 'O+',
    currentAddress: '',
    permanentAddress: '',
    district: '',
    area: '',
    // Donor specific fields
    weight: '',
    lastDonationDate: '',
    availability: 'Active',
    preferredLocations: '',
    associatedWith: 'Individual',
    emergencyContactName: '',
    emergencyContactPhone: '',
    documentName: ''
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdFile(file);
      setUserForm(prev => ({ ...prev, documentName: file.name }));
    }
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const sanitized = value.replace(/[^0-9]/g, '');
      setUserForm({ ...userForm, phone: sanitized });
    } else {
      setUserForm({ ...userForm, [name]: value });
    }
  };

  const handleSendOtp = () => {
    setError(null);
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(userForm.phone)) {
      setError('Please enter a valid 10-digit phone number first.');
      return;
    }
    setOtpSent(true);
    setOtpCode('');
    Swal.fire({
      title: 'OTP Sent!',
      text: 'A 6-digit One-Time Password has been dispatched to +91 ' + userForm.phone + '. (Use mock code 123456)',
      icon: 'info',
      confirmButtonColor: 'var(--primary)'
    });
  };

  const handleVerifyOtp = () => {
    setError(null);
    if (otpCode === '123456') {
      setOtpVerified(true);
      Swal.fire({
        title: 'Verified!',
        text: 'Mobile number has been successfully verified via OTP.',
        icon: 'success',
        confirmButtonColor: 'var(--primary)'
      });
    } else {
      setError('Invalid OTP code. Please enter 123456 to bypass simulation.');
    }
  };

  const nextStep = () => {
    setError(null);
    if (step === 2) {
      if (!otpVerified) {
        setError('Please verify the mobile number via OTP before proceeding.');
        return;
      }
    } else if (step === 3) {
      if (!userForm.name || !userForm.email || !userForm.gender || !userForm.dob || !userForm.currentAddress || !userForm.permanentAddress || !userForm.district || !userForm.area) {
        setError('Please fill in all personal details and addresses.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userForm.email)) {
        setError('Please enter a valid email address.');
        return;
      }
      const today = new Date();
      const dobDate = new Date(userForm.dob);
      if (dobDate > today) {
        setError('Date of Birth cannot be a future date.');
        return;
      }
      if (actionType === 'donor') {
        let age = today.getFullYear() - dobDate.getFullYear();
        const m = today.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
          age--;
        }
        if (age < 18) {
          setError('Donor must be at least 18 years old to donate blood.');
          return;
        }
        if (age > 100) {
          setError('Please enter a valid Date of Birth.');
          return;
        }
      }
    } else if (step === 4) {
      if (actionType === 'donor') {
        if (!userForm.weight || !userForm.preferredLocations || !userForm.emergencyContactName || !userForm.emergencyContactPhone) {
          setError('Please fill in all donor safety and contact credentials.');
          return;
        }
        const emerPhoneRegex = /^(?:\+91|91)?\d{10}$/;
        if (!emerPhoneRegex.test(userForm.emergencyContactPhone.replace(/[\s\-()]/g, ''))) {
          setError('Please enter a valid 10-digit emergency contact phone.');
          return;
        }
      } else {
        if (!idFile) {
          setError('Please upload a verification document (e.g. Aadhaar or ID proof).');
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
    setActionType('donor');
    setUserForm({
      name: '',
      email: '',
      phone: '',
      gender: 'Male',
      dob: '',
      bloodGroup: 'O+',
      currentAddress: '',
      permanentAddress: '',
      district: '',
      area: '',
      weight: '',
      lastDonationDate: '',
      availability: 'Active',
      preferredLocations: '',
      associatedWith: 'Individual',
      emergencyContactName: '',
      emergencyContactPhone: '',
      documentName: ''
    });
    setError(null);
    setLoading(false);
    setIdFile(null);
    setOtpSent(false);
    setOtpCode('');
    setOtpVerified(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: userForm.name,
        email: userForm.email,
        phone: `+91 ${userForm.phone}`,
        role: actionType === 'donor' ? 'Donor' : 'Seeker',
        gender: userForm.gender,
        dob: userForm.dob,
        bloodGroup: userForm.bloodGroup,
        currentAddress: userForm.currentAddress,
        permanentAddress: userForm.permanentAddress,
        district: userForm.district,
        area: userForm.area,
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        ...(actionType === 'donor' ? {
          weight: userForm.weight,
          lastDonationDate: userForm.lastDonationDate || 'Never',
          availability: userForm.availability,
          preferredLocations: userForm.preferredLocations,
          associatedWith: userForm.associatedWith,
          emergencyContact: `${userForm.emergencyContactName} (${userForm.emergencyContactPhone})`
        } : {
          documentName: idFile ? idFile.name : ''
        })
      };
      await api.users.createOnBehalf(payload);
      Swal.fire({
        title: 'User Profile Created!',
        text: `${actionType === 'donor' ? 'Blood Donor' : 'Blood Requestor'} profile has been registered and initialized in the database.`,
        icon: 'success',
        confirmButtonColor: 'var(--primary)'
      });
      setLoading(false);
      setStep(6); // Success screen (step 6)
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">On-Behalf Creation</h2>
          <button className="modal-close-btn" onClick={handleClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes /></button>
        </div>

        {/* Step Indicators */}
        <div className="modal-steps-indicator" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px' }}>
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`} title="Choose Profile">1</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`} title="Verification">2</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`} title="Personal Info">3</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 4 ? 'active' : ''}`} title="Eligibility Details">4</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 5 ? 'active' : ''}`} title="Review Details">5</div>
          <div className="step-line"></div>
          <div className={`step-dot ${step >= 6 ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Result">
            <FaCheck style={{ fontSize: '0.8rem' }} />
          </div>
        </div>

        <div className="modal-body">
          {error && <div className="alert-box alert-danger">{error}</div>}

          {/* STEP 1: Choose Action Type */}
          {step === 1 && (
            <div className="step-content animate-fade">
              <p className="step-desc">Select the type of admin action you want to initiate on behalf of a user.</p>

              <div className="action-cards-grid">
                 <div
                  className={`action-card ${actionType === 'donor' ? 'selected' : ''}`}
                  onClick={() => setActionType('donor')}
                >
                  <div className="action-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUser /></div>
                  <div className="action-card-info">
                    <h4>CREATE BLOOD DONOR</h4>
                    <p>Register a new blood donor directly into the system database.</p>
                  </div>
                </div>

                <div
                  className={`action-card ${actionType === 'requestor' ? 'selected' : ''}`}
                  onClick={() => setActionType('requestor')}
                >
                  <div className="action-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUser style={{ color: 'var(--primary)' }} /></div>
                  <div className="action-card-info">
                    <h4>CREATE BLOOD REQUESTOR</h4>
                    <p>Register a new verified blood requestor (seeker) in the system.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Verification */}
          {step === 2 && (
            <div className="step-content animate-fade">
              <h3 className="form-subheading" style={{ marginBottom: '1rem' }}>Mobile & OTP Verification</h3>
              
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="phone-input-group">
                  <div className="phone-prefix-box">
                    <img src={indiaFlag} alt="IN" style={{ width: '18px', height: '12px', borderRadius: '2px', objectFit: 'cover' }} />
                    <span>+91</span>
                  </div>
                  <input 
                    type="tel" 
                    name="phone" 
                    className="phone-input-field" 
                    value={userForm.phone} 
                    onChange={handleUserChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    disabled={otpVerified}
                    required
                  />
                </div>
                {!otpSent && !otpVerified && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleSendOtp}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', marginTop: '1rem' }}
                  >
                    Send OTP Verification Code
                  </button>
                )}
              </div>

              {otpSent && !otpVerified && (
                <div className="form-group animate-fade" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Enter 6-Digit OTP Code</label>
                  <input 
                    type="text" 
                    placeholder="Enter 123456" 
                    className="form-control"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ marginBottom: '1rem' }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleVerifyOtp}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                  >
                    Verify OTP
                  </button>
                </div>
              )}

              {otpVerified && (
                <div className="alert-box alert-success text-center" style={{ color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '6px', marginTop: '1rem' }}>
                  <strong>✓ Phone number verified successfully!</strong> Please proceed to the next step.
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Personal & Address Details */}
          {step === 3 && (
            <div className="step-content animate-fade">
              <h3 className="form-subheading" style={{ marginBottom: '1rem' }}>Personal & Address Details</h3>
              
              <div className="form-row flex-gap" style={{ marginBottom: '1rem' }}>
                <div className="form-group flex-1">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    className="form-control" 
                    value={userForm.name} 
                    onChange={handleUserChange}
                    placeholder="As per official ID"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    className="form-control" 
                    value={userForm.email} 
                    onChange={handleUserChange}
                    placeholder="e.g. name@domain.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row flex-gap" style={{ marginBottom: '1rem' }}>
                <div className="form-group flex-1">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-control" value={userForm.gender} onChange={handleUserChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Date of Birth</label>
                  <input 
                    type="date" 
                    name="dob" 
                    max={new Date().toISOString().split('T')[0]}
                    className="form-control" 
                    value={userForm.dob} 
                    onChange={handleUserChange}
                    required
                  />
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

              <div className="form-row flex-gap" style={{ marginBottom: '1rem' }}>
                <div className="form-group flex-1">
                  <label className="form-label">Current Address</label>
                  <input 
                    type="text" 
                    name="currentAddress" 
                    className="form-control" 
                    value={userForm.currentAddress} 
                    onChange={handleUserChange}
                    placeholder="Present residence location"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Permanent Address</label>
                  <input 
                    type="text" 
                    name="permanentAddress" 
                    className="form-control" 
                    value={userForm.permanentAddress} 
                    onChange={handleUserChange}
                    placeholder="Permanent family residence"
                    required
                  />
                </div>
              </div>

              <div className="form-row flex-gap" style={{ marginBottom: '1rem' }}>
                <div className="form-group flex-1">
                  <label className="form-label">District</label>
                  <input 
                    type="text" 
                    name="district" 
                    className="form-control" 
                    value={userForm.district} 
                    onChange={handleUserChange}
                    placeholder="Administrative district"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Area</label>
                  <input 
                    type="text" 
                    name="area" 
                    className="form-control" 
                    value={userForm.area} 
                    onChange={handleUserChange}
                    placeholder="Local sector / neighborhood"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Role Setup & Eligibility */}
          {step === 4 && (
            <div className="step-content animate-fade">
              {actionType === 'donor' ? (
                <div>
                  <h3 className="form-subheading" style={{ marginBottom: '1rem' }}>Become Blood Donor - Eligibility Details</h3>
                  
                  <div className="form-row flex-gap" style={{ marginBottom: '1rem' }}>
                    <div className="form-group flex-1">
                      <label className="form-label">Weight (kg)</label>
                      <input 
                        type="number" 
                        name="weight" 
                        className="form-control" 
                        min="45"
                        max="150"
                        value={userForm.weight} 
                        onChange={handleUserChange}
                        placeholder="Must be >= 45 kg"
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Last Donation Date</label>
                      <input 
                        type="date" 
                        name="lastDonationDate" 
                        className="form-control" 
                        value={userForm.lastDonationDate} 
                        onChange={handleUserChange}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Donor Availability Status</label>
                      <select name="availability" className="form-control" value={userForm.availability} onChange={handleUserChange}>
                        <option value="Active">Active Donor</option>
                        <option value="Inactive">Temporarily Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row flex-gap" style={{ marginBottom: '1rem' }}>
                    <div className="form-group flex-1">
                      <label className="form-label">Preferred Donation Locations</label>
                      <input 
                        type="text" 
                        name="preferredLocations" 
                        className="form-control" 
                        value={userForm.preferredLocations} 
                        onChange={handleUserChange}
                        placeholder="e.g. GMCH, Baruah Blood Bank"
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Associated With</label>
                      <select name="associatedWith" className="form-control" value={userForm.associatedWith} onChange={handleUserChange}>
                        <option value="Individual">Individual</option>
                        <option value="Educational Institution">Educational Institution</option>
                        <option value="NGO">NGO</option>
                        <option value="Hospital">Hospital</option>
                        <option value="Blood Bank">Blood Bank</option>
                        <option value="Corporate">Corporate</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row flex-gap" style={{ marginBottom: '1rem' }}>
                    <div className="form-group flex-1">
                      <label className="form-label">Emergency Contact Name</label>
                      <input 
                        type="text" 
                        name="emergencyContactName" 
                        className="form-control" 
                        value={userForm.emergencyContactName} 
                        onChange={handleUserChange}
                        placeholder="Contact person's name"
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Emergency Contact Phone</label>
                      <input 
                        type="tel" 
                        name="emergencyContactPhone" 
                        className="form-control" 
                        value={userForm.emergencyContactPhone} 
                        onChange={handleUserChange}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="form-subheading" style={{ marginBottom: '1rem' }}>Become Requestor - Upload Verification Document</h3>
                  
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Verification Document (e.g. Aadhaar Card, ID Proof)</label>
                    <div style={{
                      border: '2px dashed var(--border)',
                      borderRadius: '8px',
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      background: 'rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s ease'
                    }}>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        required
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {idFile ? idFile.name : 'Upload Aadhaar or ID Proof Document'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Click to select or drag PDF, PNG, JPG file (Max 5MB)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Confirmation Summary */}
          {step === 5 && (
            <div className="step-content animate-fade text-center">
              <h3 className="summary-title">Review Details Before Saving</h3>

              <div className="summary-box glass-card mt-4" style={{ padding: '1rem', maxHeight: '320px', overflowY: 'auto' }}>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.85rem' }}>General Credentials</h4>
                  </div>
                  <p><strong>Action:</strong> Register {actionType === 'donor' ? 'Blood Donor' : 'Blood Requestor'}</p>
                  <p><strong>Full Name:</strong> {userForm.name}</p>
                  <p><strong>Email:</strong> {userForm.email}</p>
                  <p><strong>Phone:</strong> +91 {userForm.phone} (Verified via OTP)</p>
                  <p><strong>Gender:</strong> {userForm.gender}</p>
                  <p><strong>Date of Birth:</strong> {userForm.dob}</p>
                  <p><strong>Blood Group:</strong> <span className="badge badge-approved">{userForm.bloodGroup}</span></p>

                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem', margin: '0.25rem 0' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.85rem' }}>Address & Region</h4>
                  </div>
                  <p><strong>Current Address:</strong> {userForm.currentAddress}</p>
                  <p><strong>Permanent Address:</strong> {userForm.permanentAddress}</p>
                  <p><strong>District:</strong> {userForm.district}</p>
                  <p><strong>Area:</strong> {userForm.area}</p>

                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem', margin: '0.25rem 0' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.85rem' }}>Role Specifics</h4>
                  </div>
                  {actionType === 'donor' ? (
                    <>
                      <p><strong>Weight:</strong> {userForm.weight} kg</p>
                      <p><strong>Last Donation:</strong> {userForm.lastDonationDate || 'Never'}</p>
                      <p><strong>Availability:</strong> {userForm.availability}</p>
                      <p><strong>Preferred Location:</strong> {userForm.preferredLocations}</p>
                      <p><strong>Association:</strong> {userForm.associatedWith}</p>
                      <p><strong>Emergency Contact:</strong> {userForm.emergencyContactName} ({userForm.emergencyContactPhone})</p>
                    </>
                  ) : (
                    <p><strong>Verification Doc:</strong> <span style={{ color: 'var(--success)', fontWeight: 600 }}>{idFile ? idFile.name : 'None'}</span></p>
                  )}
                </div>
              </div>

              <p className="mt-4" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                By clicking Submit, this verified profile will be securely saved into the system database.
              </p>
            </div>
          )}

          {/* STEP 6: Success Screen */}
          {step === 6 && (
            <div className="step-content animate-fade text-center py-6">
              <div className="success-icon-animation" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheck /></div>
              <h3 className="success-headline mt-4">User Profile Provisioned</h3>
              <p className="success-detail mt-2" style={{ color: 'var(--text-secondary)' }}>
                The verified {actionType === 'donor' ? 'blood donor' : 'blood requestor'} account has been successfully provisioned in the database.
              </p>
            </div>
          )}
        </div>

        {/* Modal Buttons Footer */}
        <div className="modal-footer">
          {step < 6 && (
            <button className="btn btn-secondary" onClick={step === 1 ? handleClose : prevStep}>
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
          )}
          {step < 5 && (
            <button 
              className="btn btn-primary" 
              onClick={nextStep}
              disabled={step === 2 && !otpVerified}
            >
              Next Step
            </button>
          )}
          {step === 5 && (
            <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Confirm & Save'}
            </button>
          )}
          {step === 6 && (
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
          background: rgba(255, 255, 255, 0.02) !important;
          padding: 1.25rem;
          font-size: 0.85rem;
          line-height: 1.6;
          border: 1px solid var(--border) !important;
          border-radius: 8px;
        }

        html.light-theme .summary-box {
          background: #ffffff !important;
          border: 1px solid var(--border) !important;
          box-shadow: var(--shadow-sm);
        }

        .summary-box p {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-size: 0.85rem;
        }

        .summary-box p strong {
          color: var(--text-secondary);
          display: inline-block;
          width: 140px;
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
          padding: 0.55rem 0.85rem;
          border-radius: 6px;
          font-size: 0.78rem;
          margin-bottom: 1.25rem;
          font-weight: 500;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .alert-danger {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #ef4444 !important;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
        }

        html.light-theme .alert-danger {
          background: #fff5f5 !important;
          color: #c53030 !important;
          border: 1px solid #feb2b2 !important;
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
