/* Login - Secure Admin Portal Authorization Gate */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginBg from '../assets/bg/login_bg.png';

const Login = () => {
  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // If already logged in, redirect to Dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all authorization fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glow"></div>
      
      <div className="light-login-card login-card animate-fade">
        <div className="login-header">
          <h2>Ziv Foundation</h2>
          <p>Secure Administrator Access Portal</p>
        </div>

        {(localError || authError) && (
          <div className="alert-box alert-danger">
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@zivfoundation.org"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="eye-icon">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? (
              <span className="flex-center gap-2">
                <span className="spinner-small"></span> Verifying Session...
              </span>
            ) : 'Sign In To Panel'}
          </button>
        </form>

        <div className="credentials-tip">
          <span className="tip-badge">TEST ACCOUNT</span>
          <p>Email: <code>admin@zivfoundation.org</code></p>
          <p>Password: <code>admin123</code></p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: linear-gradient(rgba(244, 246, 249, 0.75), rgba(244, 246, 249, 0.9)), url(${loginBg}) no-repeat center center / cover;
          overflow: hidden;
          padding: 1.5rem;
        }

        .login-glow {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, hsla(352, 84%, 42%, 0.05) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 1;
          pointer-events: none;
        }

        .light-login-card {
          width: 100%;
          max-width: 440px;
          z-index: 10;
          padding: 2.5rem 2rem;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #111827;
        }

        .login-header p {
          font-size: 0.85rem;
          color: #4b5563;
          margin-top: 0.25rem;
        }

        .light-login-card .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .light-login-card .form-control {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          color: #1f2937;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          box-shadow: none !important;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .light-login-card .form-control:hover {
          border-color: #9ca3af;
          box-shadow: none !important;
        }

        .light-login-card .form-control:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: none !important;
          background: #ffffff;
        }

        .light-login-card .form-control::placeholder {
          color: #9ca3af;
        }

        /* Override Chrome Autofill style */
        .light-login-card .form-control:-webkit-autofill,
        .light-login-card .form-control:-webkit-autofill:hover, 
        .light-login-card .form-control:-webkit-autofill:focus {
          -webkit-text-fill-color: #1f2937;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          box-shadow: 0 0 0px 1000px #ffffff inset !important;
          border-color: #d1d5db;
          transition: background-color 5000s ease-in-out 0s;
        }

        .light-login-card .form-control:-webkit-autofill:hover {
          border-color: #9ca3af;
        }

        .light-login-card .form-control:-webkit-autofill:focus {
          border-color: var(--primary);
        }

        .password-input-container {
          position: relative;
          width: 100%;
        }

        .password-input-container .form-control {
          padding-right: 2.75rem;
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }

        .password-toggle-btn:focus {
          color: var(--primary);
        }

        .eye-icon {
          pointer-events: none;
        }

        .light-login-card .btn-primary {
          background: var(--primary);
          color: #ffffff;
          transition: background-color 0.2s ease;
        }

        .light-login-card .btn-primary:hover {
          background: var(--primary-hover);
          box-shadow: none;
          transform: none;
        }

        .light-login-card .btn-primary:active {
          transform: none;
        }

        .light-login-card .btn:active {
          transform: none;
        }

        .light-login-card .alert-box {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1.25rem;
          font-weight: 500;
        }

        .light-login-card .alert-danger {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fee2e2;
        }

        .w-full {
          width: 100%;
        }

        .gap-2 {
          gap: 0.5rem;
        }

        .credentials-tip {
          margin-top: 2rem;
          padding: 1rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.8rem;
          text-align: left;
        }

        .tip-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          color: #ffffff;
          background: var(--primary);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .credentials-tip p {
          color: #4b5563;
          margin-bottom: 0.25rem;
        }

        .credentials-tip code {
          background: #f3f4f6;
          color: #111827;
          border: 1px solid #e5e7eb;
          padding: 0.1rem 0.3rem;
          font-size: 0.8rem;
          border-radius: 3px;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-fade {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
