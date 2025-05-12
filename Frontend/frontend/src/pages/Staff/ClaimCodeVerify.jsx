import React, { useState } from 'react';
import { X, Check, RefreshCw, Tag, User, Clock, Mail, Package, DollarSign } from 'lucide-react';
import api from '../../api/api';
import '../../styles/Claim.css';

export default function ClaimCodeVerify() {
  const [claimCode, setClaimCode] = useState('');
  const [order, setOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const verifyClaimCode = async () => {
    if (!claimCode.trim()) {
      setMessage('Please enter a claim code');
      setMessageType('error');
      return;
    }
    
    try {
      setMessage('Verifying claim code...');
      setMessageType('info');
      
      const res = await api.post('/staff/orders/verify', { claimCode });

      // Fetch image for each book
      const itemsWithImages = await Promise.all(
        res.data.items.map(async (item) => {
          try {
            const bookRes = await api.get(`/Book/${item.bookId}`);
            console.log('Book details: ', bookRes.data);
            return {
              ...item,
              imageUrl: `http://localhost:5046${bookRes.data.imageUrl}`
            };
          } catch (err) {
            console.error('Failed to fetch book image:', err);
            return { ...item, imageUrl: null };
          }
        })
      );

      const enrichedOrder = { ...res.data, items: itemsWithImages };
      setOrder(enrichedOrder);
      setModalOpen(true);
      setMessage('');
    } catch (err) {
      console.error('Verification error:', err);
      setOrder(null);
      setMessage('Invalid claim code or order not found');
      setMessageType('error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      verifyClaimCode();
    }
  };

  const updateOrderStatus = async (newStatus) => {
    if (!order) return;
    setProcessing(true);
    try {
      await api.put('/staff/orders/status', {
        claimCode: order.claimCode,
        newStatus
      });
      setOrder({ ...order, status: newStatus });
      setMessage(`Order successfully ${newStatus === 'Completed' ? 'processed' : 'cancelled'}`);
      setMessageType('success');
    } catch (err) {
      console.error('Status update error:', err);
      setMessage('Failed to update order status');
      setMessageType('error');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return { backgroundColor: '#666' };
      case 'Completed':
        return { backgroundColor: '#000' };
      case 'Cancelled':
        return { backgroundColor: '#333' };
      default:
        return { backgroundColor: '#999' };
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="claim-code-container">
      <div className="claim-header">
        <h2>Claim Code Verification</h2>
        <p>Enter the order claim code to process customer orders</p>
      </div>
      
      <div className="claim-input-group">
        <input
          type="text"
          value={claimCode}
          onChange={(e) => setClaimCode(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter claim code..."
          className="claim-input"
        />
        <button 
          onClick={verifyClaimCode} 
          className="verify-buttons"
        >
          Verify
        </button>
      </div>

      {message && (
        <div className={`message-box ${messageType}`}>
          {message}
        </div>
      )}

      {/* Order Modal */}
      {modalOpen && order && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Order Details</h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="close-button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="order-details">
              <div className="detail-row">
                <div className="detail-item">
                  <div className="detail-label">
                    <Package size={16} />
                    <span>Order ID</span>
                  </div>
                  <div className="detail-value">{order.orderId}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <Tag size={16} />
                    <span>Claim Code</span>
                  </div>
                  <div className="detail-value">{order.claimCode}</div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <div className="detail-label">
                    <Mail size={16} />
                    <span>Customer Email</span>
                  </div>
                  <div className="detail-value">{order.userEmail}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <Clock size={16} />
                    <span>Order Date</span>
                  </div>
                  <div className="detail-value">{formatDate(order.orderedAt)}</div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-item">
                  <div className="detail-label">
                    <DollarSign size={16} />
                    <span>Total Amount</span>
                  </div>
                  <div className="detail-value highlight">${order.totalAmount.toFixed(2)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <RefreshCw size={16} />
                    <span>Status</span>
                  </div>
                  <div className="detail-value">
                    <span 
                      className="status-pill" 
                      style={getStatusStyle(order.status)}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-items">
              <h4>Order Items</h4>
              <div className="items-grid">
                {order.items.map((item, index) => (
                  <div key={index} className="item-card">
                    <div className="item-image">
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/80x100?text=No+Image'}
                        alt={item.title}
                      />
                    </div>
                    <div className="item-details">
                      <h5>{item.title}</h5>
                      <div className="item-meta">
                        <span>Qty: {item.quantity}</span>
                        <span>${item.unitPrice.toFixed(2)} each</span>
                      </div>
                      <div className="item-total">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.status === 'Pending' ? (
              <div className="action-buttons">
                <button
                  onClick={() => updateOrderStatus('Cancelled')}
                  disabled={processing}
                  className="cancel-button"
                >
                  {processing ? <RefreshCw className="spin-icon" /> : <X size={16} />}
                  <span>Cancel Order</span>
                </button>
                <button
                  onClick={() => updateOrderStatus('Completed')}
                  disabled={processing}
                  className="process-button"
                >
                  {processing ? <RefreshCw className="spin-icon" /> : <Check size={16} />}
                  <span>Process Order</span>
                </button>
              </div>
            ) : (
              <div className={`status-message ${order.status.toLowerCase()}`}>
                {order.status === 'Completed' 
                  ? '✓ This order has been processed successfully' 
                  : '× This order has been cancelled'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}