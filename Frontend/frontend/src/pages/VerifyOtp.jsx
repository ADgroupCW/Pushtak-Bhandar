import React, { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/VerifyOtp.css';

export default function VerifyOtp() {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      setError('Email not provided. Please register again.');
    }
  }, [email]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [timeLeft]);

  const formatTime = () => {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(1, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
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
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      const res = await api.post('/Auth/verify-otp', {
        email,
        otp: code
      });

      setError('');
      setSuccess(res.data.message || 'Email verified successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'OTP verification failed. Please try again.';
      setError(msg);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/Auth/resend-otp', null, { params: { email } });
      setTimeLeft(120);
      setResendDisabled(true);
      setOtp(Array(6).fill(''));
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP.';
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
      <h2 className="otp-title">Verify OTP</h2>
      <p className="otp-subtitle">
        {email
          ? `Enter the 6-digit code sent to ${email}`
          : 'No email provided'}
      </p>

      {error && <div className="otp-error-message">{error}</div>}
      {success && <div className="otp-success-message">{success}</div>}

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

        <p className="otp-timer">Time remaining: {formatTime()}</p>

        <button type="submit" className="otp-verify-btn" disabled={!email}>
          Verify
        </button>
        <button
          type="button"
          className="otp-resend-btn"
          disabled={resendDisabled || !email}
          onClick={handleResend}
        >
          Resend OTP
        </button>
      </form>
    </div>
  );
}
