import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../api/api';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyOrders, setMonthlyOrders] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState([]);
  const [topReviewed, setTopReviewed] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        summaryRes,
        ordersRes,
        ratingsRes,
        reviewedRes,
        revenueRes
      ] = await Promise.all([
        api.get('/admin/dashboard/summary'),
        api.get('/admin/dashboard/orders/monthly'),
        api.get('/admin/dashboard/ratings/breakdown'),
        api.get('/admin/dashboard/reviews/top-books'),
        api.get('/admin/dashboard/revenue/monthly')
      ]);

      setSummary(summaryRes.data);
      setMonthlyOrders(ordersRes.data);
      setRatingBreakdown(ratingsRes.data);
      setTopReviewed(reviewedRes.data);
      setMonthlyRevenue(revenueRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#d61a3c'];

  return (
    <div className="admin-dashboard">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <div className="admin-content">
          <h2> Admin Dashboard</h2>

          {/* Summary Cards */}
          {summary && (
            <div className="dashboard-cards">
              <div className="card"> Total Books: {summary.totalBooks}</div>
              <div className="card"> Total Users: {summary.totalUsers}</div>
              <div className="card"> Total Orders: {summary.totalOrders}</div>
              <div className="card"> Active Orders: {summary.activeOrders}</div>
              <div className="card"> Total Reviews: {summary.totalReviews}</div>
              <div className="card"> Top Rated: {summary.topRatedBook} ({summary.topRatedBookAverage})</div>
            </div>
          )}

          {/* Charts */}
          <div className="dashboard-charts">

            {/* Monthly Orders Chart */}
            <div className="chart-box">
              <h4> Orders by Month</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyOrders}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orderCount" stroke="#007bff" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Ratings Breakdown Pie */}
            <div className="chart-box">
              <h4> Ratings Breakdown</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ratingBreakdown}
                    dataKey="count"
                    nameKey="rating"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {ratingBreakdown.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Reviewed Books Chart */}
            <div className="chart-box">
              <h4> Most Reviewed Books</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topReviewed}>
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="reviewCount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="chart-box">
              <h4> Revenue by Month</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyRevenue}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="totalRevenue" stroke="#28a745" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
