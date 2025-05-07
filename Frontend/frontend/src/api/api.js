// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5046/api', // Or your backend URL
});

export default api;
