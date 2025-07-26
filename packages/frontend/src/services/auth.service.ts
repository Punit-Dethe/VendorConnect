import { UserLogin, UserRegistration, AuthResponse, User } from '@vendor-supplier/shared'
import { api } from './api'

class AuthService {
  async login(credentials: UserLogin): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials)
    return response.data.data
  }

  async register(userData: UserRegistration): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData)
    return response.data.data
  }

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile')
    return response.data.data
  }

  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = localStorage.getItem('refreshToken')
    const response = await api.post('/auth/refresh-token', { refreshToken })
    return response.data.data
  }
}

export const authService = new AuthService()