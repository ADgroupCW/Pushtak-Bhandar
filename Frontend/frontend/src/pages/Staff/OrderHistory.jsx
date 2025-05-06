import React, { useState, useEffect } from 'react';
import { Search, Calendar, Book, User, Tag, Package, RefreshCw, ChevronDown, ChevronUp, Filter, Download } from 'lucide-react';
import "../../styles/OrderHistory.css";


const mockOrderHistory = [
  {
    id: 'ORD-2025-0501',
    claimCode: 'CLAIM123456',
    memberId: 'MEM7890',
    memberName: 'Alice Johnson',
    memberEmail: 'alice@example.com',
    date: '2025-05-04',
    status: 'fulfilled',
    discount: '5%',
    totalAmount: 124.75,
    items: [
      { id: 1, title: 'The Midnight Library', author: 'Matt Haig', price: 22.99, quantity: 1 },
      { id: 2, title: 'Project Hail Mary', author: 'Andy Weir', price: 28.99, quantity: 2 },
      { id: 3, title: 'The Silent Patient', author: 'Alex Michaelides', price: 18.99, quantity: 1 },
      { id: 4, title: 'Klara and the Sun', author: 'Kazuo Ishiguro', price: 29.99, quantity: 1 }
    ]
  },
  {
    id: 'ORD-2025-0499',
    claimCode: 'CLAIM789012',
    memberId: 'MEM4567',
    memberName: 'Robert Chen',
    memberEmail: 'robert@example.com',
    date: '2025-05-04',
    status: 'fulfilled',
    discount: '10%',
    totalAmount: 81.89,
    items: [
      { id: 5, title: 'Dune', author: 'Frank Herbert', price: 24.99, quantity: 1 },
      { id: 6, title: 'Foundation', author: 'Isaac Asimov', price: 15.99, quantity: 2 },
      { id: 7, title: 'The Three-Body Problem', author: 'Liu Cixin', price: 19.99, quantity: 1 }
    ]
  },
  {
    id: 'ORD-2025-0495',
    claimCode: 'CLAIM345678',
    memberId: 'MEM1234',
    memberName: 'Sofia Garcia',
    memberEmail: 'sofia@example.com',
    date: '2025-05-03',
    status: 'fulfilled',
    discount: '15%',
    totalAmount: 143.65,
    items: [
      { id: 8, title: 'Pride and Prejudice', author: 'Jane Austen', price: 12.99, quantity: 1 },
      { id: 9, title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 14.99, quantity: 1 },
      { id: 10, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 11.99, quantity: 1 },
      { id: 11, title: '1984', author: 'George Orwell', price: 13.99, quantity: 1 }
    ]
  },
  {
    id: 'ORD-2025-0490',
    claimCode: 'CLAIM561234',
    memberId: 'MEM7890',
    memberName: 'Alice Johnson',
    memberEmail: 'alice@example.com',
    date: '2025-05-01',
    status: 'fulfilled',
    discount: '5%',
    totalAmount: 45.99,
    items: [
      { id: 12, title: 'Animal Farm', author: 'George Orwell', price: 10.99, quantity: 1 },
      { id: 13, title: 'Brave New World', author: 'Aldous Huxley', price: 15.99, quantity: 1 },
      { id: 14, title: 'The Catcher in the Rye', author: 'J.D. Salinger', price: 12.99, quantity: 1 }
    ]
  },
  {
    id: 'ORD-2025-0488',
    claimCode: 'CLAIM678901',
    memberId: 'MEM7890',
    memberName: 'Alice Johnson',
    memberEmail: 'alice@example.com',
    date: '2025-04-28',
    status: 'cancelled',
    discount: '0%',
    totalAmount: 32.98,
    items: [
      { id: 15, title: 'Lord of the Flies', author: 'William Golding', price: 13.99, quantity: 1 },
      { id: 16, title: 'Fahrenheit 451', author: 'Ray Bradbury', price: 18.99, quantity: 1 }
    ]
  }
];

export default function OrderHistory() {
  const [orderHistory, setOrderHistory] = useState(mockOrderHistory);
  const [filteredOrders, setFilteredOrders] = useState(mockOrderHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    // Filter orders based on search query, status filter, and date filter
    const filtered = orderHistory.filter(order => {
      // Search filter
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.claimCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      // Date filter
      let matchesDate = true;
      if (dateFilter === 'custom' && dateRange.start && dateRange.end) {
        const orderDate = new Date(order.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        matchesDate = orderDate >= startDate && orderDate <= endDate;
      } else if (dateFilter === 'last7days') {
        const orderDate = new Date(order.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesDate = orderDate >= sevenDaysAgo;
      } else if (dateFilter === 'last30days') {
        const orderDate = new Date(order.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchesDate = orderDate >= thirtyDaysAgo;
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, dateFilter, dateRange, orderHistory]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setShowFilterMenu(false);
  };

  const handleDateFilterChange = (date) => {
    setDateFilter(date);
    setShowFilterMenu(false);
    
    // Reset custom date range if not using custom filter
    if (date !== 'custom') {
      setDateRange({ start: '', end: '' });
    }
  };

  const handleDateRangeChange = (type, value) => {
    setDateRange(prev => ({ ...prev, [type]: value }));
  };

  const refreshOrders = () => {
    // In a real app, this would fetch from an API
    showNotification('Order history refreshed successfully!');
  };

  const downloadOrderHistory = () => {
    // In a real app, this would generate a CSV or PDF
    showNotification('Order history download started!');
  };

  const showNotification = (message) => {
    setNotificationMessage(message);
    setTimeout(() => {
      setNotificationMessage('');
    }, 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="oh-container">
      {/* Header */}
      <header className="oh-header">
        <div className="oh-header-container">
          <div className="oh-logo-container">
            <Book className="oh-logo-icon" />
            <div>
              <h1 className="oh-logo-text">Pustak Bhandar</h1>
              <p className="oh-logo-subtext">Order History</p>
            </div>
          </div>
          <div className="oh-header-actions">
            <button 
              onClick={refreshOrders}
              className="oh-refresh-button"
            >
              <RefreshCw className="oh-refresh-icon" />
              <span>Refresh</span>
            </button>
            <div className="oh-user-info">
              <span className="oh-user-name">Member: Alice Johnson</span>
              <div className="oh-user-avatar">
                <span>AJ</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="oh-main-content">
        <div className="oh-history-panel">
          <div className="oh-panel-header">
            <h2 className="oh-panel-title">Your Order History</h2>
            <p className="oh-panel-subtitle">View and track all your book purchases</p>
          </div>
          
          <div className="oh-search-filter-row">
            <div className="oh-search-wrapper">
              <Search className="oh-search-icon" />
              <input
                type="text"
                className="oh-search-input"
                placeholder="Search orders by ID, title, author..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            <div className="oh-filter-actions">
              <div className="oh-filter-dropdown">
                <button 
                  className="oh-filter-button"
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                >
                  <Filter className="oh-filter-icon" />
                  <span>Filter</span>
                  {showFilterMenu ? <ChevronUp /> : <ChevronDown />}
                </button>
                
                {showFilterMenu && (
                  <div className="oh-filter-menu">
                    <div className="oh-filter-section">
                      <h3 className="oh-filter-heading">Status</h3>
                      <ul className="oh-filter-options">
                        <li 
                          className={statusFilter === 'all' ? 'oh-filter-active' : ''}
                          onClick={() => handleStatusFilterChange('all')}
                        >
                          All Orders
                        </li>
                        <li 
                          className={statusFilter === 'fulfilled' ? 'oh-filter-active' : ''}
                          onClick={() => handleStatusFilterChange('fulfilled')}
                        >
                          Fulfilled
                        </li>
                        <li 
                          className={statusFilter === 'pending' ? 'oh-filter-active' : ''}
                          onClick={() => handleStatusFilterChange('pending')}
                        >
                          Pending
                        </li>
                        <li 
                          className={statusFilter === 'cancelled' ? 'oh-filter-active' : ''}
                          onClick={() => handleStatusFilterChange('cancelled')}
                        >
                          Cancelled
                        </li>
                      </ul>
                    </div>
                    
                    <div className="oh-filter-section">
                      <h3 className="oh-filter-heading">Date</h3>
                      <ul className="oh-filter-options">
                        <li 
                          className={dateFilter === 'all' ? 'oh-filter-active' : ''}
                          onClick={() => handleDateFilterChange('all')}
                        >
                          All Time
                        </li>
                        <li 
                          className={dateFilter === 'last7days' ? 'oh-filter-active' : ''}
                          onClick={() => handleDateFilterChange('last7days')}
                        >
                          Last 7 Days
                        </li>
                        <li 
                          className={dateFilter === 'last30days' ? 'oh-filter-active' : ''}
                          onClick={() => handleDateFilterChange('last30days')}
                        >
                          Last 30 Days
                        </li>
                        <li 
                          className={dateFilter === 'custom' ? 'oh-filter-active' : ''}
                          onClick={() => handleDateFilterChange('custom')}
                        >
                          Custom Range
                        </li>
                      </ul>
                      
                      {dateFilter === 'custom' && (
                        <div className="oh-date-range">
                          <div className="oh-date-input-group">
                            <label htmlFor="start-date">From:</label>
                            <input 
                              type="date" 
                              id="start-date"
                              value={dateRange.start}
                              onChange={(e) => handleDateRangeChange('start', e.target.value)}
                            />
                          </div>
                          <div className="oh-date-input-group">
                            <label htmlFor="end-date">To:</label>
                            <input 
                              type="date" 
                              id="end-date"
                              value={dateRange.end}
                              onChange={(e) => handleDateRangeChange('end', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                className="oh-download-button"
                onClick={downloadOrderHistory}
              >
                <Download className="oh-download-icon" />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          <div className="oh-applied-filters">
            {statusFilter !== 'all' && (
              <div className="oh-filter-tag">
                Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <button className="oh-remove-filter" onClick={() => setStatusFilter('all')}>×</button>
              </div>
            )}
            
            {dateFilter === 'last7days' && (
              <div className="oh-filter-tag">
                Last 7 Days
                <button className="oh-remove-filter" onClick={() => setDateFilter('all')}>×</button>
              </div>
            )}
            
            {dateFilter === 'last30days' && (
              <div className="oh-filter-tag">
                Last 30 Days
                <button className="oh-remove-filter" onClick={() => setDateFilter('all')}>×</button>
              </div>
            )}
            
            {dateFilter === 'custom' && dateRange.start && dateRange.end && (
              <div className="oh-filter-tag">
                {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                <button className="oh-remove-filter" onClick={() => setDateFilter('all')}>×</button>
              </div>
            )}
          </div>
          
          <div className="oh-order-list">
            {filteredOrders.length > 0 ? (
              <>
                <div className="oh-list-header">
                  <span className="oh-header-id">Order ID</span>
                  <span className="oh-header-date">Date</span>
                  <span className="oh-header-items">Items</span>
                  <span className="oh-header-total">Total</span>
                  <span className="oh-header-status">Status</span>
                  <span className="oh-header-action"></span>
                </div>
                
                {filteredOrders.map(order => (
                  <div className="oh-order-entry" key={order.id}>
                    <div className="oh-order-summary">
                      <span className="oh-order-id">{order.id}</span>
                      <span className="oh-order-date">{formatDate(order.date)}</span>
                      <span className="oh-order-items-count">{order.items.length} items</span>
                      <span className="oh-order-total">${order.totalAmount.toFixed(2)}</span>
                      <span className={`oh-order-status oh-status-${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <button 
                        className="oh-expand-button"
                        onClick={() => toggleOrderDetails(order.id)}
                      >
                        {expandedOrderId === order.id ? <ChevronUp /> : <ChevronDown />}
                      </button>
                    </div>
                    
                    {expandedOrderId === order.id && (
                      <div className="oh-order-details">
                        <div className="oh-order-metadata">
                          <div className="oh-metadata-column">
                            <div className="oh-metadata-item">
                              <span className="oh-metadata-label">Claim Code:</span>
                              <span className="oh-metadata-value">{order.claimCode}</span>
                            </div>
                            <div className="oh-metadata-item">
                              <span className="oh-metadata-label">Discount:</span>
                              <span className="oh-metadata-value">{order.discount}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="oh-item-list">
                          <h4 className="oh-item-list-title">Items</h4>
                          <table className="oh-items-table">
                            <thead>
                              <tr>
                                <th>Book Title</th>
                                <th>Author</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map(item => (
                                <tr key={item.id}>
                                  <td className="oh-item-title">{item.title}</td>
                                  <td className="oh-item-author">{item.author}</td>
                                  <td>${item.price.toFixed(2)}</td>
                                  <td>{item.quantity}</td>
                                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="oh-subtotal-row">
                                <td colSpan="4" className="oh-text-right">Subtotal:</td>
                                <td>${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</td>
                              </tr>
                              <tr className="oh-discount-row">
                                <td colSpan="4" className="oh-text-right">Discount ({order.discount}):</td>
                                <td>-${(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - order.totalAmount).toFixed(2)}</td>
                              </tr>
                              <tr className="oh-total-row">
                                <td colSpan="4" className="oh-text-right">Total:</td>
                                <td>${order.totalAmount.toFixed(2)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="oh-empty-state">
                <Package className="oh-empty-icon" />
                <h3 className="oh-empty-title">No orders found</h3>
                <p className="oh-empty-message">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' 
                    ? "Try changing your search or filter criteria" 
                    : "You haven't placed any orders yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {notificationMessage && (
        <div className="oh-notification">
          <span>{notificationMessage}</span>
        </div>
      )}
    </div>
  );
}