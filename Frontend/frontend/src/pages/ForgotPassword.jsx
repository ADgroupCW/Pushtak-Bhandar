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
    <div className="forgot-wrapper">
      <div className="book-decoration-top">
        <div className="book red" />
        <div className="book blue" />
        <div className="book green" />
        <div className="book yellow" />
        <div className="book purple" />
      </div>

      <div className="forgot-container">
        <BookOpen size={40} className="forgot-icon" />
        <h2 className="forgot-title">Forgot Password</h2>
        <p className="forgot-subtitle">
          Enter your email and we’ll send you an OTP to reset your password.
        </p>

        {error && <div className="forgot-error-box">{error}</div>}
        {message && <div className="forgot-success-box">{message}</div>}

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="forgot-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
