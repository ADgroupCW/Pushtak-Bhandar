import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/Home.css';

// Import images
import bg from '../assets/bg.jpg';
import awardImg from '../assets/award.jpg';
import bestsellerImg from '../assets/bestseller.jpg';
import dealImg from '../assets/deal.jpg';
import book1 from '../assets/book1.jpg';
import book2 from '../assets/book2.jpg';
import book3 from '../assets/book3.jpg';
// Add more book images as needed
import authorImg from '../assets/author.jpg'; // Add this image to your assets

const Home = () => {
  // Featured books data
  const featuredBooks = [
    { id: 1, title: "Project Hail Mary", author: "Andy Weir", price: 29.99, image: book1, rating: 4.8 },
    { id: 2, title: "The Last House on Needless Street", author: "Catriona Ward", price: 27.99, image: book2, rating: 4.5 },
    { id: 3, title: "Malibu Rising", author: "Taylor Jenkins Reid", price: 19.99, image: book3, rating: 4.7 }
  ];

  // State for newsletter subscription
  const [email, setEmail] = useState('');
  
  // State for testimonials carousel
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const testimonials = [
    { name: "Priya Sharma", text: "Pushtak Bhandar has the best collection of books I've ever seen. Their customer service is exceptional!" },
    { name: "Rahul Verma", text: "I love the exclusive discounts and the variety of books available. Will definitely shop again!" },
    { name: "Ananya Patel", text: "The delivery was quick and the books were in perfect condition. Highly recommend!" }
  ];

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Newsletter form handler
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
  };

  // Rating stars component
  const RatingStars = ({ rating }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return <div className="rating">{stars}</div>;
  };

  return (
    <div className="home-container">
      <Navbar />

      {/* Hero Section with Animation */}
      <div className="hero-section" style={{ backgroundImage: `url(${bg})` }}>
        <div className="hero-content fade-in">
          <h1>
            Welcome to <span className="brand-name">Pushtak Bhandar</span>
          </h1>
          <p className="hero-tagline">Your Gateway to Literary Excellence</p>
          <p className="hero-description">
            Discover a world of literary treasures at Pushtak Bhandar.
            Browse our extensive collection, find books by your favorite author or genre, 
            and enjoy exclusive member discounts.
          </p>
          <div className="hero-buttons">
            <button className="explore-btn pulse">Explore Collection</button>
            <button className="membership-btn">Join Membership</button>
          </div>
        </div>
      </div>

      {/* Quick Search Section */}
      <div className="quick-search">
        <div className="search-container">
          <input type="text" placeholder="Search by title, author, or ISBN..." />
          <select>
            <option value="">All Categories</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="children">Children</option>
            <option value="academic">Academic</option>
          </select>
          <button className="search-btn">Search</button>
        </div>
      </div>

      {/* Categories with Hover Effects */}
      <section className="categories-section">
        <h2 className="section-title">Explore Categories</h2>
        <div className="categories-grid">
          <div className="category" style={{ backgroundImage: `url(${awardImg})` }}>
            <div className="category-overlay">
              <h2>Award Winners</h2>
              <p>Discover critically acclaimed literary masterpieces</p>
              <button>Shop Now</button>
            </div>
          </div>
          <div className="category" style={{ backgroundImage: `url(${bestsellerImg})` }}>
            <div className="category-overlay">
              <h2>Bestsellers</h2>
              <p>Explore our most popular books this season</p>
              <button>Shop Now</button>
            </div>
          </div>
          <div className="category" style={{ backgroundImage: `url(${dealImg})` }}>
            <div className="category-overlay">
              <h2>Special Deals</h2>
              <p>Limited time offers you don't want to miss</p>
              <button>Shop Now</button>
            </div>
          </div>
          <div className="category new-releases">
            <div className="category-overlay">
              <h2>New Releases</h2>
              <p>Fresh off the press and ready for your bookshelf</p>
              <button>Shop Now</button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books with Enhanced UI */}
      <section className="featured-section">
        <h2 className="section-title">Featured Books</h2>
        <div className="book-list">
          {featuredBooks.map((book) => (
            <div className="book-card" key={book.id}>
              <div className="book-image-container">
                <img src={book.image} alt={book.title} />
                <div className="book-overlay">
                  <button className="quick-view">Quick View</button>
                </div>
              </div>
              <div className="book-details">
                <h4>{book.title}</h4>
                <p className="book-author">by {book.author}</p>
                <RatingStars rating={book.rating} />
                <div className="book-price-container">
                  <p className="book-price">${book.price.toFixed(2)}</p>
                  <button className="add-to-cart">Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all-container">
          <button className="view-all-btn">View All Books</button>
        </div>
      </section>

      {/* Author of the Month */}
      <section className="author-section">
        <div className="author-content">
          <div className="author-image">
            <img src={authorImg} alt="Author of the Month" />
          </div>
          <div className="author-details">
            <h2>Author of the Month</h2>
            <h3>Arundhati Roy</h3>
            <p>
              Known for her poetic prose and political activism, Arundhati Roy has captivated readers
              worldwide with her stunning debut novel "The God of Small Things," which won the prestigious
              Booker Prize. Her works explore themes of social justice, environmental issues, and human rights.
            </p>
            <button className="author-btn">Explore Her Books</button>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Readers Say</h2>
        <div className="testimonials-container">
          <div className="testimonial-card">
            <p className="testimonial-text">"{testimonials[currentTestimonial].text}"</p>
            <p className="testimonial-author">— {testimonials[currentTestimonial].name}</p>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <span 
                key={index} 
                className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Promo Banner */}
      <div className="promo-banner">
        <div className="promo-content">
          <h2>Unlock Exclusive Discounts</h2>
          <p>
            Join our community of book lovers and enjoy special discounts on your favorite titles.
            Get up to <span className="highlight">30% off</span> on bestsellers and free shipping on orders over $35!
          </p>
          <div className="promo-buttons">
            <button className="view-offers-btn">View Offers</button>
            <button className="learn-more-btn">Learn More</button>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for new releases, author interviews, and exclusive offers.</p>
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;