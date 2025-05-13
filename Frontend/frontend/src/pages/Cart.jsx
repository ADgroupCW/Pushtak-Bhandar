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
              book: bookRes.data,
              unitPrice: bookRes.data.isOnSale ? bookRes.data.price : bookRes.data.originalPrice
            };
          } catch (err) {
            console.error(`Failed to fetch book ${item.bookId}`, err);
            return { ...item, book: null }; // fallback if book fetch fails
          }
        })
      );
      console.log(enrichedItems);
      setCartItems(enrichedItems);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      alert(' Please log in to view your cart.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      fetchCart();
    } catch (err) {
      alert(' Failed to update quantity.');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (err) {
      alert(' Failed to remove item.');
    }
  };

  const clearCart = async () => {
  try {
    await api.delete('/cart/clear');
    setCartItems([]); // clear immediately from UI
    setTimeout(() => {
      fetchCart();     // refresh to confirm
    }, 300);
  } catch (err) {
    const status = err.response?.status;
    if (status !== 400 && status !== 404) {
      alert('Failed to clear cart.');
    } else {
      console.warn('Cart was already cleared or not found.');
    }
  }
};


  const handleCheckout = async () => {
    try {
      const itemIds = cartItems.map(item => item.id);
      console.log('Order Payload', {
        totalAmount: total.toFixed(2),
        items: cartItems.map(item => ({
          bookId: item.bookId,
          title: item.book?.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });
      await api.post('/order', { cartItemIds: itemIds });
      setOrderSuccess(true);
      setCartItems([]);
    } catch (err) {
      alert(' Failed to place order.');
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.unitPrice * item.quantity);
  }, 0);

  if (loading) return (
    <div className="cart-page">
      <Navbar />
      <div className="loader-container">
        <div className="loader"></div>
        <p>Loading your cart...</p>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-container">
        <header className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="cart-count">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</span>
        </header>

        {orderSuccess && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            <p>Order successfully placed! Please check your email for your claim code.</p>
          </div>
        )}

        <div className="cart-content">
          {/* Cart Items */}
          <section className="cart-items-section">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <span className="empty-cart-icon">🛒</span>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any books to your cart yet.</p>
              </div>
            ) : (
              <>
                <div className="cart-header-row">
                  <span className="header-product">Product</span>
                  <span className="header-price">Price</span>
                  <span className="header-quantity">Quantity</span>
                  <span className="header-total">Total</span>
                  <span className="header-actions"></span>
                </div>
                
                {cartItems.map(item => (
                  <div className="cart-item" key={item.id}>
                    <div className="item-product">
                      {item.book ? (
                        <img
                          src={item.book.imageUrl?.startsWith('http')
                            ? item.book.imageUrl
                            : `http://localhost:5046${item.book.imageUrl}`}
                          alt={item.book.title}
                          className="item-image"
                        />
                      ) : (
                        <div className="item-image-placeholder">No Image</div>
                      )}
                      <div className="item-info">
                        <h3>{item.book?.title || 'Unknown Book'}</h3>
                        <p className="item-author">By {item.book?.author || 'Unknown Author'}</p>
                      </div>
                    </div>
                    
                    <div className="item-price">
                      {item.book?.isOnSale ? (
                        <>
                          <span className="sale-price">${item.unitPrice.toFixed(2)}</span>
                          <span className="original-price">${item.book.originalPrice.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="sale-price">${item.book.originalPrice.toFixed(2)}</span>
                      )}
                    </div>


                    
                    <div className="item-quantity-buttons">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        –
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    
                    <div className="item-total">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        className="remove-button" 
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>

          {/* Cart Summary */}
          <section className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-actions">
              <button 
                className="checkout-button" 
                onClick={handleCheckout} 
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
              <button 
                className="clear-button" 
                onClick={clearCart} 
                disabled={cartItems.length === 0}
              >
                Clear Cart
              </button>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;