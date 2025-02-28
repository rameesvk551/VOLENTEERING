
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { User, AdminState, admiAuth, Host } from "../redux/type"; // Ensure correct path
import server from "../server/app";

// Initial State
const initialState: AdminState = {
    volunteers: [],
    hosts:[],
    loading: false,
    error: null,
    admin: null
};
// Fetch all users (Admin Access Only)
export const loadAdmin = createAsyncThunk<admiAuth, void>(
    "admin/loadAdmin",
    async (_, { rejectWithValue }) => {
        try {
            console.log("loading admin...");
            const { data } = await axios.get(`${server}/admin/load-admin`,{withCredentials:true});
            console.log("admin loaded:", data);
            return data.admin;
        } catch (error: any) {
            console.error("Error fetching users:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data || "Failed to fetch users");
        }
    }
);

// Fetch all users (Admin Access Only)
export const getAllUsers = createAsyncThunk<User[], void>(
    "admin/getAllUsers",
    async (_, { rejectWithValue }) => {
        try {
            console.log("Fetching all users...");
            const { data } = await axios.get(`${server}/admin/get-all-volenteers`,{withCredentials:true});
            console.log("Users fetched:", data);
            return data.volunteers;
        } catch (error: any) {
            console.error("Error fetching users:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data || "Failed to fetch users");
        }
    }
);

// Delete a user
export const deleteUser = createAsyncThunk<string, string>(
    "admin/deleteUser",
    async (userId, { rejectWithValue }) => {
        try {
            await axios.delete(`${server}/admin/block-volunteer/${userId}`);
            return userId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to delete user");
        }
    }
);

// Update a user
export const updateUser = createAsyncThunk<User, { userId: string; userData: Partial<User> }>(
    "admin/updateUser",
    async ({ userId, userData }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`${server}/admin/edit-volunteer/${userId}`, userData);
            return data.updatedUser;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to update user");
        }
    }
);

// Fetch all users (Admin Access Only)
export const getAllHosts = createAsyncThunk<Host[], void>(
    "admin/getAllHosts",
    async (_, { rejectWithValue }) => {
        try {
            console.log("Fetching all host...");
            const { data } = await axios.get(`${server}/admin/get-all-hosts`,{withCredentials:true});
            console.log("host fetched:", data);
            return data.hosts;
        } catch (error: any) {
            console.error("Error fetching hosts:", error.response?.data || error.message);
            return rejectWithValue(error.response?.data || "Failed to fetch host");
        }
    }
);
const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
         // load admin
         .addCase(loadAdmin.pending, (state) => {
            state.loading = true;
        })
        .addCase(loadAdmin.fulfilled, (state, action: PayloadAction<admiAuth>) => {
            state.admin = action.payload;
            state.loading = false;
            state.error = null;
            console.log("in redddducer",state.admin);
            
        })
        .addCase(loadAdmin.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
            // Fetch Users
            .addCase(getAllUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.volunteers = action.payload;
                state.loading = false;
                state.error = null;
                console.log("in redddducer",state.volunteers);
                
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Delete User
            .addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
                state.volunteers = state.volunteers.filter((user) => user._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Update User
            .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
                const index = state.volunteers.findIndex((user) => user._id === action.payload._id);
                if (index !== -1) {
                    state.volunteers[index] = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.error = action.payload as string;
            })
             // Fetch Users
             .addCase(getAllHosts.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllHosts.fulfilled, (state, action: PayloadAction<Host[]>) => {
                state.hosts = action.payload;
                state.loading = false;
                state.error = null;
                console.log("in redddducer",state.volunteers);
                
            })
            .addCase(getAllHosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default adminSlice.reducer;
