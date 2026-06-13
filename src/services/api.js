import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const analyzeJob = async (jobData) => {
  const response = await axios.post(`${API_URL}/job/analyze`, jobData);
  return response.data;
};

export const uploadCandidates = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${API_URL}/candidates/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const rankCandidates = async (jobId) => {
  const response = await axios.post(`${API_URL}/rank`, { jobId });
  return response.data;
};

export const getResultsCsvUrl = () => `${API_URL}/results/csv`;
