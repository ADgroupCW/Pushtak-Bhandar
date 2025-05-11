import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaBookmark, FaSignOutAlt, FaBox, FaChevronDown } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
  <Link to="/" className="home-link">
    <h2>Pushtak Bhandar</h2>
  </Link>
</div>


      <ul className="nav-links">
        <li><Link to="/allbooks">All Book</Link></li>
        <li><Link to="/bestsellers">Bestsellers</Link></li>
        <li><Link to="/newrelease">New Releases</Link></li>
        <li><Link to="/awardwinners">Award Winners</Link></li>
        <li><Link to="/newarrivals">New Arrivals</Link></li>
        <li><Link to="/deals">Deals</Link></li>
      </ul>

      <div className="nav-icons">
       {isLoggedIn ? (
  <>
    <Link to="/profile" title="Profile"><FaUser /></Link>
    <Link to="/orders" title="Orders"><FaBox /></Link>
    <Link to="/cart" title="Cart"><FaShoppingCart /></Link>
    <Link to="/bookmarks" title="Bookmarks"><FaBookmark /></Link>
    <button className="logout-btn" title="Logout" onClick={handleLogout}>
      <FaSignOutAlt style={{ color: 'black' }} />
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
