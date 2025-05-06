import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/Cart.css';
import book1Img from '../assets/book1.jpg';
import book2Img from '../assets/book2.jpg';

const Cart = () => {
  const cartItems = [
    {
      id: 1,
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      price: 24.99,
      quantity: 1,
      image: book1Img
    },
    {
      id: 2,
      title: 'The Vanishing Half',
      author: 'Brit Bennett',
      price: 25.99,
      quantity: 2,
      image: book2Img
    }
  ];
  

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-wrapper">
        <h2 className="cart-title">🛒 My Cart</h2>
        <div className="cart-content">
          {/* Left: Item List */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div className="cart-item-card" key={item.id}>
                <img src={item.image} alt={item.title} className="item-image" />
                <div className="item-details">
                  <h4>{item.title}</h4>
                  <p>Author: {item.author}</p>
                  <p>Price: ${item.price.toFixed(2)}</p>
                  <div className="item-actions">
                    <label>Quantity: </label>
                    <select defaultValue={item.quantity}>
                      {[1, 2, 3, 4, 5].map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                    <button className="item-remove">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Summary Box */}
          <div className="cart-summary">
            <div className="promo-code">
              <label htmlFor="promo">Enter Promo Code</label>
              <div className="promo-input-group">
                <input type="text" id="promo" placeholder="Promo Code" />
                <button className="apply-btn">Submit</button>
              </div>
            </div>
            <div className="summary-box">
              <p>Shipping: <span>TBD</span></p>
              <p>Discount: <span>-$0.00</span></p>
              <p>Tax: <span>TBD</span></p>
              <hr />
              <h3>Estimated Total: <span>${total.toFixed(2)}</span></h3>
              <button className="checkout-btn">Checkout</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
