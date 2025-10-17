
export interface Volenteer {
    _id: string;  // ObjectId is stored as a string in JSON
    firstName: string;
    lastName: string;
    email: string;
    role: "volunteer" | "admin" | "host";
    avatar: string;
    skills: string;
    status: "active" | "inactive";
    availability: string;
    verified: boolean;
    createdAt: string;  // Date should be stored as an ISO string
    activities: string; // Change to `string[]` if multiple activities
    description: string;
    travelStatus: string;
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
    volunteers: Volenteer[];
    hosts:Host[]
    loading: boolean;
    admin:admiAuth | null
    error: string | null;
}

// Authentication state type for Redux
export interface AuthState {
    user: Volenteer | null;
    loading: boolean;
}

export interface admiAuth {
    user: Volenteer | null;
    loading: boolean;
}