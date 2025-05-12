// Importing required modules and components
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/VerifyOtp.css';

export default function VerifyOtp() {

  // OTP fields: 6 digit input, initialized as empty
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(120);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;
// If email is missing, show error
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

   // Display timer as mm:ss
  const formatTime = () => {
    const minutes = String(Math.floor(timeLeft / 60));
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

// Submit OTP for verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      const res = await api.post('/Auth/verify-otp', { email, otp: code });
      setError('');
      setSuccess(res.data.message || 'Email verified successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed. Please try again.';
      setError(msg);
    }
  };

  // Resend OTP logic
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

  // Frontend 
  return (
    <div className="email-otp-container">
      <div className="email-otp-box">
        <BookOpen size={36} className="email-otp-icon" />
        <h2 className="email-otp-title">Verify OTP</h2>
        <p className="email-otp-subtitle">
          {email ? <>Enter the 6-digit code sent to <strong>{email}</strong></> : 'No email provided'}
        </p>

        {error && <div className="email-otp-error">{error}</div>}
        {success && <div className="email-otp-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="email-otp-inputs">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength="1"
                className="email-otp-input"
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                ref={(el) => (inputRefs.current[idx] = el)}
                disabled={!email}
              />
            ))}
          </div>

          <p className="email-otp-timer">Resend OTP in {formatTime()}</p>

          <button type="submit" className="email-otp-btn" disabled={!email}>
            Verify & Continue
          </button>
          <button
            type="button"
            className="email-otp-resend"
            disabled={resendDisabled || !email}
            onClick={handleResend}
          >
            Resend OTP
          </button>

          <p className="email-otp-back">
            <a href="/forgot-password">← Back to Password Reset</a>
          </p>
        </form>
      </div>
    </div>
  );
}
