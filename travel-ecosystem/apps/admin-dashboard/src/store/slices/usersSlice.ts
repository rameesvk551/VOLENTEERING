import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/services/api';
import { User, PaginatedResponse } from '@/types';

interface UsersState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pageSize: number;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pageSize: 10,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; pageSize?: number; search?: string }) => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  }
);

export const fetchUserById = createAsyncThunk('users/fetchUserById', async (id: string) => {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
});

export const createUser = createAsyncThunk('users/createUser', async (user: Partial<User>) => {
  const response = await api.post<User>('/users', user);
  return response.data;
});

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: string; data: Partial<User> }) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  }
);

export const deleteUser = createAsyncThunk('users/deleteUser', async (id: string) => {
  await api.delete(`/users/${id}`);
  return id;
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
