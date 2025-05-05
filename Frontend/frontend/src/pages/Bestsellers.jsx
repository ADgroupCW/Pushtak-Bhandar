import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import '../styles/Bestseller.css';

const BestOfTheBest = () => {
  // Featured books data with expanded information
  const featuredBooks = [
    {
      id: 1,
      title: "The Silent Patient",
      author: "Alex Michaelides",
      price: 24.99,
      rating: 4.8,
      reviews: 12453,
      image: require('../assets/book1.jpg'),
      description: "A psychological thriller that delivers a shocking ending. This #1 New York Times bestseller follows a woman's act of violence against her husband and her subsequent silence.",
      category: "Thriller",
      awards: ["Goodreads Choice Award for Mystery & Thriller", "Barnes & Noble's Thriller of the Year"]
    },
    {
      id: 2,
      title: "The Vanishing Half",
      author: "Brit Bennett",
      price: 25.99,
      rating: 4.7,
      reviews: 9872,
      image: require('../assets/book2.jpg'),
      description: "A stunning novel about twin sisters, inseparable as children, who ultimately choose to live in two very different worlds, one black and one white.",
      category: "Literary Fiction",
      awards: ["National Book Critics Circle Award Finalist", "New York Times 10 Best Books of 2020"]
    },
    {
      id: 3,
      title: "Where the Crawdads Sing",
      author: "Delia Owens",
      price: 22.99,
      rating: 4.9,
      reviews: 18542,
      image: require('../assets/book3.jpg'),
      description: "A heartbreaking coming-of-age story and a surprising murder investigation. This #1 New York Times bestseller is at once an exquisite ode to the natural world and a profound coming-of-age story.",
      category: "Fiction",
      awards: ["Goodreads Choice Award for Best Historical Fiction", "Edgar Award Nominee"]
    },
    {
      id: 4,
      title: "The Midnight Library",
      author: "Matt Haig",
      price: 19.99,
      rating: 4.6,
      reviews: 8743,
      image: require('../assets/book1.jpg'),
      description: "Between life and death there is a library with infinite books, each containing a different version of your life. A novel about regret, hope, and second chances.",
      category: "Fantasy",
      awards: ["Goodreads Choice Award for Fiction", "Waterstones Book of the Year Nominee"]
    },
    {
      id: 5,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      price: 17.99,
      rating: 4.5,
      reviews: 24813,
      image: require('../assets/book2.jpg'),
      description: "The Great American Novel that captures the essence of the Jazz Age. A tragic love story that has become a literary classic throughout generations.",
      category: "Classic",
      awards: ["Modern Library's 100 Best Novels", "TIME Magazine's All-Time 100 Novels"]
    },
    {
      id: 6,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      price: 18.50,
      rating: 4.9,
      reviews: 32541,
      image: require('../assets/book3.jpg'),
      description: "A gripping, heart-wrenching, and uplifting tale of coming-of-age in a South poisoned by virulent prejudice. A timeless classic that has never been out of print.",
      category: "Classic",
      awards: ["Pulitzer Prize for Fiction", "Presidential Medal of Freedom"]
    }
  ];

  // State for active filter
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter books based on selected category
  const filteredBooks = activeFilter === 'all' 
    ? featuredBooks 
    : featuredBooks.filter(book => book.category.toLowerCase() === activeFilter);

  return (
    <>
      <Navbar />
      <div className="best-of-best-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Best of the Best</h1>
            <p>Discover our most acclaimed and celebrated literary masterpieces</p>
          </div>
        </div>

        <div className="filters-section">
          <button 
            className={activeFilter === 'all' ? 'active' : ''} 
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={activeFilter === 'fiction' ? 'active' : ''} 
            onClick={() => setActiveFilter('fiction')}
          >
            Fiction
          </button>
          <button 
            className={activeFilter === 'thriller' ? 'active' : ''} 
            onClick={() => setActiveFilter('thriller')}
          >
            Thriller
          </button>
          <button 
            className={activeFilter === 'classic' ? 'active' : ''} 
            onClick={() => setActiveFilter('classic')}
          >
            Classic
          </button>
          <button 
            className={activeFilter === 'fantasy' ? 'active' : ''} 
            onClick={() => setActiveFilter('fantasy')}
          >
            Fantasy
          </button>
        </div>

        <div className="books-showcase">
          {filteredBooks.map(book => (
            <div className="premium-book-card" key={book.id}>
              <div className="book-image-container">
                <img src={book.image} alt={book.title} />
                <div className="book-overlay">
                  <button className="quick-view-btn">Quick View</button>
                </div>
              </div>
              <div className="book-details">
                <h3>{book.title}</h3>
                <p className="author">by {book.author}</p>
                <div className="rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(book.rating) ? "star filled" : "star"}>★</span>
                    ))}
                  </div>
                  <span className="review-count">({book.reviews.toLocaleString()} reviews)</span>
                </div>
                <p className="description">{book.description}</p>
                <div className="awards">
                  <h4>Awards:</h4>
                  <ul>
                    {book.awards.map((award, index) => (
                      <li key={index}>{award}</li>
                    ))}
                  </ul>
                </div>
                <div className="book-actions">
                  <span className="price">${book.price.toFixed(2)}</span>
                  <button className="add-to-cart-btn">Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="subscription-banner">
          <div className="banner-content">
            <h2>Join Our Premium Readers Club</h2>
            <p>Get early access to our most celebrated titles and exclusive author interviews.</p>
            <form className="subscribe-form">
              <input type="email" placeholder="Your email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BestOfTheBest;