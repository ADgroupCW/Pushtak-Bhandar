import React from 'react';
import '../styles/AdminDashboard.css';//importing css to admin dashboard

const AdminNavbar = () => {
  return (
    <div className="admin-navbar">
      <div className="admin-navbar-left">Dashboard</div>
      <div className="admin-navbar-right">Logged in as <strong>Admin</strong></div>
    </div>
  );
};

export default AdminNavbar;
