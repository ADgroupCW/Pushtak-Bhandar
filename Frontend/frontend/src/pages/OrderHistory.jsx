import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/POrderHistory.css';

const POrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/order/my-orders');
      const enrichedOrders = await Promise.all(
        (res.data || []).map(async (order) => {
          const itemsWithDetails = await Promise.all(
            order.items.map(async (item) => {
              try {
                const bookRes = await api.get(`/book/${item.bookId}`);
                return {
                  ...item,
                  imageUrl: bookRes.data.imageUrl,
                  author: bookRes.data.author,
                };
              } catch {
                return item; // fallback to item if book fetch fails
              }
            })
          );
          return { ...order, items: itemsWithDetails };
        })
      );
      setOrders(enrichedOrders);
    } catch (err) {
      alert('Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.put(`/order/${orderId}`);
      fetchOrders();
    } catch {
      alert('Failed to cancel order.');
    }
  };

  return (
    <div className="order-page">
      <Navbar />
      <div className="order-container">
        <h2>📦 My Orders</h2>
        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map(order => (
            <div className="order-card" key={order.orderId}>
              <h4>Order ID: {order.orderId}</h4>
              <p>Status: <strong>{order.status}</strong></p>
              <p>Claim Code: {order.claimCode}</p>
              <p>Placed on: {new Date(order.orderedAt).toLocaleString()}</p>
              <p>Total: ${order.totalAmount?.toFixed(2) ?? '0.00'}</p>
              <ul className="order-items">
                {order.items.map(item => (
                  <li key={item.bookId}>
                    <div className="order-item-info">
                      <img
                        src={
                          item.imageUrl?.startsWith('http')
                            ? item.imageUrl
                            : `http://localhost:5046${item.imageUrl}`
                        }
                        alt={item.title}
                        className="order-item-img"
                      />
                      <div>
                        <p><strong>{item.title}</strong> by {item.author ?? 'Unknown'}</p>
                        <p>Qty: {item.quantity} × ${item.unitPrice?.toFixed(2) ?? '0.00'}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {order.status === 'Pending' && (
                <button onClick={() => handleCancel(order.orderId)} className="cancel-btn">
                  ❌ Cancel Order
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
};

export default POrderHistory;
