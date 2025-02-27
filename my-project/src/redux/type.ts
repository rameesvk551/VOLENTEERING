// src/redux/type.ts

// User type definition
export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    status:string,
    age:number
    country:string
    role: "user" | "admin" | "host";
}

// Admin state type for Redux
export interface AdminState {
    volunteers: User[];
    loading: boolean;
    error: string | null;
}

// Authentication state type for Redux
export interface AuthState {
    user: User | null;
    loading: boolean;
}
