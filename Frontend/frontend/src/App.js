import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'; 
import Bestsellers from './pages/Bestsellers';
import Home from './pages/Home';  
import StaffOrderPortal from './pages/Staff/Orders';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bestsellers" element={<Bestsellers />} />
        <Route path="/stafforder" element={<StaffOrderPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
