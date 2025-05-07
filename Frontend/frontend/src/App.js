import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Register from './pages/Register';
import Bestsellers from './pages/Bestsellers';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Cart from './pages/Cart'; 

 
import StaffOrderPortal from './pages/Staff/Orders';
import StaffDashboard from './pages/Staff/StaffDashboard';
import StaffLoginPage from './pages/Staff/StaffLogin';
import OrderHistory from './pages/Staff/OrderHistory';
import AdminDashboard from './pages/Admin/AdminDashboard';
import BookManagement from './pages/Admin/BookManagement';
import UserManagement from './pages/Admin/UserManagement';
import AnnouncementManager from './pages/Admin/AnnouncementManager';
import ReviewModeration from './pages/Admin/ReviewModeration';
import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOtp from './pages/VerifyResetOtp';
import ResetPassword from './pages/ResetPassword';
import AddBook from './pages/Admin/AddBook';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bestsellers" element={<Bestsellers />} />
        <Route path="/verifyotp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} /> 

        <Route path="/stafforder" element={<StaffOrderPortal />} />
        <Route path="/staffdashboard" element={<StaffDashboard />} />
        <Route path="/stafflogin" element={<StaffLoginPage />} />
        <Route path="/stafforderhistory" element={<OrderHistory />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<BookManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/announcements" element={<AnnouncementManager />} />
        <Route path="/admin/reviews" element={<ReviewModeration />} />
        <Route path="/admin/addbook" element={<AddBook />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
