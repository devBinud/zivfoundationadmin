/* OnBehalfCreation - Dedicated page for multi-step admin creation wizard */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { FaUser, FaTint, FaCheck, FaArrowLeft, FaArrowRight, FaTimes, FaSave } from 'react-icons/fa';
import indiaFlag from '../assets/icons/india.png';

const locationData = {
  "Assam": [
    "Kamrup Metropolitan", "Kamrup", "Jorhat", "Dibrugarh", "Silchar", "Nagaon",
    "Tezpur", "Sivasagar", "Tinsukia", "Bongaigaon", "Barpeta", "Dhubri",
    "Goalpara", "Karimganj", "Lakhimpur", "Dhemaji", "Nalbari", "Darrang"
  ]
};

const OnBehalfCreation = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [actionType, setActionType] = useState('donor'); // 'donor' or 'requestor'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [districtOpen, setDistrictOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const districtTriggerRef = React.useRef(null);
  const districtPortalRef = React.useRef(null);

  // Close district dropdown on outside click (covers both trigger & portal)
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      const inTrigger = districtTriggerRef.current && districtTriggerRef.current.contains(e.target);
      const inPortal = districtPortalRef.current && districtPortalRef.current.contains(e.target);
      if (!inTrigger && !inPortal) {
        setDistrictOpen(false);
        setDistrictSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openDistrict = () => {
    if (districtTriggerRef.current) {
      const rect = districtTriggerRef.current.getBoundingClientRect();
      const isLight = document.documentElement.classList.contains('light-theme');
      setDropdownPos({
        // Convert viewport coords → document coords by adding scroll offset
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
        bg: isLight ? '#ffffff' : '#1a1c24',
        borderColor: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)',
        shadow: isLight
          ? '0 10px 40px rgba(0,0,0,0.14)'
          : '0 10px 40px rgba(0,0,0,0.55)',
        searchBg: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
        textColor: isLight ? '#111827' : '#f3f4f6',
        mutedColor: isLight ? '#6b7280' : '#6b7280',
      });
    }
    setDistrictOpen(o => !o);
    setDistrictSearch('');
  };

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
    state: 'Assam',
    district: 'Kamrup Metropolitan',
    area: '',
    pincode: '',
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
      setUserForm(prev => ({ ...prev, phone: sanitized }));
    } else if (name === 'currentAddress' && sameAsCurrentAddress) {
      // Keep permanentAddress in sync when checkbox is active
      setUserForm(prev => ({ ...prev, currentAddress: value, permanentAddress: value }));
    } else {
      setUserForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSameAddress = (checked) => {
    setSameAsCurrentAddress(checked);
    if (checked) {
      setUserForm(prev => ({ ...prev, permanentAddress: prev.currentAddress }));
    } else {
      setUserForm(prev => ({ ...prev, permanentAddress: '' }));
    }
  };

  const handleSendOtp = () => {
    setError(null);
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(userForm.phone)) {
      setError('Please enter a valid 10-digit phone number first.');
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    setOtpSent(true);
    setOtpCode('');
  };

  const handleVerifyOtp = () => {
    setError(null);
    if (otpCode === '123456') {
      setOtpVerified(true);
      setShowValidation(false);
      setStep(3);
    } else {
      setError('Invalid OTP code. Please enter 123456 to bypass simulation.');
      setShowValidation(true);
    }
  };

  const nextStep = () => {
    setError(null);
    if (step === 2) {
      // Step 2: Verification
      if (!otpVerified) {
        setError('Please verify the mobile number via OTP before proceeding.');
        setShowValidation(true);
        return;
      }
    } else if (step === 3) {
      // Step 3: Personal Details & Address
      if (!userForm.name || !userForm.email || !userForm.gender || !userForm.dob || !userForm.currentAddress || !userForm.permanentAddress || !userForm.state || !userForm.district || !userForm.area || !userForm.pincode) {
        setError('Please fill in all personal details and address credentials.');
        setShowValidation(true);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userForm.email)) {
        setError('Please enter a valid email address.');
        setShowValidation(true);
        return;
      }
      const pincodeRegex = /^\d{6}$/;
      if (!pincodeRegex.test(userForm.pincode)) {
        setError('Please enter a valid 6-digit Pincode.');
        setShowValidation(true);
        return;
      }
    } else if (step === 4) {
      // Step 4: Role-Specific Details
      if (actionType === 'donor') {
        if (!userForm.weight || !userForm.preferredLocations || !userForm.emergencyContactName || !userForm.emergencyContactPhone) {
          setError('Please fill in all donor safety and contact credentials.');
          setShowValidation(true);
          return;
        }
        const emerPhoneRegex = /^(?:\+91|91)?\d{10}$/;
        if (!emerPhoneRegex.test(userForm.emergencyContactPhone.replace(/[\s\-()]/g, ''))) {
          setError('Please enter a valid 10-digit emergency contact phone.');
          setShowValidation(true);
          return;
        }
      } else {
        if (!idFile) {
          setError('Please upload a verification document (e.g. Aadhaar or ID proof).');
          setShowValidation(true);
          return;
        }
      }
    }
    setShowValidation(false);
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    setShowValidation(false);
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
      state: 'Assam',
      district: 'Kamrup Metropolitan',
      area: '',
      pincode: '',
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
    setShowValidation(false);
    setSameAsCurrentAddress(false);
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
        state: userForm.state,
        district: userForm.district,
        area: userForm.area,
        pincode: userForm.pincode,
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
          <div className={`step-dot ${step >= 6 ? 'active' : ''}`} title="Result">6</div>
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
                  className={`action-card ${actionType === 'donor' ? 'selected' : ''}`}
                  onClick={() => setActionType('donor')}
                >
                  <div className="action-card-icon">
                    <FaTint />
                  </div>
                  <div className="action-card-info">
                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Create Blood Donor</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Register a new blood donor directly into the system database.</p>
                  </div>
                </div>

                <div
                  className={`action-card ${actionType === 'requestor' ? 'selected' : ''}`}
                  onClick={() => setActionType('requestor')}
                >
                  <div className="action-card-icon">
                    <FaUser />
                  </div>
                  <div className="action-card-info">
                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Create Blood Requestor</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Register a new verified blood requestor (seeker) in the system.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Verification */}
          {step === 2 && (
            <div className="step-content animate-fade">
              <h3 className="form-subheading mb-4" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Mobile & OTP Verification</h3>

              <div className="form-group mb-4">
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
                    className="btn btn-secondary mt-3"
                    onClick={handleSendOtp}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                  >
                    Send OTP Verification Code
                  </button>
                )}
              </div>

              {otpSent && !otpVerified && (
                <div className="form-group mb-4 animate-fade">
                  <div className="alert-box alert-info mb-3" style={{
                    color: 'var(--text-primary)',
                    border: '1px solid hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.2)',
                    background: 'var(--primary-light)',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    lineHeight: '1.4',
                    display: 'block'
                  }}>
                    <strong>OTP Sent!</strong> A 6-digit One-Time Password has been dispatched to +91 {userForm.phone}. (Use mock code <strong style={{ color: 'var(--primary)' }}>123456</strong>)
                  </div>
                  <label className="form-label">Enter 6-Digit OTP Code</label>
                  <input
                    type="text"
                    placeholder="Enter 123456"
                    className="form-control mb-3"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
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
                <div className="alert-box alert-success mb-4 text-center" style={{ color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                  <strong>✓ Phone number verified successfully!</strong> Please proceed to the next step.
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Personal & Address Details */}
          {step === 3 && (
            <div className="step-content animate-fade">
              <h3 className="form-subheading mb-4" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Personal & Address Details</h3>

              <div className="form-row flex-gap mb-4">
                <div className="form-group flex-1">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control${showValidation && !userForm.name ? ' is-invalid' : ''}`}
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
                    className={`form-control${showValidation && !userForm.email ? ' is-invalid' : ''}`}
                    value={userForm.email}
                    onChange={handleUserChange}
                    placeholder="e.g. name@domain.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row flex-gap mb-4">
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
                    className={`form-control${showValidation && !userForm.dob ? ' is-invalid' : ''}`}
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

              <div className="form-row flex-gap mb-4" style={{ position: 'relative', zIndex: 10 }}>
                <div className="form-group flex-1">
                  <label className="form-label">State</label>
                  <select
                    name="state"
                    className="form-control"
                    value={userForm.state}
                    onChange={(e) => {
                      const selectedState = e.target.value;
                      const defaultDistrict = locationData[selectedState]?.[0] || '';
                      setUserForm(prev => ({
                        ...prev,
                        state: selectedState,
                        district: defaultDistrict
                      }));
                    }}
                  >
                    {Object.keys(locationData).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group flex-1" style={{ position: 'relative' }}>
                  <label className="form-label">District</label>

                  {/* Trigger button */}
                  <div
                    ref={districtTriggerRef}
                    className={`form-control district-trigger${showValidation && !userForm.district ? ' is-invalid' : ''}`}
                    onClick={openDistrict}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
                  >
                    <span style={{ color: userForm.district ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {userForm.district || 'Select district...'}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ color: 'var(--text-secondary)', transition: 'transform 0.2s', transform: districtOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>

                  {/* Portal dropdown — renders at body level to escape all stacking contexts */}
                  {districtOpen && createPortal(
                    <div
                      ref={districtPortalRef}
                      style={{
                        position: 'absolute',
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                        zIndex: 99999,
                        background: dropdownPos.bg || '#1a1c24',
                        border: `1px solid ${dropdownPos.borderColor || 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '10px',
                        boxShadow: dropdownPos.shadow || '0 10px 40px rgba(0,0,0,0.4)',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Search bar */}
                      <div style={{ padding: '8px 10px', borderBottom: `1px solid ${dropdownPos.borderColor || 'rgba(255,255,255,0.08)'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: dropdownPos.searchBg || 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 10px' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: dropdownPos.mutedColor || '#6b7280', flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <input
                            autoFocus
                            type="text"
                            placeholder="Search district..."
                            value={districtSearch}
                            onChange={e => setDistrictSearch(e.target.value)}
                            style={{
                              border: 'none',
                              outline: 'none',
                              background: 'transparent',
                              fontSize: '0.82rem',
                              color: dropdownPos.textColor || '#f3f4f6',
                              width: '100%'
                            }}
                          />
                          {districtSearch && (
                            <button
                              onClick={() => setDistrictSearch('')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: dropdownPos.mutedColor || '#6b7280', padding: 0, lineHeight: 1, fontSize: '1rem' }}
                            >✕</button>
                          )}
                        </div>
                      </div>

                      {/* Options */}
                      <ul style={{ listStyle: 'none', margin: 0, padding: '4px 0', maxHeight: '220px', overflowY: 'auto' }}>
                        {(locationData[userForm.state] || [])
                          .filter(dt => dt.toLowerCase().includes(districtSearch.toLowerCase()))
                          .map(dt => (
                            <li
                              key={dt}
                              onClick={() => {
                                setUserForm(prev => ({ ...prev, district: dt }));
                                setDistrictOpen(false);
                                setDistrictSearch('');
                              }}
                              style={{
                                padding: '9px 14px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                color: userForm.district === dt ? '#c0392b' : (dropdownPos.textColor || '#f3f4f6'),
                                background: userForm.district === dt ? 'rgba(192,57,43,0.10)' : 'transparent',
                                fontWeight: userForm.district === dt ? 600 : 400,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'background 0.15s'
                              }}
                              onMouseEnter={e => { if (userForm.district !== dt) e.currentTarget.style.background = dropdownPos.searchBg || 'rgba(128,128,128,0.08)'; }}
                              onMouseLeave={e => { if (userForm.district !== dt) e.currentTarget.style.background = 'transparent'; }}
                            >
                              {dt}
                              {userForm.district === dt && (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: '#c0392b' }}>
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </li>
                          ))}
                        {(locationData[userForm.state] || []).filter(dt => dt.toLowerCase().includes(districtSearch.toLowerCase())).length === 0 && (
                          <li style={{ padding: '12px 14px', fontSize: '0.82rem', color: dropdownPos.mutedColor || '#6b7280', textAlign: 'center' }}>No results found</li>
                        )}
                      </ul>
                    </div>,
                    document.body
                  )}
                </div>
              </div>

              <div className="form-row flex-gap mb-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="form-group flex-1">
                  <label className="form-label">Area / Locality</label>
                  <input
                    type="text"
                    name="area"
                    className={`form-control${showValidation && !userForm.area ? ' is-invalid' : ''}`}
                    value={userForm.area}
                    onChange={handleUserChange}
                    placeholder="Local sector / neighborhood"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    className={`form-control${showValidation && !/^\d{6}$/.test(userForm.pincode) ? ' is-invalid' : ''}`}
                    value={userForm.pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setUserForm(prev => ({ ...prev, pincode: val }));
                    }}
                    placeholder="6-digit PIN"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* Current Address */}
              <div className="form-row mb-3" style={{ position: 'relative', zIndex: 1 }}>
                <div className="form-group flex-1">
                  <label className="form-label">Current Address (Present Residence)</label>
                  <input
                    type="text"
                    name="currentAddress"
                    className={`form-control${showValidation && !userForm.currentAddress ? ' is-invalid' : ''}`}
                    value={userForm.currentAddress}
                    onChange={handleUserChange}
                    placeholder="Flat/House No., Building, Street Name, Landmark"
                    required
                  />
                </div>
              </div>

              {/* Same Address Checkbox */}
              <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  userSelect: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: sameAsCurrentAddress ? 'var(--primary-light)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="checkbox"
                    checked={sameAsCurrentAddress}
                    onChange={e => handleSameAddress(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span style={{ color: sameAsCurrentAddress ? 'var(--primary)' : 'var(--text-secondary)' }}>
                    Permanent address same as current address
                  </span>
                </label>
              </div>

              {/* Permanent Address */}
              <div className="form-row mb-4" style={{ position: 'relative', zIndex: 1 }}>
                <div className="form-group flex-1">
                  <label className="form-label">Permanent Address (Family Residence)</label>
                  <input
                    type="text"
                    name="permanentAddress"
                    className={`form-control${showValidation && !userForm.permanentAddress ? ' is-invalid' : ''}`}
                    value={userForm.permanentAddress}
                    onChange={handleUserChange}
                    placeholder="Permanent family residence address details"
                    readOnly={sameAsCurrentAddress}
                    style={sameAsCurrentAddress ? {
                      background: 'rgba(128,128,128,0.06)',
                      cursor: 'not-allowed',
                      color: 'var(--text-secondary)'
                    } : {}}
                    required
                  />
                  {sameAsCurrentAddress && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      ✓ Auto-filled from current address
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Role Setup & Eligibility */}
          {step === 4 && (
            <div className="step-content animate-fade">
              {actionType === 'donor' ? (
                <div>
                  <h3 className="form-subheading mb-4" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Become Blood Donor - Eligibility & Details</h3>

                  <div className="form-row flex-gap mb-4">
                    <div className="form-group flex-1">
                      <label className="form-label">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        className={`form-control${showValidation && !userForm.weight ? ' is-invalid' : ''}`}
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

                  <div className="form-row flex-gap mb-4">
                    <div className="form-group flex-1">
                      <label className="form-label">Preferred Donation Locations</label>
                      <input
                        type="text"
                        name="preferredLocations"
                        className={`form-control${showValidation && !userForm.preferredLocations ? ' is-invalid' : ''}`}
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

                  <div className="form-row flex-gap mb-4">
                    <div className="form-group flex-1">
                      <label className="form-label">Emergency Contact Full Name</label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        className={`form-control${showValidation && !userForm.emergencyContactName ? ' is-invalid' : ''}`}
                        value={userForm.emergencyContactName}
                        onChange={handleUserChange}
                        placeholder="Contact person's name"
                        required
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Emergency Contact Phone Number</label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        className={`form-control${showValidation && !userForm.emergencyContactPhone ? ' is-invalid' : ''}`}
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
                  <h3 className="form-subheading mb-4" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Become Requestor - Upload Verification Document</h3>

                  <div className="form-group mb-4">
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
              <h3 className="summary-title" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Review Details Before Saving</h3>

              <div className="summary-box glass-card mt-4 p-4" style={{ fontSize: '0.85rem' }}>
                <div className="summary-details" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.95rem' }}>General Credentials</h4>
                  </div>
                  <p><strong className="summary-label">Action:</strong> Register {actionType === 'donor' ? 'Blood Donor' : 'Blood Requestor'}</p>
                  <p><strong className="summary-label">Full Name:</strong> {userForm.name}</p>
                  <p><strong className="summary-label">Email:</strong> {userForm.email}</p>
                  <p><strong className="summary-label">Mobile Phone:</strong> +91 {userForm.phone} (Verified via OTP)</p>
                  <p><strong className="summary-label">Gender:</strong> {userForm.gender}</p>
                  <p><strong className="summary-label">Date of Birth:</strong> {userForm.dob}</p>
                  <p><strong className="summary-label">Blood Group:</strong> <span className="badge badge-approved">{userForm.bloodGroup}</span></p>

                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '0.5rem 0' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.95rem' }}>Address & Region</h4>
                  </div>
                  <p><strong className="summary-label">State:</strong> {userForm.state}</p>
                  <p><strong className="summary-label">District:</strong> {userForm.district}</p>
                  <p><strong className="summary-label">Area / Locality:</strong> {userForm.area}</p>
                  <p><strong className="summary-label">Pincode:</strong> {userForm.pincode}</p>
                  <p><strong className="summary-label">Current Address:</strong> {userForm.currentAddress}</p>
                  <p><strong className="summary-label">Permanent Address:</strong> {userForm.permanentAddress}</p>

                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', margin: '0.5rem 0' }}>
                    <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '0.95rem' }}>Role Specifics</h4>
                  </div>
                  {actionType === 'donor' ? (
                    <>
                      <p><strong className="summary-label">Weight:</strong> {userForm.weight} kg</p>
                      <p><strong className="summary-label">Last Donation:</strong> {userForm.lastDonationDate || 'Never'}</p>
                      <p><strong className="summary-label">Availability:</strong> {userForm.availability}</p>
                      <p><strong className="summary-label">Preferred Location:</strong> {userForm.preferredLocations}</p>
                      <p><strong className="summary-label">Association:</strong> {userForm.associatedWith}</p>
                      <p><strong className="summary-label">Emergency Contact:</strong> {userForm.emergencyContactName} ({userForm.emergencyContactPhone})</p>
                    </>
                  ) : (
                    <p><strong className="summary-label">Verification Doc:</strong> <span style={{ color: 'var(--success)', fontWeight: 600 }}>{idFile ? idFile.name : 'None'}</span></p>
                  )}
                </div>
              </div>

              <p className="mt-4" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                By clicking Confirm & Save, this verified profile will be securely saved into the system database.
              </p>
            </div>
          )}

          {/* STEP 6: Success Screen */}
          {step === 6 && (
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
              <h3 className="success-headline mt-4" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.4rem' }}>User Profile Provisioned</h3>
              <p className="success-detail mt-2 mb-6" style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0.5rem auto 1.5rem' }}>
                The verified {actionType === 'donor' ? 'blood donor' : 'blood requestor'} account has been successfully provisioned in the database.
              </p>

              <div className="flex-center" style={{ gap: '1rem' }}>
                <button className="btn btn-primary" onClick={resetForm}>
                  <span>Create Another</span>
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/users')}>
                  <span>Go to Users Directory</span> <FaArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Buttons */}
        {step < 6 && (
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

              {step < 5 ? (
                <button
                  className="btn btn-primary"
                  onClick={nextStep}
                  disabled={step === 2 && !otpVerified}
                >
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

        .summary-box {
          background: rgba(255, 255, 255, 0.02) !important;
          padding: 1.5rem 2rem !important;
          border: 1px solid var(--border) !important;
        }

        html.light-theme .summary-box {
          background: #ffffff !important;
          border: 1px solid var(--border) !important;
          box-shadow: var(--shadow-sm);
        }

        .summary-details p {
          margin-bottom: 0.5rem;
          color: var(--text-primary);
          font-size: 0.85rem;
        }

        .summary-label {
          color: var(--text-secondary);
          display: inline-block;
          width: 140px;
          font-weight: 600;
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
          gap: 1.75rem;
          width: 100%;
          margin: 2.5rem 0;
        }

        .action-card {
          border: 1px solid var(--border);
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2.25rem 2rem;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.25rem;
          box-shadow: var(--shadow);
        }

        html.light-theme .action-card {
          background: rgba(255, 255, 255, 0.65);
          border-color: rgba(0, 0, 0, 0.06);
          box-shadow: var(--shadow-sm);
        }

        .action-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.04);
        }

        html.light-theme .action-card:hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(0, 0, 0, 0.12);
        }

        .action-card.selected {
          border-color: var(--primary);
          background: linear-gradient(135deg, hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1) 0%, hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.18) 100%);
        }

        html.light-theme .action-card.selected {
          border-color: var(--primary);
          background: linear-gradient(135deg, hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.04) 0%, hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.08) 100%);
        }

        .action-card-icon {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--text-secondary);
          transition: all 0.25s ease;
        }

        html.light-theme .action-card-icon {
          background: #f1f5f9;
          border-color: #e2e8f0;
          color: #64748b;
        }

        .action-card.selected .action-card-icon {
          background: var(--primary);
          border-color: var(--primary);
          color: white !important;
        }

        .action-card-info h4 {
          font-size: 1rem;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .action-card-info p {
          line-height: 1.5;
        }

        .form-control.is-invalid, .phone-input-group.is-invalid {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important;
          background: rgba(239, 68, 68, 0.03) !important;
        }

        html.light-theme .form-control.is-invalid, html.light-theme .phone-input-group.is-invalid {
          background: #fffafa !important;
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
