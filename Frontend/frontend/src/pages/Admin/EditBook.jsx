import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';
import '../../styles/EditBook.css';


const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [awards, setAwards] = useState([]);
  const [formats, setFormats] = useState([]);
  
  const [activeTab, setActiveTab] = useState('basic');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [modalType, setModalType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, genreRes, pubRes, awardRes, formatRes] = await Promise.all([
        api.get(`/Book/${id}`),
        api.get('/meta/genres'),
        api.get('/meta/publishers'),
        api.get('/meta/awards'),
        api.get('/meta/formats'),
      ]);

      setGenres(genreRes.data);
      setPublishers(pubRes.data);
      setAwards(awardRes.data);
      setFormats(formatRes.data);

      const b = bookRes.data;
      setBook({
        ...b,
        genreId: genreRes.data.find(g => g.name === b.genreName)?.id || '',
        publisherId: pubRes.data.find(p => p.name === b.publisherName)?.id || '',
        bookAwardIds: awardRes.data.filter(a => b.bookAwardNames.includes(a.name)).map(a => a.id),
        bookFormatIds: formatRes.data.filter(f => b.bookFormatNames.includes(f.name)).map(f => f.id),
      });
      setImagePreview(`http://localhost:5046${b.imageUrl}`);
    } catch (err) {
      console.error('Failed to load book', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBook({ ...book, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleMultiSelect = (field, id) => {
    const updated = book[field].includes(id)
      ? book[field].filter(i => i !== id)
      : [...book[field], id];
    setBook({ ...book, [field]: updated });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const openModal = (type) => {
    setModalType(type);
    setNewItemName('');
    setShowModal(true);
  };

  const submitNewItem = async () => {
    try {
      await api.post(`/meta/${modalType.toLowerCase()}s`, { name: newItemName });
      setShowModal(false);
      fetchData();
    } catch {
      alert('Failed to add new item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();

      // List of scalar fields
      const scalarFields = [
        'title', 'author', 'isbn', 'description', 'language',
        'publicationDate', 'price', 'originalPrice',
        'isAvailableInStore', 'isOnSale', 'saleStartDate',
        'saleEndDate', 'stockCount', 'genreId', 'publisherId'
      ];

      // Append scalar fields
      scalarFields.forEach(field => {
        const value = book[field];
        fd.append(field, value ?? '');
      });

      // Append arrays using correct format
      book.bookAwardIds.forEach(id => fd.append('bookAwardIds[]', id));
      book.bookFormatIds.forEach(id => fd.append('bookFormatIds[]', id));

      // Append image file if present
      if (imageFile) {
        fd.append('imageFile', imageFile);
      }

      // Submit PUT request
      await api.put(`/Book/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/admin/books');
    } catch (err) {
      console.error(err);
      alert('Update failed.');
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="admin-main">
          <AdminNavbar />
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading book data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="admin-dashboard">
        <AdminSidebar />
        <div className="admin-main">
          <AdminNavbar />
          <div className="error-container">
            <p>Book not found or error loading data.</p>
            <button 
              className="btn-secondary" 
              onClick={() => navigate('/admin/books')}
            >
              Return to Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="edit-book-container">
          <header className="page-header">
            <h2>Edit Book: {book.title}</h2>
            <div className="action-buttons">
              <button type="button" className="btn-secondary" onClick={() => navigate('/admin/books')}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleSubmit}>
                Save
              </button>
            </div>
          </header>

          <div className="tabs-container">
            <div className="tabs-header">
              <button 
                className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                Basic Information
              </button>
              <button 
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Details & Categories
              </button>
              <button 
                className={`tab-button ${activeTab === 'pricing' ? 'active' : ''}`}
                onClick={() => setActiveTab('pricing')}
              >
                Pricing & Availability
              </button>
              <button 
                className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
                onClick={() => setActiveTab('image')}
              >
                Cover Image
              </button>
            </div>

            <div className="tab-content">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="tab-pane">
                  <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input 
                      id="title"
                      name="title" 
                      value={book.title} 
                      onChange={handleChange} 
                      placeholder="Book Title" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="author">Author</label>
                    <input 
                      id="author"
                      name="author" 
                      value={book.author} 
                      onChange={handleChange} 
                      placeholder="Author Name" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="isbn">ISBN</label>
                    <input 
                      id="isbn"
                      name="isbn" 
                      value={book.isbn} 
                      onChange={handleChange} 
                      placeholder="ISBN" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="language">Language</label>
                    <input 
                      id="language"
                      name="language" 
                      value={book.language} 
                      onChange={handleChange} 
                      placeholder="Language" 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="publicationDate">Publication Date</label>
                    <input 
                      id="publicationDate"
                      type="date" 
                      name="publicationDate" 
                      value={book.publicationDate?.split('T')[0]} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={book.description || ''}
                      onChange={handleChange}
                      placeholder="Book description"
                      rows="5"
                    />
                  </div>
                </div>
              )}

              {/* Details & Categories Tab */}
              {activeTab === 'details' && (
                <div className="tab-pane">
                  <div className="form-group">
                    <label>Genre</label>
                    <div className="select-with-button">
                      <select 
                        name="genreId" 
                        value={book.genreId} 
                        onChange={handleChange} 
                        required
                      >
                        <option value="">-- Select Genre --</option>
                        {genres.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        className="add-button" 
                        onClick={() => openModal('genre')}
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Publisher</label>
                    <div className="select-with-button">
                      <select 
                        name="publisherId" 
                        value={book.publisherId} 
                        onChange={handleChange} 
                        required
                      >
                        <option value="">-- Select Publisher --</option>
                        {publishers.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        className="add-button" 
                        onClick={() => openModal('publisher')}
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Awards</label>
                    <div className="tag-container">
                      {awards.map(a => (
                        <span 
                          key={a.id} 
                          className={`tag ${book.bookAwardIds.includes(a.id) ? 'selected' : ''}`}
                          onClick={() => toggleMultiSelect('bookAwardIds', a.id)}
                        >
                          {a.name}
                        </span>
                      ))}
                      <button 
                        type="button" 
                        className="add-tag-button" 
                        onClick={() => openModal('award')}
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Formats</label>
                    <div className="tag-container">
                      {formats.map(f => (
                        <span 
                          key={f.id} 
                          className={`tag ${book.bookFormatIds.includes(f.id) ? 'selected' : ''}`}
                          onClick={() => toggleMultiSelect('bookFormatIds', f.id)}
                        >
                          {f.name}
                        </span>
                      ))}
                      <button 
                        type="button" 
                        className="add-tag-button" 
                        onClick={() => openModal('format')}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing & Availability Tab */}
              {activeTab === 'pricing' && (
                <div className="tab-pane">
                  <div className="form-group">
                    <label htmlFor="price">Current Price</label>
                    <input 
                      id="price"
                      type="number" 
                      step="0.01" 
                      name="price" 
                      value={book.price} 
                      onChange={handleChange} 
                      placeholder="Current Price" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="originalPrice">Original Price</label>
                    <input 
                      id="originalPrice"
                      type="number" 
                      step="0.01" 
                      name="originalPrice" 
                      value={book.originalPrice || ''} 
                      onChange={handleChange} 
                      placeholder="Original Price" 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="stockCount">Stock Count</label>
                    <input 
                      id="stockCount"
                      type="number" 
                      name="stockCount" 
                      value={book.stockCount} 
                      onChange={handleChange} 
                      placeholder="Stock Count" 
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="isAvailableInStore" 
                        checked={book?.isAvailableInStore || false} 
                        onChange={handleChange} 
                      />
                      <span>Available In Store</span>
                    </label>
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="isOnSale" 
                        checked={book?.isOnSale || false} 
                        onChange={handleChange} 
                      />
                      <span>On Sale</span>
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="saleStartDate">Sale Start Date</label>
                      <input 
                        id="saleStartDate"
                        type="date" 
                        name="saleStartDate" 
                        value={book.saleStartDate?.split('T')[0] || ''} 
                        onChange={handleChange} 
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="saleEndDate">Sale End Date</label>
                      <input 
                        id="saleEndDate"
                        type="date" 
                        name="saleEndDate" 
                        value={book.saleEndDate?.split('T')[0] || ''} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Image Tab */}
              {activeTab === 'image' && (
                <div className="tab-pane">
                  <div className="image-upload-container">
                    <div className="current-image">
                      <h3>Current Cover Image</h3>
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Book cover preview" 
                          className="cover-preview" 
                        />
                      ) : (
                        <div className="no-image">No image available</div>
                      )}
                    </div>
                    
                    <div className="upload-section">
                      <h3>Upload New Cover</h3>
                      <div className="file-input-container">
                        <input 
                          type="file" 
                          id="coverImage"
                          accept="image/*" 
                          onChange={handleImageChange} 
                          className="file-input"
                        />
                        <label htmlFor="coverImage" className="file-input-label">
                          Choose File
                        </label>
                        <span className="file-name">
                          {imageFile ? imageFile.name : 'No file chosen'}
                        </span>
                      </div>
                      <p className="help-text">
                        Recommended size: 400x600 pixels. Max file size: 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin/books')}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleSubmit}>
              Save
            </button>
          </div>
        </div>

        {/* Modal for adding new items */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New {modalType}</h3>
              <div className="modal-form">
                <input 
                  type="text" 
                  placeholder={`${modalType} Name`} 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)} 
                />
                <div className="modal-actions">
                  <button 
                    className="btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={submitNewItem}
                    disabled={!newItemName.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditBook;