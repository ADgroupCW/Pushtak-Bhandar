import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'; // make sure this file exists
import Bestsellers from './pages/Bestsellers';
import Home from './pages/Home';      // make sure this file exists

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/bestsellers" element={<Bestsellers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
