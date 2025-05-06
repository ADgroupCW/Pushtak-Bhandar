import { useState } from 'react';
import { Book, ShoppingCart, Clock, User, LogOut, Home } from 'lucide-react';
import '../../styles/StaffDashboard.css'; // Import the CSS file

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('process');
  
  // Mock data for today's statistics
  const stats = {
    pendingOrders: 12,
    processedToday: 28,
    booksHandled: 156,
    activeCustomers: 17
  };
  
  return (
    <div className="sd-container">
      {/* Header */}
      <header className="sd-header">
        <div className="sd-header-container">
          <div className="sd-header-title">
            <h1 className="sd-page-title">Staff Dashboard</h1>
          </div>
          <div className="sd-user-section">
            <div className="sd-user-info">
              <p className="sd-user-name">Sarah Johnson</p>
              <p className="sd-user-id">Staff ID: S1234</p>
            </div>
            <button className="sd-logout-button">
              <LogOut className="sd-icon" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="sd-main">
        {/* Stats Overview */}
        <div className="sd-stats-grid">
          <div className="sd-stat-card">
            <div className="sd-stat-card-inner">
              <div className="sd-stat-content">
                <div className="sd-stat-icon-container sd-stat-icon-orders">
                  <ShoppingCart className="sd-stat-icon" />
                </div>
                <div className="sd-stat-text">
                  <dl>
                    <dt className="sd-stat-label">Pending Orders</dt>
                    <dd className="sd-stat-value">{stats.pendingOrders}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="sd-stat-card">
            <div className="sd-stat-card-inner">
              <div className="sd-stat-content">
                <div className="sd-stat-icon-container sd-stat-icon-processed">
                  <Clock className="sd-stat-icon" />
                </div>
                <div className="sd-stat-text">
                  <dl>
                    <dt className="sd-stat-label">Processed Today</dt>
                    <dd className="sd-stat-value">{stats.processedToday}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="sd-stat-card">
            <div className="sd-stat-card-inner">
              <div className="sd-stat-content">
                <div className="sd-stat-icon-container sd-stat-icon-books">
                  <Book className="sd-stat-icon" />
                </div>
                <div className="sd-stat-text">
                  <dl>
                    <dt className="sd-stat-label">Books Handled</dt>
                    <dd className="sd-stat-value">{stats.booksHandled}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          
          <div className="sd-stat-card">
            <div className="sd-stat-card-inner">
              <div className="sd-stat-content">
                <div className="sd-stat-icon-container sd-stat-icon-customers">
                  <User className="sd-stat-icon" />
                </div>
                <div className="sd-stat-text">
                  <dl>
                    <dt className="sd-stat-label">Active Customers</dt>
                    <dd className="sd-stat-value">{stats.activeCustomers}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="sd-tabs-container">
          <nav className="sd-tabs-nav">
            <button
              onClick={() => setActiveTab('process')}
              className={`sd-tab-button ${
                activeTab === 'process' ? 'sd-tab-active' : 'sd-tab-inactive'
              }`}
            >
              Process Orders
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`sd-tab-button ${
                activeTab === 'history' ? 'sd-tab-active' : 'sd-tab-inactive'
              }`}
            >
              Order History
            </button>
          </nav>
        </div>
        
        {/* Content area */}
        <div className="sd-content">
          {activeTab === 'process' ? (
            <div className="sd-empty-state">
              <div className="sd-empty-content">
                <ShoppingCart className="sd-empty-icon" />
                <h3 className="sd-empty-title">Ready to process orders</h3>
                <p className="sd-empty-description">
                  Enter a claim code to get started or navigate to the order processing page.
                </p>
                <div className="sd-action-button-container">
                  <button className="sd-action-button">
                    Go to Order Processing
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sd-empty-state">
              <div className="sd-empty-content">
                <Clock className="sd-empty-icon" />
                <h3 className="sd-empty-title">Order History</h3>
                <p className="sd-empty-description">
                  View past processed orders and their details.
                </p>
                <div className="sd-action-button-container">
                  <button className="sd-action-button">
                    View Complete History
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}