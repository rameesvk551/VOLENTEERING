import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./adminSlice";
import hostFormReducer from "./hostFormSlice";
import hostReducer from "./hostSlile";

export const store = configureStore({
    reducer: {
        admin: adminReducer,
        hostForm: hostFormReducer, 
        host:hostReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
