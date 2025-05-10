import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import api from '../api/api';
import '../styles/Cart.css';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cart/my');
      const basicItems = res.data || [];

      const enrichedItems = await Promise.all(
        basicItems.map(async (item) => {
          try {
            const bookRes = await api.get(`/book/${item.bookId}`);
            return {
              ...item,
              book: bookRes.data
            };
          } catch (err) {
            console.error(`Failed to fetch book ${item.bookId}`, err);
            return { ...item, book: null }; // fallback if book fetch fails
          }
        })
      );

      setCartItems(enrichedItems);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      alert('❌ Please log in to view your cart.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      fetchCart();
    } catch (err) {
      alert('❌ Failed to update quantity.');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (err) {
      alert('❌ Failed to remove item.');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      fetchCart();
    } catch (err) {
      alert('❌ Failed to clear cart.');
    }
  };

  const handleCheckout = async () => {
    try {
      const itemIds = cartItems.map(item => item.id);
      await api.post('/order', { cartItemIds: itemIds });
      setOrderSuccess(true);
      await clearCart();
    } catch (err) {
      alert('❌ Failed to place order.');
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity);
  }, 0);

  if (loading) return <div className="cart-page"><Navbar /><p>Loading cart...</p></div>;

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-wrapper">
        <h2 className="cart-title">🛒 My Cart</h2>

        {orderSuccess && (
          <div className="success-message">
            ✅ Order placed! Please check your email for your claim code.
          </div>
        )}

        <div className="cart-content">
          {/* Item List */}
          <div className="cart-items">
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cartItems.map(item => (
                <div className="cart-item-card" key={item.id}>
                  {item.book ? (
                    <img
                      src={item.book.imageUrl?.startsWith('http')
                        ? item.book.imageUrl
                        : `http://localhost:5046${item.book.imageUrl}`}
                      alt={item.book.title}
                      className="item-image"
                    />
                  ) : (
                    <div className="item-placeholder">No Image</div>
                  )}

                  <div className="item-details">
                    <h4>{item.book?.title || 'Unknown Book'}</h4>
                    <p>Author: {item.book?.author || 'N/A'}</p>
                    <p>Price: ${item.unitPrice?.toFixed(2) || '0.00'}</p>
                    <div className="item-actions">
                      <label>Qty:</label>
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5].map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                      <button className="item-remove" onClick={() => removeItem(item.id)}>❌</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="summary-box">
              <p>Total Items: <span>{cartItems.length}</span></p>
              <p>Estimated Total: <span>${total.toFixed(2)}</span></p>
              <hr />
              <button className="checkout-btn" onClick={handleCheckout} disabled={cartItems.length === 0}>
                ✅ Checkout
              </button>
              <button className="clear-btn" onClick={clearCart} disabled={cartItems.length === 0}>
                🧹 Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
