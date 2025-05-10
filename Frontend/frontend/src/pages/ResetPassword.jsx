import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, BookOpen, CheckCircle2 as Check, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/ResetPassword.css';
// We'll define CSS styles in a separate file

export default function ResetPassword() {
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Check password strength when password changes
  useEffect(() => {
    if (form.newPassword) {
      checkPasswordStrength(form.newPassword);
    }
  }, [form.newPassword]);

  const checkPasswordStrength = (password) => {
    // Basic password strength checker
    let score = 0;
    let feedback = '';

    // Length check
    if (password.length >= 8) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Provide feedback based on score
    if (score < 3) {
      feedback = 'Weak';
    } else if (score < 5) {
      feedback = 'Moderate';
    } else {
      feedback = 'Strong';
    }

    setPasswordStrength({ score, feedback });
  };

  const validate = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(form.newPassword)) {
      return 'Password must be 8+ characters with at least one uppercase letter, one lowercase letter, and one number.';
    }
    if (form.newPassword !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    if (!email) {
      setError('Missing email. Cannot reset password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/Auth/reset-password', {
        email,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });
      
      setMessage(res.data.message || 'Password reset successful! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render password strength indicator
  const renderStrengthIndicator = () => {
    const { score, feedback } = passwordStrength;
    
    return (
      <div className="strength-container">
        <div className="strength-bars">
          <div 
            className={`strength-bar ${score >= 1 ? 'active' : ''}`} 
            style={{ opacity: score >= 1 ? 1 : 0.2 }}
          />
          <div 
            className={`strength-bar ${score >= 2 ? 'active' : ''}`} 
            style={{ opacity: score >= 2 ? 1 : 0.2 }}
          />
          <div 
            className={`strength-bar ${score >= 3 ? 'active' : ''}`} 
            style={{ opacity: score >= 3 ? 1 : 0.2 }}
          />
          <div 
            className={`strength-bar ${score >= 4 ? 'active' : ''}`} 
            style={{ opacity: score >= 4 ? 1 : 0.2 }}
          />
          <div 
            className={`strength-bar ${score >= 5 ? 'active' : ''}`} 
            style={{ opacity: score >= 5 ? 1 : 0.2 }}
          />
        </div>
        <span className={`strength-text ${feedback.toLowerCase()}`}>
          {feedback || 'N/A'}
        </span>
      </div>
    );
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <div className="reset-header">
          <BookOpen className="header-icon" />
          <h1 className="reset-title">Reset Password</h1>
        </div>

        <p className="reset-subtitle">
          Enter your new password for: <strong>{email || 'your account'}</strong>
        </p>

        {error && (
          <div className="message error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        {message && (
          <div className="message success">
            <Check size={18} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reset-form">
          {/* New Password */}
          <div className="form-field">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-group">
              <Lock className="field-icon" />
              <input
                type={show ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                placeholder="••••••••"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.newPassword && renderStrengthIndicator()}
            <ul className="password-requirements">
              <li className={/[A-Z]/.test(form.newPassword) ? 'met' : ''}>One uppercase letter</li>
              <li className={/[a-z]/.test(form.newPassword) ? 'met' : ''}>One lowercase letter</li>
              <li className={/[0-9]/.test(form.newPassword) ? 'met' : ''}>One number</li>
              <li className={form.newPassword.length >= 8 ? 'met' : ''}>At least 8 characters</li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-group">
              <Lock className="field-icon" />
              <input
                type={showConfirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.newPassword && form.confirmPassword && (
              <div className={`password-match ${form.newPassword === form.confirmPassword ? 'matched' : 'not-matched'}`}>
                {form.newPassword === form.confirmPassword ? (
                  <>
                    <Check size={14} /> Passwords match
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} /> Passwords don't match
                  </>
                )}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="reset-button"
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
          
          <div className="back-to-login">
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}