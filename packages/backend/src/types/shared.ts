// Shared types for VendorConnect platform

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp?: Date;
}

export interface UserRegistration {
  name: string;
  mobile: string;
  email?: string;
  password: string;
  role: 'vendor' | 'supplier';
  businessType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface UserLogin {
  mobile: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: 'vendor' | 'supplier';
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  businessType: string;
  trustScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}