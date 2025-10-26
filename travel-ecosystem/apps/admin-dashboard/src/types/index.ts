export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'host' | 'volunteer';
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  hostId: string;
  hostName: string;
  createdAt: string;
}

export interface Host {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  rating: number;
  totalTrips: number;
  verified: boolean;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

export interface GearRental {
  id: string;
  name: string;
  category: string;
  description: string;
  pricePerDay: number;
  available: number;
  total: number;
  condition: 'excellent' | 'good' | 'fair';
  images: string[];
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  tripId?: string;
  tripTitle?: string;
  gearId?: string;
  gearName?: string;
  bookingType: 'trip' | 'gear';
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  authorId: string;
  authorName: string;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense' | 'refund';
  category: string;
  amount: number;
  description: string;
  relatedTo?: string;
  date: string;
  createdAt: string;
}

export interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
