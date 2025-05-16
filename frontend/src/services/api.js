import axios from 'axios';

const API_URL = "http://localhost:5000/api"; // Backend URL

// Mock Data (For testing if backend is not ready)
const mockEvents = [
  { title: "Alumni Networking Gala", date: "June 15, 2025", location: "Mediterranean College Main Hall" },
  { title: "Annual Alumni Meetup", date: "August 20, 2025", location: "Mediterranean College Garden" },
];

const mockMessages = [
  { sender: "John Doe", text: "Hey, it was great meeting you at the alumni event!" },
  { sender: "Jane Smith", text: "Are you attending the next alumni meetup?" }
];

const mockProfile = {
  fullName: "John Doe",
  email: "john.doe@example.com",
  school: "Engineering School",
  graduationYear: "2023"
};

// Register User
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error.response.data);
    throw error;
  }
};

// Fetch Events
export const fetchEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/events`);
    return response.data;
  } catch (error) {
    console.warn("Backend not ready, loading mock events.");
    return mockEvents;
  }
};

// Fetch Messages
export const fetchMessages = async () => {
  try {
    const response = await axios.get(`${API_URL}/messages`);
    return response.data;
  } catch (error) {
    console.warn("Backend not ready, loading mock messages.");
    return mockMessages;
  }
};

// Fetch User Profile
export const fetchProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`);
    return response.data;
  } catch (error) {
    console.warn("Backend not ready, loading mock profile.");
    return mockProfile;
  }
};

// Update User Profile
export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_URL}/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};