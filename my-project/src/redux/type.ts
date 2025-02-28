
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
export interface Host {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    status:string,
    description:string,
    isVerified:boolean
    country:string
    avatar:string
    role: "user" | "admin" | "host";
}

// Admin state type for Redux
export interface AdminState {
    volunteers: User[];
    hosts:Host[]
    loading: boolean;
    admin:admiAuth | null
    error: string | null;
}

// Authentication state type for Redux
export interface AuthState {
    user: User | null;
    loading: boolean;
}

export interface admiAuth {
    user: User | null;
    loading: boolean;
}