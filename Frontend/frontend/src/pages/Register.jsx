import React, { useState, useEffect } from 'react';
import { BookOpen, Mail, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

import '../styles/Register.css';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = form;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    if (!usernameRegex.test(username)) {
      return 'Username must be 3–20 characters (letters, numbers, or underscore)';
    }

    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    if (!passwordRegex.test(password)) {
      return 'Password must be 8+ chars, 1 uppercase, 1 lowercase, and 1 number';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    try {
      const res = await api.post('/Auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      setRegistered(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        'Registration failed. Please try again.';

      setError(msg);
    }
  };

  useEffect(() => {
    if (registered) {
      const timer = setTimeout(() => {
        navigate('/verifyotp', { state: { email: form.email } });
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [registered, navigate, form.email]);

  if (registered) {
    return (
      <div className="register-success-wrapper">
        <div className="register-success-box">
          <div className="register-success-icon">
            <BookOpen size={48} />
          </div>
          <h2 className="register-success-title">Registration Successful!</h2>
          <p className="register-success-message">
            Please check your email for the OTP verification code.
          </p>
          <div className="register-success-email-box">
            <p>A verification code has been sent to {form.email}</p>
          </div>
          <button
            className="register-return-login"
            onClick={() => window.location.reload()}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-wrapper">
      {/* Decorative books */}
      <div className="book-decoration-top">
        <div className="book red" />
        <div className="book blue" />
        <div className="book green" />
        <div className="book yellow" />
        <div className="book purple" />
      </div>

      {/* Form container */}
      <div className="register-container">
        <div className="register-header">
          <div className="register-logo">
            <BookOpen size={40} />
          </div>
          <h2 className="register-title">Pushtak Bhandar</h2>
          <p className="register-subtitle">
            Begin your literary journey with us
          </p>
        </div>

        <div className="register-body">
          <h3 className="register-heading">Create Your Account</h3>

          {error && <div className="register-error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="BookLover123"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="form-note">
                Must be 8+ chars with uppercase, lowercase & number
              </p>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="eye-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="register-button">
              Register
            </button>
          </form>

          {/* Bottom section */}
          <div className="register-bottom">
            <p>Already have an account?</p>
            <button 
              className="register-signin-button"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>

          <p className="register-policy">
            By registering, you agree to Pushtak Bhandar's{' '}
            <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Decorative line & quote */}
      <div className="register-footer-decor">
        <div className="line" />
        <BookOpen size={24} className="footer-icon" />
        <div className="line" />
      </div>
      <p className="register-quote">
        "A reader lives a thousand lives before he dies" – George R.R. Martin
      </p>
    </div>
  );
}