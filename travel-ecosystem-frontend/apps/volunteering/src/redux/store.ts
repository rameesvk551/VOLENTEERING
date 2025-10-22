import { configureStore } from '@reduxjs/toolkit';
import hostFormReducer from './Slices/hostFormSlice';
import hostReducer from './Slices/hostSlice';
import volenteerReducer from './Slices/userSlice';

export const store = configureStore({
  reducer: {
    hostForm: hostFormReducer,
    host: hostReducer,
    volenteer: volenteerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
