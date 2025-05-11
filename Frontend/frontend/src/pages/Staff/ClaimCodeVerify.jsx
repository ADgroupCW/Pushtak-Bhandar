import React, { useState } from 'react';
import api from '../../api/api';
import { X, Check, RefreshCw, Tag, User, Clock, Mail } from 'lucide-react';

export default function ClaimCodeVerify() {
  const [claimCode, setClaimCode] = useState('');
  const [order, setOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const verifyClaimCode = async () => {
    try {
      setMessage('');
      const res = await api.post('/staff/orders/verify', { claimCode });

      // Fetch image for each book
      const itemsWithImages = await Promise.all(
        res.data.items.map(async (item) => {
            try {
            const bookRes = await api.get(`/Book/${item.bookId}`);
            console.log('Book details: ',bookRes.data)
            return {
                ...item,
                imageUrl: `http://localhost:5046${bookRes.data.imageUrl}` // ✅ full image path
            };
            } catch {
            return { ...item, imageUrl: null };
            }
        })
        );


      const enrichedOrder = { ...res.data, items: itemsWithImages };
      setOrder(enrichedOrder);
      setModalOpen(true);
    } catch (err) {
      setOrder(null);
      setMessage('Invalid or not found.');
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
      setMessage(`Order updated to ${newStatus}.`);
    } catch {
      setMessage('Failed to update order status.');
    } finally {
      setProcessing(false);
    }
  };

  const statusColor = {
    Pending: '#ffc107',
    Completed: '#28a745',
    Cancelled: '#dc3545'
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🔍 Claim Code Verification</h2>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem' }}>
        <input
          value={claimCode}
          onChange={(e) => setClaimCode(e.target.value)}
          placeholder="Enter claim code..."
          style={{ flex: 1, padding: '10px', fontSize: '16px' }}
        />
        <button onClick={verifyClaimCode} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px' }}>
          Verify
        </button>
      </div>

      {message && <p style={{ backgroundColor: '#ffeeba', padding: '10px', borderRadius: '6px' }}>{message}</p>}

      {/* Modal */}
      {modalOpen && order && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Order #{order.orderId}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px' }}><X /></button>
            </div>

            <div style={{ margin: '10px 0' }}>
              <p><Tag size={16} /> <strong>Claim Code:</strong> {order.claimCode}</p>
              <p><Clock size={16} /> <strong>Ordered At:</strong> {new Date(order.orderedAt).toLocaleString()}</p>
              <p><Mail size={16} /> <strong>Email:</strong> {order.userEmail}</p>
              <p>
                <strong>Status:</strong>
                <span style={{
                  backgroundColor: statusColor[order.status] || '#ccc',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '10px',
                  marginLeft: '8px',
                  fontSize: '13px'
                }}>{order.status}</span>
              </p>
            </div>

            <h4>Items:</h4>
            <div style={styles.itemsGrid}>
              {order.items.map((item, i) => (
                <div key={i} style={styles.itemCard}>
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/80x100?text=No+Image'}
                    alt={item.title}
                    style={styles.bookImg}
                    />

                  <div>
                    <p><strong>{item.title}</strong></p>
                    <p>Qty: {item.quantity}</p>
                    <p>Unit: ${item.unitPrice.toFixed(2)}</p>
                    <p><strong>Total: ${(item.unitPrice * item.quantity).toFixed(2)}</strong></p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
              <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
            </div>

            {order.status === 'Pending' && (
              <div style={styles.actionRow}>
                <button
                  onClick={() => updateOrderStatus('Cancelled')}
                  disabled={processing}
                  style={{ ...styles.button, backgroundColor: '#dc3545' }}
                >
                  {processing ? <RefreshCw className="icon-spin" /> : <X />} Cancel
                </button>
                <button
                  onClick={() => updateOrderStatus('Completed')}
                  disabled={processing}
                  style={{ ...styles.button, backgroundColor: '#28a745' }}
                >
                  {processing ? <RefreshCw className="icon-spin" /> : <Check />} Process
                </button>
              </div>
            )}

            {order.status !== 'Pending' && (
              <p style={{
                color: order.status === 'Completed' ? '#28a745' : '#dc3545',
                marginTop: '1rem',
                fontWeight: 'bold'
              }}>
                {order.status === 'Completed' ? '✅ Order has been processed.' : '❌ Order has been cancelled.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999,
    display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    width: '600px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  itemsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '10px'
  },
  itemCard: {
    display: 'flex',
    gap: '12px',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '8px',
    backgroundColor: '#f8f8f8'
  },
  bookImg: {
    width: '80px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: '1.5rem'
  },
  button: {
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }
};
