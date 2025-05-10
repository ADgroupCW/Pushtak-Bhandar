import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle2 as CheckCircle, KeyRound, Timer } from 'lucide-react';
import api from '../api/api';
import '../styles/VerifyOtp.css';




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
  
  // OTP input refs
  const inputRefs = Array(6).fill(0).map(() => React.createRef());

  useEffect(() => {
    // Focus the first input field when component mounts
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }

    // Start countdown timer
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

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus to next input if value is entered
    if (value && index < 5 && inputRefs[index + 1].current) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle keydown events for navigation between inputs
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      // Move to previous input on left arrow
      inputRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      // Move to next input on right arrow
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle paste event for OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      
      // Focus last input after successful paste
      if (inputRefs[5].current) {
        inputRefs[5].current.focus();
      }
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
      const res = await api.post('/Auth/verify-reset-otp', {
        email,
        otp: otpValue
      });

      setMessage(res.data.message || 'OTP verified successfully!');
      
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to verify OTP. Please try again.';
      setError(msg);
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
      
      // Restart countdown
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
      const msg = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <div className="verify-header">
          <Mail className="header-icon" />
          <h1 className="verify-title">Verify OTP</h1>
        </div>

        <p className="verify-subtitle">
          Enter the 6-digit code sent to <strong>{email || 'your email'}</strong>
        </p>

        {error && (
          <div className="message error">
            <span>{error}</span>
          </div>
        )}
        
        {message && (
          <div className="message success">
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="verify-form">
          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isLoading}
                className="otp-input"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <div className="resend-container">
            <Timer size={16} />
            {resendDisabled ? (
              <span>Resend OTP in {countdown}s</span>
            ) : (
              <button 
                type="button" 
                className="resend-button"
                onClick={handleResendOtp}
                disabled={isResending}
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <button 
            type="submit" 
            className="verify-button"
            disabled={isLoading || otp.join('').length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          
          <div className="back-link">
            <KeyRound size={14} />
            <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>
              Back to Password Reset
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}