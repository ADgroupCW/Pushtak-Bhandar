import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-sections">
        <div>
          <h4>Explore</h4>
          <ul>
            <li>Bestsellers</li>
            <li>Award Winners</li>
            <li>New Releases</li>
            <li>Deals</li>
          </ul>
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul>
            <li>Shop All</li>
            <li>About Us</li>
            <li>Coming Soon</li>
          </ul>
        </div>
        <div>
          <h4>Customer Service</h4>
          <ul>
            <li>FAQ</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div className="newsletter">
          <h4>Subscribe to Our Newsletter</h4>
          <p>Stay updated with new releases and exclusive offers!</p>
          <div className="subscribe">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <p>© 2025 Pushtak Bhandar. All rights reserved.</p>
        <div className="footer-links">
          <span>Terms and Conditions</span>
          <span>Privacy Policy</span>
        </div>
        <div className="footer-icons">
          <span>📘</span>
          <span>📸</span>
          <span>🐦</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
