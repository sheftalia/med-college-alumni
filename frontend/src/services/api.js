import axios from 'axios';

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Services
export const loginUser = async (userData) => {
  try {
    const response = await api.post('/auth/login', userData);
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error.response?.data || error.message);
    throw error;
  }
};

// Profile Services
export const createProfile = async (profileData) => {
  try {
    const response = await api.post('/profiles', profileData);
    return response.data;
  } catch (error) {
    console.error("Create profile error:", error.response?.data || error.message);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/profiles/me');
    return response.data;
  } catch (error) {
    console.error("Get profile error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateProfile = async (id, profileData) => {
  try {
    const response = await api.put(`/profiles/${id}`, profileData);
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error.response?.data || error.message);
    throw error;
  }
};

// Schools and Courses Services
export const getSchoolsAndCourses = async () => {
  try {
    const response = await api.get('/profiles/schools-courses');
    return response.data;
  } catch (error) {
    console.error("Get schools and courses error:", error.response?.data || error.message);
    throw error;
  }
};

// Alumni Services
export const getAllAlumni = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/alumni${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Get all alumni error:", error.response?.data || error.message);
    throw error;
  }
};

export const getAlumniById = async (id) => {
  try {
    const response = await api.get(`/alumni/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get alumni by ID error:", error.response?.data || error.message);
    throw error;
  }
};

export default api;