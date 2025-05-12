// Import core modules
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/POrderHistory.css';

const POrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // On mount, fetch orders
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
                  rating: 0,
                  comment: ''
                };
              } catch {
                return { ...item, rating: 0, comment: '' };
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
  // Update rating in local state
  const handleRating = (orderId, bookId, rating) => {
    setOrders(prev =>
      prev.map(order =>
        order.orderId === orderId
          ? {
              ...order,
              items: order.items.map(item =>
                item.bookId === bookId ? { ...item, rating } : item
              )
            }
          : order
      )
    );
  };
  // Submit review to backend
  const handleCommentChange = (orderId, bookId, comment) => {
    setOrders(prev =>
      prev.map(order =>
        order.orderId === orderId
          ? {
              ...order,
              items: order.items.map(item =>
                item.bookId === bookId ? { ...item, comment } : item
              )
            }
          : order
      )
    );
  };

  const submitReview = async (bookId, rating, comment) => {
    try {
      await api.post('/reviews', { bookId, rating, comment });
      alert('✅ Review submitted!');
    } catch {
      alert('❌ Failed to submit review.');
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

                    {order.status === 'Completed' && (
                      <div className="review-section">
                        <div className="stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              className={item.rating >= star ? 'filled-star' : 'empty-star'}
                              onClick={() => handleRating(order.orderId, item.bookId, star)}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <textarea
                          placeholder="Write your review..."
                          value={item.comment}
                          onChange={(e) => handleCommentChange(order.orderId, item.bookId, e.target.value)}
                        />
                        <button
                          className="review-submit-btn"
                          onClick={() => submitReview(item.bookId, item.rating, item.comment)}
                        >
                          Submit Review
                        </button>
                      </div>
                    )}
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
