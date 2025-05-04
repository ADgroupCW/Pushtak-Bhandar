import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:5001/api',  // your backend base URL
});

export default api;
