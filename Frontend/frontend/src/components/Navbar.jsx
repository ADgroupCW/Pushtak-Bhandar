import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaBookmark, FaSignOutAlt } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <h2>Pushtak Bhandar</h2>
      </div>

      <ul className="nav-links">
        <li><Link to="/bestsellers">Bestsellers</Link></li>
        <li><Link to="/new-releases">New Releases</Link></li>
        <li><Link to="/award-winners">Award Winners</Link></li>
        <li><Link to="/coming-soon">Coming Soon</Link></li>
        <li><Link to="/deals">Deals</Link></li>
      </ul>

      <div className="nav-icons">
        {isLoggedIn ? (
          <>
            <Link to="/profile" title="Profile"><FaUser /></Link>
            <Link to="/cart" title="Cart"><FaShoppingCart /></Link>
            <Link to="/bookmarks" title="Bookmarks"><FaBookmark /></Link>
            <Link to="/orders" title="Orders">Orders</Link>
            <button className="logout-btn" title="Logout" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
