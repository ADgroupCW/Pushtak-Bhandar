import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Bestsellers from './pages/Bestsellers';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Cart from './pages/Cart'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bestsellers" element={<Bestsellers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} /> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
