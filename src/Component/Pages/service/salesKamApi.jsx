import { BASE_URL, getStoredAuthToken } from './api';
import axios from 'axios';

export const getKAMDashboard = async () => {
  try {
    const token = getStoredAuthToken();
    const response = await axios.get(`${BASE_URL}/salesKam/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch KAM dashboard:', error);
    throw error.response?.data || { message: 'Failed to fetch KAM dashboard' };
  }
};
