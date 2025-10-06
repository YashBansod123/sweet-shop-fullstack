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

// Add this function to frontend/src/lib/api.js

export const getSweets = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await apiClient.get('/sweets', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch sweets:", error);
    throw error.response ? error.response.data : new Error('API request failed');
  }
};
// Add this function to frontend/src/lib/api.js

export const addSweet = async (sweetData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await apiClient.post('/sweets', sweetData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const purchaseSweet = async (sweetId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await apiClient.post(
      `/sweets/${sweetId}/purchase`,
      { quantity: 1 }, // We'll purchase one at a time
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


export const deleteSweet = async (sweetId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await apiClient.delete(`/sweets/${sweetId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getSweetById = async (sweetId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const response = await apiClient.get(`/sweets/${sweetId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateSweet = async (sweetId, sweetData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    const response = await apiClient.put(`/sweets/${sweetId}`, sweetData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getCartWithItems= async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await apiClient.get('/cart', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addToCart = async (sweetId, quantity) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  const response = await apiClient.post('/cart/items', { sweetId, quantity }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
// You will add more functions here later (e.g., getSweets, purchaseSweet)