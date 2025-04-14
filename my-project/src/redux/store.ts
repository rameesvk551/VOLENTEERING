import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./Slices/adminSlice";
import hostFormReducer from "./Slices/hostFormSlice";
import hostReducer from "./Slices/hostSlice";
import volenteerReducer from "./Slices/userSlice";
import messageReducer from "./Slices/messageSlice";
import attractionsReducer from "./Slices/attraction";


export const store = configureStore({
    reducer: {
        admin: adminReducer,
        hostForm: hostFormReducer, 
        host:hostReducer,
        volenteer:volenteerReducer,
        message: messageReducer,
    attractions:attractionsReducer

    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
