import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/AdminSidebar.css';

const AdminSidebar = () => {
  const navigate = useNavigateNavigate();

  const handleLogout = () => {
    //  Remove auth toke and role from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Notify user about  logout
    alert('You have been logged out.');

    // Redirecting to the login page
    navigate('/login');
  };

  return (
    <div className="admin-sidebar">
      <h2>📖 Admin Panel</h2>
      <ul>
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/books">Manage Books</Link></li>
        <li><Link to="/admin/users">Manage Users</Link></li>
        <li><Link to="/admin/announcements">Announcement</Link></li>
        <li><Link to="/admin/reviews">Reviews Moderation</Link></li>
        <li><Link to="/admin/orders">Orders</Link></li>
        
        <li>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
