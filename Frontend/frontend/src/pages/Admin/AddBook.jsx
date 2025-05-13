import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import '../../styles/AddBook.css';
import { useNavigate } from 'react-router-dom';


export default function AddBook() {
  const [form, setForm] = useState({
    title: '', author: '', isbn: '', description: '', language: 'English', publicationDate: '',
    price: '', originalPrice: '', stockCount: '', isAvailableInStore: true, isOnSale: false,
    saleStartDate: '', saleEndDate: '', genreId: '', publisherId: '',
    bookAwardIds: [], bookFormatIds: []
  });

  const [imageFile, setImageFile] = useState(null);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [awards, setAwards] = useState([]);
  const [formats, setFormats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // Define the steps for the form
  const steps = [
    { id: 1, name: 'Basic Info' },
    { id: 2, name: 'Publication' },
    { id: 3, name: 'Pricing' },
    { id: 4, name: 'Categories' },
    { id: 5, name: 'Image & Submit' }
  ];

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [g, p, a, f] = await Promise.all([
        api.get('/meta/genres'),
        api.get('/meta/publishers'),
        api.get('/meta/awards'),
        api.get('/meta/formats')
      ]);
      setGenres(g.data);
      setPublishers(p.data);
      setAwards(a.data);
      setFormats(f.data);
    } catch (err) {
      console.error('Dropdown fetch failed:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const toggleMultiSelect = (type, id) => {
    const field = type === 'Award' ? 'bookAwardIds' : 'bookFormatIds';
    const selected = form[field].includes(id)
      ? form[field].filter(i => i !== id)
      : [...form[field], id];
    setForm({ ...form, [field]: selected });
  };

  const removeSelectedItem = (type, id) => {
    const field = type === 'Award' ? 'bookAwardIds' : 'bookFormatIds';
    const updated = form[field].filter(i => i !== id);
    setForm({ ...form, [field]: updated });
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
      fetchDropdowns();
    } catch (err) {
      alert(`Failed to add new ${modalType}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
  
      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(val => fd.append(`${key}[]`, val));
        } else {
          fd.append(key, value ?? '');
        }
      });
      if (imageFile) fd.append('imageFile', imageFile);
  
      console.log('📤 SUBMITTING FORM DATA:');
      for (let pair of fd.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
  
      await api.post('/Book', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      setSuccess('Book added successfully!');
      setTimeout(() => navigate('/admin/books'), 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to add book.');
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Check if basic form fields are valid for current step
  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return form.title && form.author && form.isbn;
      case 2:
        return form.publicationDate && form.publisherId;
      case 3:
        return form.originalPrice && form.stockCount !== '';
      case 4:
        return form.genreId;
      case 5:
        return imageFile;
      default:
        return true;
    }
  };

  const isStepValid = validateStep();
  
  // Render different form content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3>Basic Book Information</h3>
            <div className="form-group">
              <label>Title</label>
              <input 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                required 
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Author</label>
              <input 
                name="author" 
                value={form.author} 
                onChange={handleChange} 
                required 
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                rows={4}
                className="form-control"
                placeholder="Write a brief description of the book"
              />
            </div>
            <div className="form-group">
              <label>ISBN</label>
              <input 
                name="isbn" 
                value={form.isbn} 
                onChange={handleChange} 
                required 
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Language</label>
              <input 
                name="language" 
                value={form.language} 
                onChange={handleChange} 
                className="form-control"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="step-content">
            <h3>Publication Details</h3>
            <div className="form-group">
              <label>Publication Date</label>
              <input 
                type="date" 
                name="publicationDate" 
                value={form.publicationDate} 
                onChange={handleChange} 
                required 
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Publisher</label>
              <div className="input-group">
                <select 
                  name="publisherId" 
                  value={form.publisherId} 
                  onChange={handleChange} 
                  required
                  className="form-select"
                >
                  <option value="">-- Select Publisher --</option>
                  {publishers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={() => openModal('publisher')}
                  className="btn-add"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="step-content">
            <h3>Pricing & Availability</h3>
            

            <div className="form-group">
              <label>Original Price</label>
              <input 
                type="number" 
                name="originalPrice" 
                value={form.originalPrice} 
                onChange={handleChange} 
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Stock Count</label>
              <input 
                type="number" 
                name="stockCount" 
                value={form.stockCount} 
                onChange={handleChange} 
                required 
                className="form-control"
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="isAvailableInStore" 
                  checked={form.isAvailableInStore} 
                  onChange={handleChange} 
                />
                <span>Available in Store</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="isOnSale" 
                  checked={form.isOnSale} 
                  onChange={handleChange} 
                />
                <span>On Sale</span>
              </label>
            </div>

            {form.isOnSale && (
              <>
              <div className="form-group">
                <label>Sales Price</label>
                <input 
                  type="number" 
                  name="price" 
                  value={form.price} 
                  onChange={handleChange} 
                  required 
                  className="form-control"
                />
              </div>
                <div className="form-group">
                  <label>Sale Start Date</label>
                  <input 
                    type="date" 
                    name="saleStartDate" 
                    value={form.saleStartDate} 
                    onChange={handleChange} 
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Sale End Date</label>
                  <input 
                    type="date" 
                    name="saleEndDate" 
                    value={form.saleEndDate} 
                    onChange={handleChange} 
                    className="form-control"
                  />
                </div>
              </>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="step-content">
            <h3>Categories & Recognition</h3>
            <div className="form-group">
              <label>Genre</label>
              <div className="input-group">
                <select 
                  name="genreId" 
                  value={form.genreId} 
                  onChange={handleChange} 
                  required
                  className="form-select"
                >
                  <option value="">-- Select Genre --</option>
                  {genres.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={() => openModal('genre')}
                  className="btn-add"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Awards</label>
              <div className="input-group">
                <select 
                  onChange={e => {
                    const id = parseInt(e.target.value);
                    if (id && !form.bookAwardIds.includes(id)) {
                      setForm({ ...form, bookAwardIds: [...form.bookAwardIds, id] });
                    }
                  }}
                  className="form-select"
                >
                  <option value="">-- Select Award --</option>
                  {awards.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={() => openModal('award')}
                  className="btn-add"
                >
                  + Add
                </button>
              </div>
              <div className="tag-box">
                {form.bookAwardIds.map(id => {
                  const award = awards.find(a => a.id === id);
                  return award ? (
                    <span key={id} className="tag">
                      {award.name}
                      <button 
                        type="button" 
                        onClick={() => removeSelectedItem('Award', id)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Formats</label>
              <div className="input-group">
                <select 
                  onChange={e => {
                    const id = parseInt(e.target.value);
                    if (id && !form.bookFormatIds.includes(id)) {
                      setForm({ ...form, bookFormatIds: [...form.bookFormatIds, id] });
                    }
                  }}
                  className="form-select"
                >
                  <option value="">-- Select Format --</option>
                  {formats.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={() => openModal('format')}
                  className="btn-add"
                >
                  + Add
                </button>
              </div>
              <div className="tag-box">
                {form.bookFormatIds.map(id => {
                  const format = formats.find(f => f.id === id);
                  return format ? (
                    <span key={id} className="tag">
                      {format.name}
                      <button 
                        type="button" 
                        onClick={() => removeSelectedItem('Format', id)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="step-content">
            <h3>Book Cover Image</h3>
            <div className="form-group">
              <label>Book Cover Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setImageFile(e.target.files[0])} 
                required 
                className="form-control"
              />
              {imageFile && (
                <div className="image-preview">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Book cover preview" 
                  />
                </div>
              )}
            </div>

            <div className="review-section">
              <h4>Review Book Information</h4>
              <div className="review-item">
                <strong>Title:</strong> {form.title}
              </div>
              <div className="review-item">
                <strong>Author:</strong> {form.author}
              </div>
              <div className="review-item">
                <strong>ISBN:</strong> {form.isbn}
              </div>
              <div className="review-item">
                <strong>Price:</strong> ${form.price}
              </div>
              <div className="review-item">
                <strong>Publication Date:</strong> {form.publicationDate}
              </div>
              <div className="review-item">
                <strong>Publisher:</strong> {publishers.find(p => p.id === parseInt(form.publisherId))?.name || ''}
              </div>
              <div className="review-item">
                <strong>Genre:</strong> {genres.find(g => g.id === parseInt(form.genreId))?.name || ''}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="add-book-container">
        <button 
    className="btn-secondary back-button" 
    onClick={() => navigate('/admin/books')}
  >
    ← Back to Manage Books
  </button>
      <h2>Add New Book</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Stepper */}
      <div className="stepper">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
            onClick={() => step.id < currentStep && setCurrentStep(step.id)}
          >
            <div className="step-number">{step.id}</div>
            <div className="step-name">{step.name}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="add-book-form">
        {renderStepContent()}

        <div className="form-actions">
          {currentStep > 1 && (
            <button 
              type="button" 
              onClick={prevStep}
              className="btn-secondary"
            >
              Back
            </button>
          )}
          
          {currentStep < steps.length ? (
            <button 
              type="button" 
              onClick={nextStep}
              className="btn-primary"
              disabled={!isStepValid}
            >
              Next
            </button>
          ) : (
            <button 
              type="submit" 
              className="btn-submit"
              disabled={!isStepValid}
            >
              Submit Book
            </button>
          )}
        </div>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}</h3>
            <input 
              type="text" 
              placeholder={`${modalType} Name`} 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)} 
              className="form-control"
            />
            <div className="modal-buttons">
              <button onClick={submitNewItem} className="btn-primary">Add</button>
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}