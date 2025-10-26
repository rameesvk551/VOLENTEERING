import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import tripsReducer from './slices/tripsSlice';
import hostsReducer from './slices/hostsSlice';
import gearReducer from './slices/gearSlice';
import bookingsReducer from './slices/bookingsSlice';
import blogReducer from './slices/blogSlice';
import financeReducer from './slices/financeSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    trips: tripsReducer,
    hosts: hostsReducer,
    gear: gearReducer,
    bookings: bookingsReducer,
    blog: blogReducer,
    finance: financeReducer,
    analytics: analyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks for using dispatch and selector with proper types
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
