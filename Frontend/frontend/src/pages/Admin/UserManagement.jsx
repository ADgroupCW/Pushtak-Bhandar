import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const roles = ['admin', 'staff', 'member'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/change-role`, { newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to change role.');
    }
  };

  const handleEmailToggle = async (userId, currentStatus) => {
    try {
      await api.put(`/admin/users/${userId}/confirm-email`, {
        emailConfirmed: !currentStatus,
      });
      fetchUsers();
    } catch (err) {
      alert('Failed to update email status.');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="user-management">
          <h2>👥 User Management</h2>

          <input
            type="text"
            className="user-search"
            placeholder="Search by email or username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <table className="user-table">
            <thead>
              <tr>
                <th>Membership ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Email Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>{user.membershipId || `MEM-${user.id}`}</td>
                  <td>{user.userName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`status-toggle ${user.emailConfirmed ? 'active' : 'inactive'}`}
                      onClick={() => handleEmailToggle(user.id, user.emailConfirmed)}
                    >
                      {user.emailConfirmed ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>
                    <select
                      className="role-dropdown"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
