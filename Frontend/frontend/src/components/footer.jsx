import React, { useState } from 'react';
import '../styles/Footer.css';
import '../styles/Modal.css';
import { Link, useNavigate } from 'react-router-dom';

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-sections">
          <div>
            <h4>Explore</h4>
            <ul>
                   <li><Link to="/bestsellers">Bestsellers</Link></li>
        <li><Link to="/newrelease">New Releases</Link></li>
        <li><Link to="/awardwinners">Award Winners</Link></li>
        <li><Link to="/newarrivals">New Arrivals</Link></li>
        <li><Link to="/deals">Deals</Link></li>
            </ul>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/allbooks">Shop All</Link></li>
              <li>About Us</li>
              
            </ul>
          </div>
          <div>
            <h4>Customer Service</h4>
            <ul>
              <li onClick={() => setShowFAQ(true)} className="clickable">FAQ</li>
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
            <span onClick={() => setShowTerms(true)} className="clickable">Terms and Conditions</span>
            <span onClick={() => setShowPrivacy(true)} className="clickable">Privacy Policy</span>
          </div>
          <div className="footer-icons">
            <span>📘</span>
            <span>📸</span>
            <span>🐦</span>
          </div>
        </div>
      </footer>

      {/* Terms Modal */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Terms and Conditions</h2>
            <p>
              Welcome to Pushtak Bhandar. By using our platform, you agree to the following:
              <br /><br />
              • Book listings and pricing may change without prior notice.  
              <br />
              • All content is for personal use only and not for redistribution.  
              <br />
              • We are not responsible for damages arising from misuse of the website.  
              <br /><br />
              Please contact support for more details or clarifications.
            </p>
            <button className="close-btn" onClick={() => setShowTerms(false)}>Close</button>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="modal-overlay" onClick={() => setShowFAQ(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Frequently Asked Questions</h2>
            <div className="faq-item">
              <h4>📖 How do I order a book?</h4>
              <p>Select your books, add to cart, and proceed to checkout.</p>
            </div>
            <div className="faq-item">
              <h4>🚚 How do I receive the book?</h4>
              <p>Currently, we offer in-store pickup. You'll receive a claim code after ordering.</p>
            </div>
            <div className="faq-item">
              <h4>🔁 What is the return policy?</h4>
              <p>You can return within 7 days if the book is damaged or incorrect.</p>
            </div>
            <button className="close-btn" onClick={() => setShowFAQ(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-overlay" onClick={() => setShowPrivacy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Privacy Policy</h2>
            <p>
              At Pushtak Bhandar, we value your privacy. Here's how we protect your data:
              <br /><br />
              • We collect only essential personal information (like email, name) for order processing.  
              <br />
              • Your data is never sold or shared with third parties without consent.  
              <br />
              • All transactions are secured using standard encryption protocols.  
              <br />
              • You may request to view, update, or delete your data anytime.  
              <br /><br />
              By using our services, you consent to our privacy practices.
            </p>
            <button className="close-btn" onClick={() => setShowPrivacy(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
