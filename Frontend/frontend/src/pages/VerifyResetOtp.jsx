import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle2 as CheckCircle, KeyRound, Timer } from 'lucide-react';
import api from '../api/api';
import '../styles/VerifyResetOtp.css'; // You can keep using this or make a new file: ResetOtp.css

export default function VerifyResetOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const inputRefs = Array(6).fill(0).map(() => React.createRef());

  useEffect(() => {
    inputRefs[0].current?.focus();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.charAt(0);
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs[5].current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    if (!email) {
      setError('Email information is missing. Please go back to the previous step.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/Auth/verify-reset-otp', { email, otp: otpValue });
      setMessage(res.data.message || 'OTP verified successfully!');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    setIsResending(true);
    setError('');
    try {
      await api.post('/Auth/resend-otp', { email });
      setMessage('New OTP sent successfully!');
      setCountdown(60);
      setResendDisabled(true);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="reset-otp-container">
      <div className="reset-otp-box">
        <Mail className="reset-otp-icon" />
        <h2 className="reset-otp-title">Verify OTP</h2>
        <p className="reset-otp-subtitle">
          Enter the 6-digit code sent to <strong>{email || 'your email'}</strong>
        </p>

        {error && <div className="reset-otp-error">{error}</div>}
        {message && (
          <div className="reset-otp-success">
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="reset-otp-form">
          <div className="reset-otp-inputs">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className="reset-otp-input"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          <div className="reset-otp-timer">
            <Timer size={16} />
            {resendDisabled ? (
              <span>Resend OTP in {countdown}s</span>
            ) : (
              <button
                type="button"
                className="reset-otp-resend"
                onClick={handleResendOtp}
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <button
            type="submit"
            className="reset-otp-btn"
            disabled={isLoading || otp.join('').length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <p className="reset-otp-back">
            <KeyRound size={14} />
            <a
              href="/forgot-password"
              onClick={(e) => {
                e.preventDefault();
                navigate('/forgot-password');
              }}
            >
              Back to Password Reset
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
