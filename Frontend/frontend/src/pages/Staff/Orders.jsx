import React, { useState, useEffect } from 'react';
import { Search, Check, X, Clock, Calendar, Book, User, Tag, Package, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import "../../styles/Orders.css";


// Mock data for demonstration
const mockOrders = [
  {
    id: 'ORD-2025-0501',
    claimCode: 'CLAIM123456',
    memberId: 'MEM7890',
    memberName: 'Alice Johnson',
    memberEmail: 'alice@example.com',
    date: '2025-05-04',
    status: 'pending',
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
    status: 'pending',
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
      { id: 11, title: '1984', author: 'George Orwell', price: 13.99, quantity: 1 },
      { id: 12, title: 'Animal Farm', author: 'George Orwell', price: 10.99, quantity: 1 },
      { id: 13, title: 'Brave New World', author: 'Aldous Huxley', price: 15.99, quantity: 1 },
      { id: 14, title: 'The Catcher in the Rye', author: 'J.D. Salinger', price: 12.99, quantity: 1 },
      { id: 15, title: 'Lord of the Flies', author: 'William Golding', price: 13.99, quantity: 1 }
    ]
  }
];

export default function StaffOrderPortal() {
  const [orders, setOrders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingStatus, setProcessingStatus] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // Filter orders based on search query and status filter
    const filtered = orders.filter(order => {
      const matchesSearch = 
        order.claimCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
    
    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const selectOrder = (order) => {
    setSelectedOrder(order);
    setProcessingStatus(null);
  };

  const processOrder = () => {
    setProcessingStatus('processing');
    
    // Simulate processing delay
    setTimeout(() => {
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'fulfilled' } 
          : order
      ));
      
      setProcessingStatus('success');
      showNotification(`Order ${selectedOrder.id} has been successfully fulfilled!`);
      
      // Broadcast successful order (requirement #15)
      const bookTitles = selectedOrder.items.map(item => item.title).join(', ');
      console.log(`BROADCAST: Member ${selectedOrder.memberName} has successfully purchased: ${bookTitles}`);
    }, 1500);
  };
  
  const cancelOrder = () => {
    setProcessingStatus('processing');
    
    // Simulate processing delay
    setTimeout(() => {
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: 'cancelled' } 
          : order
      ));
      
      setProcessingStatus('cancelled');
      showNotification(`Order ${selectedOrder.id} has been cancelled.`);
    }, 1500);
  };
  
  const showNotification = (message) => {
    setNotificationMessage(message);
    setTimeout(() => {
      setNotificationMessage('');
    }, 5000);
  };

  const refreshOrders = () => {
    // In a real app, this would fetch from an API
    showNotification('Orders refreshed successfully!');
  };

  return (
    <div className="bh-container">
      {/* Header */}
      <header className="bh-header">
        <div className="bh-header-container">
          <div className="bh-logo-container">
            <Book className="bh-logo-icon" />
            <div>
              <h1 className="bh-logo-text">Pustak Bhandar</h1>
              <p className="bh-logo-subtext">Staff Order Portal</p>
            </div>
          </div>
          <div className="bh-header-actions">
            <button 
              onClick={refreshOrders}
              className="bh-refresh-button"
            >
              <RefreshCw className="bh-refresh-icon" />
              <span>Refresh</span>
            </button>
            <div className="bh-user-info">
              <span className="bh-user-name">Staff: Alex Morgan</span>
              <div className="bh-user-avatar">
                <span>AM</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="bh-main-content">
        <div className="bh-content-layout">
          
          <div className="bh-order-panel">
            <div className="bh-panel-header">
              <h2 className="bh-panel-title">Order Management</h2>
              <p className="bh-panel-subtitle">Process customer orders and manage claim codes</p>
            </div>
            
            <div className="bh-search-container">
              <div className="bh-search-wrapper">
                <Search className="bh-search-icon" />
                <input
                  type="text"
                  className="bh-search-input"
                  placeholder="Search by claim code, order ID or member..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="bh-filter-buttons">
                <button 
                  className={`bh-filter-button bh-filter-all ${statusFilter === 'all' ? 'bh-active' : ''}`}
                  onClick={() => handleStatusFilterChange('all')}
                >
                  All Orders
                </button>
                <button 
                  className={`bh-filter-button bh-filter-pending ${statusFilter === 'pending' ? 'bh-active' : ''}`}
                  onClick={() => handleStatusFilterChange('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`bh-filter-button bh-filter-fulfilled ${statusFilter === 'fulfilled' ? 'bh-active' : ''}`}
                  onClick={() => handleStatusFilterChange('fulfilled')}
                >
                  Fulfilled
                </button>
                <button 
                  className={`bh-filter-button bh-filter-cancelled ${statusFilter === 'cancelled' ? 'bh-active' : ''}`}
                  onClick={() => handleStatusFilterChange('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>
            
            <div className="bh-order-list">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <div 
                    key={order.id}
                    className={`bh-order-item ${selectedOrder?.id === order.id ? 'bh-selected' : ''}`}
                    onClick={() => selectOrder(order)}
                  >
                    <div className="bh-order-info">
                      <h3 className="bh-order-id">{order.id}</h3>
                      <p className="bh-order-customer">{order.memberName}</p>
                      <div className="bh-order-claim">
                        <Tag className="bh-claim-tag" />
                        <span className="bh-claim-code">Claim: {order.claimCode}</span>
                      </div>
                    </div>
                    <div className="bh-order-meta">
                      <span className={`bh-status-badge ${
                        order.status === 'pending' ? 'bh-status-pending' : 
                        order.status === 'fulfilled' ? 'bh-status-fulfilled' : 
                        'bh-status-cancelled'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="bh-order-amount">${order.totalAmount.toFixed(2)}</span>
                      <span className="bh-order-items">{order.items.length} items</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bh-empty-orders">
                  <p>No orders match your criteria</p>
                </div>
              )}
            </div>
          </div>

          <div className="bh-details-panel">
            {selectedOrder ? (
              <>
                <div className="bh-details-header">
                  <h2 className="bh-details-title">Order Details</h2>
                  <div className={`bh-status-badge ${
                    selectedOrder.status === 'pending' ? 'bh-status-pending' : 
                    selectedOrder.status === 'fulfilled' ? 'bh-status-fulfilled' : 
                    'bh-status-cancelled'
                  }`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </div>
                </div>
                
                <div className="bh-details-content">
                  <div className="bh-info-grid">
                    <div className="bh-info-card">
                      <h3 className="bh-info-title">Order Information</h3>
                      <div className="bh-info-list">
                        <div className="bh-info-item">
                          <Tag className="bh-info-icon" />
                          <span className="bh-info-text">Order ID: <span className="bh-info-label">{selectedOrder.id}</span></span>
                        </div>
                        <div className="bh-info-item">
                          <Clock className="bh-info-icon" />
                          <span className="bh-info-text">Date: <span className="bh-info-label">{selectedOrder.date}</span></span>
                        </div>
                        <div className="bh-info-item">
                          <Tag className="bh-info-icon" />
                          <span className="bh-info-text">Claim Code: <span className="bh-info-label">{selectedOrder.claimCode}</span></span>
                        </div>
                        <div className="bh-info-item">
                          <Tag className="bh-info-icon" />
                          <span className="bh-info-text">Discount: <span className="bh-info-label">{selectedOrder.discount}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="bh-info-card">
                      <h3 className="bh-info-title">Member Information</h3>
                      <div className="bh-info-list">
                        <div className="bh-info-item">
                          <User className="bh-info-icon" />
                          <span className="bh-info-text">Member ID: <span className="bh-info-label">{selectedOrder.memberId}</span></span>
                        </div>
                        <div className="bh-info-item">
                          <User className="bh-info-icon" />
                          <span className="bh-info-text">Name: <span className="bh-info-label">{selectedOrder.memberName}</span></span>
                        </div>
                        <div className="bh-info-item">
                          <Mail className="bh-info-icon" />
                          <span className="bh-info-text">Email: <span className="bh-info-label">{selectedOrder.memberEmail}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bh-items-section">
                    <h3 className="bh-items-title">Order Items</h3>
                    <div className="bh-table-container">
                      <table className="bh-order-table">
                        <thead className="bh-table-header">
                          <tr>
                            <th>Book</th>
                            <th>Author</th>
                            <th>Price</th>
                            <th>Qty</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody className="bh-table-body">
                          {selectedOrder.items.map((item) => (
                            <tr key={item.id}>
                              <td className="bh-book-title">{item.title}</td>
                              <td className="bh-book-author">{item.author}</td>
                              <td>${item.price.toFixed(2)}</td>
                              <td>{item.quantity}</td>
                              <td>${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bh-table-footer">
                          <tr className="bh-subtotal-row">
                            <td colSpan="4" className="bh-text-right">Subtotal:</td>
                            <td>
                              ${selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                            </td>
                          </tr>
                          <tr className="bh-discount-row">
                            <td colSpan="4" className="bh-text-right">Discount ({selectedOrder.discount}):</td>
                            <td>
                              -${(selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - selectedOrder.totalAmount).toFixed(2)}
                            </td>
                          </tr>
                          <tr className="bh-total-row">
                            <td colSpan="4" className="bh-text-right">Total:</td>
                            <td>${selectedOrder.totalAmount.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  
                  <div className="bh-action-footer">
                    <div>
                      {selectedOrder.status === 'pending' && (
                        <button 
                          onClick={cancelOrder} 
                          className="bh-cancel-button"
                          disabled={processingStatus === 'processing'}
                        >
                          {processingStatus === 'processing' ? (
                            <RefreshCw className="bh-icon-spin" />
                          ) : (
                            <X />
                          )}
                          Cancel Order
                        </button>
                      )}
                    </div>
                    <div>
                      {selectedOrder.status === 'pending' && (
                        <button 
                          onClick={processOrder} 
                          className="bh-process-button"
                          disabled={processingStatus === 'processing'}
                        >
                          {processingStatus === 'processing' ? (
                            <RefreshCw className="bh-icon-spin" />
                          ) : (
                            <Check />
                          )}
                          Process Order
                        </button>
                      )}
                      {selectedOrder.status === 'fulfilled' && (
                        <div className="bh-status-message bh-fulfilled-message">
                          <Check />
                          <span>Order successfully processed</span>
                        </div>
                      )}
                      {selectedOrder.status === 'cancelled' && (
                        <div className="bh-status-message bh-cancelled-message">
                          <X />
                          <span>Order has been cancelled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bh-empty-details">
                <div className="bh-empty-content">
                  <Package className="bh-empty-icon" />
                  <h3 className="bh-empty-title">No order selected</h3>
                  <p className="bh-empty-message">Select an order from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {notificationMessage && (
        <div className="bh-notification">
          <Check />
          <span>{notificationMessage}</span>
        </div>
      )}
    </div>
  );
}


function Mail(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}