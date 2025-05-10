import React, { useState } from 'react';
import { Mail, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/Auth/forgot-password', null, {
        params: { email },
      });
      setMessage(res.data.message || 'OTP sent to your email.');
      setTimeout(() => {
        navigate('/verify-reset-otp', { state: { email } });
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to send OTP. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-header">
        <div className="logo-container">
          <BookOpen size={32} />
        </div>
        <h1 className="title">Forgot Password</h1>
        <p className="description">
          Enter your email and we'll send you an OTP to reset your password.
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <form className="forgot-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email" className="input-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="input-field"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
    </div>
  );
}