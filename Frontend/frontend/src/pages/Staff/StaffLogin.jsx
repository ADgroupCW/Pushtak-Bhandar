import { useState } from 'react';
import { Lock, User } from 'lucide-react';
import "../../styles/StaffLogin.css";

export default function StaffLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    // Mock login - in a real implementation, this would connect to your backend
    if (username && password) {
      // Simulate authentication
      console.log('Logging in with:', username);
      // In a real app, this would redirect to dashboard
      setError('');
      alert('Login successful! Would redirect to dashboard.');
    } else {
      setError('Please enter both username and password');
    }
  };
  
  return (
    <div className="staff-portal-container flex items-center justify-center min-h-screen bg-gray-100">
      <div className="staff-login-card w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="staff-login-header text-center">
          <h1 className="staff-portal-title text-3xl font-bold text-gray-800">Staff Portal</h1>
          <p className="staff-portal-subtitle mt-2 text-gray-600">Private Book Library</p>
        </div>
        
        {error && (
          <div className="staff-login-error p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}
        
        <div className="staff-login-form mt-8 space-y-6">
          <div className="staff-login-fields rounded-md shadow-sm space-y-4">
            <div className="staff-username-field relative">
              <div className="staff-username-icon absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="staff-icon w-5 h-5 text-gray-400" />
              </div>
              <input
                id="staff-username"
                name="username"
                type="text"
                className="staff-input w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Staff ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div className="staff-password-field relative">
              <div className="staff-password-icon absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="staff-icon w-5 h-5 text-gray-400" />
              </div>
              <input
                id="staff-password"
                name="password"
                type="password"
                className="staff-input w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="staff-login-options flex items-center justify-between">
            <div className="staff-remember-me flex items-center">
              <input
                id="staff-remember-me"
                name="remember_me"
                type="checkbox"
                className="staff-checkbox w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="staff-remember-me" className="staff-remember-label block ml-2 text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="staff-forgot-password text-sm">
              <a href="#" className="staff-forgot-link font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
          </div>
          
          <div className="staff-submit-container">
            <button
              onClick={handleSubmit}
              className="staff-submit-button w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}