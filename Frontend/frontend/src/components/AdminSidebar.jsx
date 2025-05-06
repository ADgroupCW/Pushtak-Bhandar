import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar">
      <h2>📖 Admin Panel</h2>
      <ul>
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/books">Manage Books</Link></li>
        <li><Link to="/admin/users">Manage Users</Link></li>
        <li><Link to="/admin/announcements">Announcement</Link></li>
        <li><Link to="/admin/reviews">Reviews Moderation</Link></li>
        
        
        <li><button className="logout-btn">Logout</button></li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
