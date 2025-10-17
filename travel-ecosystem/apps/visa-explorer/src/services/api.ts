import axios from 'axios';

const API_URL = 'http://localhost:5001/api/visa';

export const getVisaRequirements = async (country: string) => {
  try {
    const response = await axios.get(`${API_URL}/${country}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching visa requirements:', error);
    throw error;
  }
};
