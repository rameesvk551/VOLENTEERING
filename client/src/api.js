import axios from "axios";
import server from "./server/app";
// Fetch hosts with pagination
export const fetchHosts = async ({ queryKey }) => {
    const [, filters, place, page] = queryKey;
    const params = new URLSearchParams();
    console.log("ppppppppplace in filter", place, filters);
    if (filters.hostTypes.length > 0) {
        params.append("hostTypes", filters.hostTypes.join(","));
    }
    if (filters.hostWelcomes.length > 0) {
        params.append("hostWelcomes", filters.hostWelcomes.join(","));
    }
    if (filters.numberOfWorkawayers !== "any") {
        params.append("numberOfWorkawayers", filters.numberOfWorkawayers);
    }
    if (place) {
        params.append("place", place); // ✅ No `.display_name`
    }
    params.append("page", page.toString());
    params.append("limit", "3");
    const response = await axios.get(`${server}/hosts?${params.toString()}`);
    return response.data;
};
export const fetchHostById = async (id) => {
    try {
        const response = await axios.get(`${server}/host-details/${id}`);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching host by ID:", error);
        throw error;
    }
};
