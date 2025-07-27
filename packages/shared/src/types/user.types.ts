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
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  name: string;
  mobile: string;
  email?: string;
  password_hash: string; // The hashed password from registration
  role: 'vendor' | 'supplier';
  businessType: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface UserProfileUpdateRequest {
  name?: string;
  email?: string;
  businessType?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
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

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}