import axios from "axios";
import server from "./server/app";



// Fetch hosts with pagination
export const fetchHosts = async (page: number, limit: number = 10) => {
  const response = await axios.get(`${server}/hosts?page=${page}&limit=${limit}`);
  console.log("hhhhhhhhhhhost res",response);
  
  return response.data;
};
export const fetchHostById = async (id: string) => {
  try {
    const response = await axios.get(`${server}/host-details/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching host by ID:", error);
    throw error;
  }
};