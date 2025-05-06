// components/FaqModal.jsx
import React from 'react';
import '../styles/Modal.css'; 

const FaqModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✖</button>
        <h2>Frequently Asked Questions (FAQ)</h2>
        <div className="faq-item">
          <h4>📦 How do I place an order?</h4>
          <p>Browse the books you like, add them to your cart, and proceed to checkout. You will receive a confirmation email after a successful order.</p>
        </div>
        <div className="faq-item">
          <h4>🚚 What is the delivery timeline?</h4>
          <p>We currently offer in-store pickup only. Orders are usually ready within 1–2 business days.</p>
        </div>
        <div className="faq-item">
          <h4>🔁 Can I return a book?</h4>
          <p>Yes, you may return a book within 7 days if it is damaged or incorrect, along with proof of the issue.</p>
        </div>
        <div className="faq-item">
          <h4>👤 Do I need an account to order?</h4>
          <p>Yes, registering as a member allows you to place orders, track purchases, and save favorites.</p>
        </div>
        <div className="faq-item">
          <h4>💳 What payment methods are supported?</h4>
          <p>We accept digital wallet and card payments securely via our integrated payment gateway.</p>
        </div>
      </div>
    </div>
  );
};

export default FaqModal;
