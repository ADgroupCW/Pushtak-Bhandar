import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';

import Register from './pages/Register';
import Bestsellers from './pages/Bestsellers';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Cart from './pages/Cart'; 
import BookDetails from './pages/BookDetails';
 
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
import EditBook from './pages/Admin/EditBook';
import POrderHistory from './pages/OrderHistory';
import Bookmark from './pages/Bookmark';
import AllBooks from './pages/AllBooks';
import NewArrivals from './pages/NewArrivals';
import Deals from './pages/Deals';
import AwardWinners from './pages/AwardsWinners';
import NewReleases from './pages/NewRelease';
import AdminOrderManagement from './pages/Admin/AdminOrderManagement';
import ClaimCodeVerify from './pages/Staff/ClaimCodeVerify';
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bestsellers" element={<Bestsellers />} />
        <Route path="/allbooks" element={<AllBooks />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/awardwinners" element={<AwardWinners />}/>
        
        
        <Route path="/newrelease" element={<NewReleases />} /> 
        <Route path="/newarrivals" element={<NewArrivals />} />

        <Route path="/verifyotp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/bookmarks" element={<Bookmark />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} /> 
        <Route path="/book/:id" element={<BookDetails />} />


        <Route path="/stafforder" element={
          <ProtectedRoute allowedRoles={['staff']}>
              <StaffOrderPortal />
          </ProtectedRoute>
        } />

        <Route path="/staffclaim" element={
          <ProtectedRoute allowedRoles={['staff']}>
              <ClaimCodeVerify />
          </ProtectedRoute>
        } />

        <Route path="/staffdashboard" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />

        <Route path="/stafforderhistory" element={
          <ProtectedRoute allowedRoles={['staff']}>
            <OrderHistory />
          </ProtectedRoute>
        } />

        
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/books" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BookManagement />
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />

        <Route path="/admin/orders" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminOrderManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/announcements" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AnnouncementManager />
          </ProtectedRoute>
        } />

        <Route path="/admin/reviews" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReviewModeration />
          </ProtectedRoute>
        } />

        <Route path="/admin/addbook" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AddBook />
          </ProtectedRoute>
        } />

        <Route path="/admin/editbook/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EditBook />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={<POrderHistory />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;
