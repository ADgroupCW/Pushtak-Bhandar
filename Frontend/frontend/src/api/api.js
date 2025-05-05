// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:5046/api', // Or your backend URL
});

export default api;
