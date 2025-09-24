// frontend/src/lib/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // Your backend API URL
});

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/login', userData);
    // On successful login, save the token to local storage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// You will add more functions here later (e.g., getSweets, purchaseSweet)