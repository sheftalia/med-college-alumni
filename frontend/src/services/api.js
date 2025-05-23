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

// Event Services
export const getAllEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    console.error("Get events error:", error.response?.data || error.message);
    throw error;
  }
};

export const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get event error:", error.response?.data || error.message);
    throw error;
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error("Create event error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error("Update event error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete event error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put('/alumni/role', { userId, role });
    return response.data;
  } catch (error) {
    console.error("Update user role error:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/alumni/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Delete user error:", error.response?.data || error.message);
    throw error;
  }
};

// Message Services
export const getUserMessages = async () => {
  try {
    const response = await api.get('/messages');
    return response.data;
  } catch (error) {
    console.error("Get messages error:", error.response?.data || error.message);
    throw error;
  }
};

export const getSentMessages = async () => {
  try {
    const response = await api.get('/messages/sent');
    return response.data;
  } catch (error) {
    console.error("Get sent messages error:", error.response?.data || error.message);
    throw error;
  }
};

export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/messages', messageData);
    return response.data;
  } catch (error) {
    console.error("Send message error:", error.response?.data || error.message);
    throw error;
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await api.put(`/messages/${id}/read`);
    return response.data;
  } catch (error) {
    console.error("Mark as read error:", error.response?.data || error.message);
    throw error;
  }
};

export default api;