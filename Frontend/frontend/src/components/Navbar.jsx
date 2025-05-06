import React from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = () => {
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
        <Link to="/profile"><FaUser /></Link>
        <Link to="/cart"><FaLock /></Link>
      </div>
    </nav>
  );
};

export default Navbar;
