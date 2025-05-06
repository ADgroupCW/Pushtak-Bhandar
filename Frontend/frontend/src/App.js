import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'; 
import Bestsellers from './pages/Bestsellers';
import Home from './pages/Home';  
import StaffOrderPortal from './pages/Staff/Orders';
import StaffDashboard from './pages/Staff/StaffDashboard';
import StaffLoginPage from './pages/Staff/StaffLogin';
import OrderHistory from './pages/Staff/OrderHistory';
import AdminDashboard from './pages/Admin/AdminDashboard';
import BookManagement from './pages/Admin/BookManagement';
import UserManagement from './pages/Admin/UserManagement';
import AnnouncementManager from './pages/Admin/AnnouncementManager';
import ReviewModeration from './pages/Admin/ReviewModeration';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bestsellers" element={<Bestsellers />} />
        <Route path="/stafforder" element={<StaffOrderPortal />} />
        <Route path="/staffdashboard" element={<StaffDashboard />} />
        <Route path="/stafflogin" element={<StaffLoginPage />} />
        <Route path="/stafforderhistory" element={<OrderHistory />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<BookManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/announcements" element={<AnnouncementManager />} />
        <Route path="/admin/reviews" element={<ReviewModeration />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
