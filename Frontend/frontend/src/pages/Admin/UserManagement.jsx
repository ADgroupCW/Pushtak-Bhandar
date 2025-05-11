import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const roles = ['admin', 'staff', 'member'];

  const currentUserId = localStorage.getItem('userId');

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
    if (userId === currentUserId) {
      alert("You cannot change your own role.");
      return;
    }
    try {
      await api.put(`/admin/users/${userId}/change-role`, { newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to change role.');
    }
  };

  const handleEmailToggle = async (userId) => {
  if (userId === currentUserId) {
    alert("You cannot verify/unverify your own account.");
    return;
  }

  console.log(`[DEBUG] Attempting toggle for userId: ${userId}`);

  try {
    const res = await api.put(`/admin/users/${userId}/confirm-email`);
    console.log('[DEBUG] Toggle success:', res.data);

    // Refresh the user list
    await fetchUsers();
  } catch (err) {
    if (err.response) {
      console.error('[ERROR] Response error:', err.response.status, err.response.data);
    } else if (err.request) {
      console.error('[ERROR] No response received:', err.request);
    } else {
      console.error('[ERROR] Config/Other error:', err.message);
    }
    alert('❌ Failed to update email verification.');
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
                      className={`status-badge ${user.emailConfirmed ? 'verified' : 'unverified'}`}
                      onClick={() => handleEmailToggle(user.id)}
                      style={{
                        cursor: user.id === currentUserId ? 'not-allowed' : 'pointer',
                        pointerEvents: user.id === currentUserId ? 'none' : 'auto',
                      }}
                    >
                      {user.emailConfirmed ? 'Verified (Click to Unverify)' : 'Unverified (Click to Verify)'}
                    </span>
                  </td>
                  <td>
                    <select
                      className="role-dropdown"
                      value={user.roles[0]?.toLowerCase() || ''}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === currentUserId}
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
