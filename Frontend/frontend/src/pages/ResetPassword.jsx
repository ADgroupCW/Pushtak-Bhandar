import React, { useState } from 'react';
import { Lock, Eye, EyeOff, BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/ResetPassword.css';

export default function ResetPassword() {
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const validate = () => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(form.newPassword)) {
      return 'Password must be 8+ chars, 1 uppercase, 1 lowercase, and 1 number.';
    }
    if (form.newPassword !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    if (!email) {
      setError('Missing email. Cannot reset password.');
      return;
    }
    console.log('Reset Payload:', { email, newPassword: form.newPassword , confirmPassword:form.confirmPassword});

    try {
      const res = await api.post('/Auth/reset-password', {
        email,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });
      setMessage(res.data.message || 'Password reset successful.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Reset failed. Please try again.';
      setError(msg);
    }
  };

  return (
    <div className="reset-wrapper">
      <BookOpen size={40} className="reset-icon" />
      <h2 className="reset-title">Set New Password</h2>
      <p className="reset-subtitle">
        Enter your new password for: <strong>{email}</strong>
      </p>

      {error && <div className="reset-error-box">{error}</div>}
      {message && <div className="reset-success-box">{message}</div>}

      <form onSubmit={handleSubmit} className="reset-form">
        {/* New Password */}
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" />
            <input
              type={show ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              placeholder="••••••••"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-wrapper">
            <Lock className="input-icon" />
            <input
              type={showConfirm ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
            <button
              type="button"
              className="eye-toggle"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="reset-button">
          Reset Password
        </button>
      </form>
    </div>
  );
}


