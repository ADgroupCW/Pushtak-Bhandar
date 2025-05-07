import React, { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/VerifyOtp.css';

export default function VerifyResetOtp() {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      setError('Missing email. Please start password reset again.');
    }
  }, [email]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length !== 6) {
      setError('Please enter a 6-digit OTP.');
      return;
    }

    try {
      const res = await api.post('/Auth/verify-reset-otp', {
        email,
        otp: code
      });

      setMessage(res.data.message || 'OTP verified. You can now reset password.');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Verification failed. Try again.';
      setError(msg);
    }
  };

  return (
    <div className="otp-wrapper">
      <div className="book-decoration-top">
        <div className="book red" />
        <div className="book blue" />
        <div className="book green" />
        <div className="book yellow" />
        <div className="book purple" />
      </div>

      <BookOpen size={40} className="otp-icon" />
      <h2 className="otp-title">Reset OTP Verification</h2>
      <p className="otp-subtitle">
        Enter the 6-digit OTP sent to your email: <strong>{email}</strong>
      </p>

      {error && <div className="otp-error-message">{error}</div>}
      {message && <div className="otp-success-message">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="otp-input-group">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              maxLength="1"
              className="otp-input"
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              ref={(el) => (inputRefs.current[idx] = el)}
              disabled={!email}
            />
          ))}
        </div>

        <button type="submit" className="otp-verify-btn" disabled={!email}>
          Verify OTP
        </button>
      </form>
    </div>
  );
}
