// src/services/api.js
import axios from "axios";

const API_URL = "https://feedback-3tr7.onrender.com";

// Get all feedback
export const getAllFeedback = async () => {
  const res = await axios.get(`${API_URL}/feedback`);
  return res.data.data || [];
};

// Add new feedback
export const addFeedback = async (feedbackData) => {
  const res = await axios.post(`${API_URL}/feedback`, feedbackData);
  if (!res.data.success) throw new Error(res.data.message || "Failed to add feedback");
  return res.data.data;
};

// Delete feedback
export const deleteFeedback = async (id) => {
  const res = await axios.delete(`${API_URL}/feedback/${id}`);
  return res.data;
};
