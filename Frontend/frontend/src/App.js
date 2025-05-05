import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'; // make sure this file exists
import Login from './pages/Login';       // make sure this file exists

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
