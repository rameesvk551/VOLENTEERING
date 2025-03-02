import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./adminSlice";
import hostFormReducer from "./hostFormSlice";

export const store = configureStore({
    reducer: {
        admin: adminReducer,
        hostForm: hostFormReducer, 
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
