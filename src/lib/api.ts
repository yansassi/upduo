const API_BASE_URL = 'https://upduo.top/api' // HostGator PHP server

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface User {
  id: string
  email: string
  name?: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterResponse {
  user: User
  token: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const token = localStorage.getItem('auth_token')
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      }

      console.log('API Request:', { url, method: config.method || 'GET' })

      const response = await fetch(url, config)
      const data = await response.json()

      console.log('API Response:', { status: response.status, data })

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Erro na requisição'
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (error) {
      console.error('API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão'
      }
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async register(email: string, password: string): Promise<ApiResponse<RegisterResponse>> {
    return this.request<RegisterResponse>('/register.php', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.request('/logout.php', {
      method: 'POST'
    })
    
    // Limpar token local independente da resposta do servidor
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    
    return result
  }

  async verifyToken(): Promise<ApiResponse<User>> {
    return this.request<User>('/verify-token.php', {
      method: 'GET'
    })
  }

  async getProfile(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/profile.php?id=${userId}`, {
      method: 'GET'
    })
  }

  async updateProfile(userId: string, profileData: any): Promise<ApiResponse<any>> {
    return this.request('/profile.php', {
      method: 'PUT',
      body: JSON.stringify({ id: userId, ...profileData })
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Utilitários para gerenciar autenticação local
export const authStorage = {
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token)
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('auth_token')
  },
  
  removeToken: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
  },
  
  setUser: (user: User) => {
    localStorage.setItem('user_data', JSON.stringify(user))
  },
  
  getUser: (): User | null => {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token')
  }
}
