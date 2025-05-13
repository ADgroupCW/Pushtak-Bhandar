import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, BookOpen, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import api from '../api/api';

const Login = () => {
  const [form, setForm] = useState({
    emailOrUsername: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.emailOrUsername.trim() || !form.password) {
      setError('All fields are required');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/Auth/login', {
        EmailOrUsername: form.emailOrUsername,
        password: form.password,
      });

      const data = res.data;

      if (!data.success && data.code === 'EMAIL_NOT_VERIFIED') {
        await api.post('/auth/resend-otp', null, {
          params: { email: data.email }
        });
        navigate('/verifyotp', { state: { email: data.email } });
        return;
      }

      if (!data.success) {
        setError(data.message || 'Login failed.');
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role || 'customer');
      } else {
        setError('Login failed: No token received.');
        return;
      }

      setSuccess(true);
      const role = (data.role || '').toLowerCase();

      setTimeout(() => {
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'staff') {
          navigate('/staffdashboard');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-container">
        <div className="success-box">
          <BookOpen size={48} />
          <h2>Login Successful!</h2>
          <p>Redirecting you to your dashboard...</p>
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="decorative-books">
        <div className="book book-1"></div>
        <div className="book book-2"></div>
        <div className="book book-3"></div>
      </div>

      <div className="login-container">
        {/* ← Go Back Button */}
        <button className="go-back-btn" onClick={() => navigate('/')}>
          ← Go Back
        </button>

        <div className="login-header">
          <div className="logo">
            <BookOpen size={32} />
            <h1>Pushtak Bhandar</h1>
          </div>
          <p className="tagline">Your digital library companion</p>
        </div>

        <div className="login-form-container">
          <h2>Welcome Back</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="emailOrUsername">
                <Mail size={18} />
                <span>Email or Username</span>
              </label>
              <input
                type="text"
                id="emailOrUsername"
                name="emailOrUsername"
                placeholder="you@example.com or username"
                value={form.emailOrUsername}
                onChange={handleChange}
                required
                autoComplete="username"
                className={error && !form.emailOrUsername ? "error" : ""}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                <span>Password</span>
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  className={error && form.password.length < 8 ? "error" : ""}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <small>Minimum 8 characters required</small>
            </div>

            <div className="form-actions">
              
              <button
                type="button"
                className="forgot-password"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="spinner" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="separator">
            <span>OR</span>
          </div>

          <div className="register-prompt">
            <p>Don't have an account?</p>
            <button
              className="register-button"
              onClick={() => navigate('/register')}
            >
              Create Account
            </button>
          </div>
        </div>

        <div className="login-footer">
          <p className="quote">
            "Reading is essential for those who seek to rise above the ordinary."
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
