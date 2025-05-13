import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/POrderHistory.css';
import {jwtDecode} from 'jwt-decode';


const POrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    fetchOrders();
  }, []);



const fetchOrders = async () => {
  try {
    // 🔐 Get user ID from token
    const token = localStorage.getItem('token');
    let currentUserId = null;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        currentUserId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        console.log(" Decoded User ID:", currentUserId);
      } catch (err) {
        console.error(" Failed to decode token:", err);
      }
    }

    if (!currentUserId) {
      console.warn(" No valid user ID found in token.");
      return;
    }

    const res = await api.get('/order/my-orders');

    const enrichedOrders = await Promise.all(
      (res.data || []).map(async (order) => {
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            try {
              const bookRes = await api.get(`/book/${item.bookId}`);

              let review = null;
              try {
                const reviewRes = await api.get(`/reviews/book/${item.bookId}`);
                review = reviewRes.data.find(r => r.userId === currentUserId) || null;

                if (review) {
                  console.log(` [USER REVIEW] Book ID: ${item.bookId}, User ID: ${currentUserId}`);
                  console.log(" Review:", review);
                } else {
                  console.log(`[NO REVIEW] Book ID: ${item.bookId}, User ID: ${currentUserId}`);
                }
              } catch (reviewErr) {
                console.warn(`Failed to fetch reviews for Book ${item.bookId}`, reviewErr);
              }

              return {
                ...item,
                imageUrl: bookRes.data.imageUrl,
                author: bookRes.data.author,
                rating: review?.rating ?? 0,
                comment: review?.comment ?? '',
                alreadyReviewed: !!review,
                unitPrice: bookRes.data.isOnSale ? bookRes.data.price : bookRes.data.originalPrice,
              };
            } catch (err) {
              console.error(` Failed to fetch book details for Book ID: ${item.bookId}`, err);
              return { ...item, rating: 0, comment: '', alreadyReviewed: false };
            }
          })
        );
        return { ...order, items: itemsWithDetails };
      })
    );

    setOrders(enrichedOrders);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    alert('Failed to fetch orders.');
  } finally {
    setLoading(false);
  }
};





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
      alert(' Review submitted!');
    } catch {
      alert(' Failed to submit review.');
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
                        {item.alreadyReviewed && (
                          <div className="already-reviewed">
                            <p>You previously reviewed this book:</p>
                            <p><strong>Rating:</strong> {item.rating} / 5</p>
                            <p><strong>Comment:</strong> “{item.comment}”</p>
                            <hr />
                            <p>Want to update your review?</p>
                          </div>
                        )}

                        {/* Always show review form, even if already reviewed */}
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
                  Cancel Order
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
