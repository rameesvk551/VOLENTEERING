import axios from "axios";
import server from "./server/app";
import { QueryFunction } from "@tanstack/react-query";


export type FiltersType = {
  hostTypes: string[];
  numberOfWorkawayers: string;
  hostWelcomes:string[]
  place:string[]

};

type FilteredHostsResponse = {
  hosts: any[]; // replace `any` with your Host type if you have one
  currentPage: number;
  totalPages: number;
  totalHosts: number;
};

// Fetch hosts with pagination
export const fetchHosts: QueryFunction<FilteredHostsResponse, [string, FiltersType, string, number]> = async ({ queryKey }) => {
  const [, filters, place, page] = queryKey;
  const params = new URLSearchParams();
console.log("ppppppppplace in filter",place);

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
  params.append("limit", "10");

  const response = await axios.get(`${server}/hosts?${params.toString()}`);
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