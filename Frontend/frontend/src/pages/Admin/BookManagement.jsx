import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import '../../styles/BookManagement.css';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('/api/book');
      setBooks(res.data);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`/api/book/${id}`);
      fetchBooks();
    } catch (err) {
      alert('Error deleting book');
    }
  };

  const openForm = (mode, book = null) => {
    setFormMode(mode);
    setSelectedBook(book);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = {
      title: form.title.value,
      author: form.author.value,
      isbn: form.isbn.value,
      language: form.language.value,
      publicationDate: form.publicationDate.value,
      price: parseFloat(form.price.value),
      originalPrice: parseFloat(form.originalPrice.value || 0),
      stockCount: parseInt(form.stockCount.value),
      isAvailableInStore: form.isAvailableInStore.checked,
      isOnSale: form.isOnSale.checked,
      saleStartDate: form.saleStartDate.value || null,
      saleEndDate: form.saleEndDate.value || null,
      imageUrl: form.imageUrl.value,
      genreId: parseInt(form.genreId.value),
      publisherId: parseInt(form.publisherId.value),
    };

    try {
      if (formMode === 'add') {
        await axios.post('/api/book', formData);
      } else {
        await axios.put(`/api/book/${selectedBook.id}`, formData);
      }
      fetchBooks();
      setShowForm(false);
    } catch (err) {
      alert('Error submitting form');
    }
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="book-management">
          <h2>📚 Manage Books</h2>

          <div className="book-management-topbar">
            <input
              type="text"
              placeholder="Search by title or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search books"
            />
            <button className="btn primary" onClick={() => openForm('add')}>
              ➕ Add Book
            </button>
          </div>

          <table className="book-management-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title & Author</th>
                <th>Price</th>
                <th>Language</th>
                <th>Stock</th>
                <th>Sale</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    <img
                      src={book.imageUrl || 'https://via.placeholder.com/40x60'}
                      alt={book.title}
                      width="40"
                    />
                  </td>
                  <td>
                    <strong>{book.title}</strong>
                    <br />
                    <small>{book.author}</small>
                  </td>
                  <td>
                    {book.isOnSale ? (
                      <>
                        <span className="strikethrough">${book.originalPrice}</span>{' '}
                        <strong className="sale">${book.price}</strong>
                      </>
                    ) : (
                      <>${book.price}</>
                    )}
                  </td>
                  <td>{book.language}</td>
                  <td>{book.stockCount}</td>
                  <td>{book.isOnSale ? '🔥' : '-'}</td>
                  <td>
                    <button className="btn" onClick={() => openForm('edit', book)}>✏️</button>
                    <button className="btn danger" onClick={() => handleDelete(book.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showForm && (
            <div className="modal-overlay">
              <form onSubmit={handleFormSubmit} className="form-container">
                <h3>{formMode === 'add' ? 'Add Book' : 'Edit Book'}</h3>

                <input name="title" placeholder="Title" defaultValue={selectedBook?.title} required />
                <input name="author" placeholder="Author" defaultValue={selectedBook?.author} required />
                <input name="isbn" placeholder="ISBN" defaultValue={selectedBook?.isbn} required />
                <input name="language" placeholder="Language" defaultValue={selectedBook?.language || 'English'} />
                <input name="publicationDate" type="date" defaultValue={selectedBook?.publicationDate?.split('T')[0]} />
                <input name="price" placeholder="Price" type="number" step="0.01" defaultValue={selectedBook?.price} required />
                <input name="originalPrice" placeholder="Original Price" type="number" step="0.01" defaultValue={selectedBook?.originalPrice} />
                <input name="stockCount" placeholder="Stock Count" type="number" defaultValue={selectedBook?.stockCount} />
                <input name="imageUrl" placeholder="Image URL" defaultValue={selectedBook?.imageUrl} />
                <input name="genreId" placeholder="Genre ID" type="number" defaultValue={selectedBook?.genreId} required />
                <input name="publisherId" placeholder="Publisher ID" type="number" defaultValue={selectedBook?.publisherId} required />

                <label>
                  <input type="checkbox" name="isAvailableInStore" defaultChecked={selectedBook?.isAvailableInStore} />
                  Available In Store
                </label>

                <label>
                  <input type="checkbox" name="isOnSale" defaultChecked={selectedBook?.isOnSale} />
                  On Sale
                </label>

                <label>Sale Start</label>
                <input name="saleStartDate" type="date" defaultValue={selectedBook?.saleStartDate?.split('T')[0]} />
                <label>Sale End</label>
                <input name="saleEndDate" type="date" defaultValue={selectedBook?.saleEndDate?.split('T')[0]} />

                <div className="form-buttons">
                  <button type="submit" className="btn primary">✅ Save</button>
                  <button type="button" className="btn" onClick={() => setShowForm(false)}>❌ Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookManagement;
