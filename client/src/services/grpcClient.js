import axios from 'axios';

// Configure axios for the proxy server
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 HTTP->gRPC Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('📊 Request Data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ HTTP->gRPC Response: ${response.status} ${response.config.url}`);
    console.log('📊 Response Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ HTTP->gRPC Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * gRPC Client Service
 * This service communicates with the gRPC server through HTTP proxy
 */
class GrpcClientService {
  constructor() {
    this.serviceName = 'UserService';
  }

  /**
   * Health check - Test gRPC connection
   */
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return {
        success: true,
        data: response.data,
        message: 'Service is healthy'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Service unavailable',
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Get user by ID
   * gRPC Method: GetUser(GetUserRequest) -> GetUserResponse
   */
  async getUser(id) {
    try {
      const response = await api.get(`/api/users/${id}`);
      return {
        success: response.data.success,
        user: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: false,
          user: null,
          message: 'User not found',
          error_code: 'USER_NOT_FOUND'
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to get user');
    }
  }

  /**
   * Create new user
   * gRPC Method: CreateUser(CreateUserRequest) -> CreateUserResponse
   */
  async createUser(userData) {
    try {
      const response = await api.post('/api/users', userData);
      return {
        success: response.data.success,
        user: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (error.response?.status === 400) {
        return {
          success: false,
          user: null,
          message: error.response.data.message,
          error_code: error.response.data.error_code
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  }

  /**
   * List users with pagination and search
   * gRPC Method: ListUsers(ListUsersRequest) -> ListUsersResponse
   */
  async listUsers(page = 1, limit = 10, search = '') {
    try {
      const params = { page, limit };
      if (search) {
        params.search = search;
      }

      const response = await api.get('/api/users', { params });
      return {
        success: response.data.success,
        users: response.data.data.users,
        total: response.data.data.pagination.total,
        page: response.data.data.pagination.page,
        limit: response.data.data.pagination.limit,
        totalPages: response.data.data.pagination.totalPages,
        message: response.data.message
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to list users');
    }
  }

  /**
   * Update existing user
   * gRPC Method: UpdateUser(UpdateUserRequest) -> UpdateUserResponse
   */
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/api/users/${id}`, userData);
      return {
        success: response.data.success,
        user: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: false,
          user: null,
          message: 'User not found',
          error_code: 'USER_NOT_FOUND'
        };
      }
      if (error.response?.status === 400) {
        return {
          success: false,
          user: null,
          message: error.response.data.message,
          error_code: error.response.data.error_code
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  /**
   * Delete user by ID
   * gRPC Method: DeleteUser(DeleteUserRequest) -> DeleteUserResponse
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/api/users/${id}`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'User not found',
          error_code: 'USER_NOT_FOUND'
        };
      }
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  /**
   * Batch operations helper
   */
  async batchGetUsers(ids) {
    try {
      const promises = ids.map(id => this.getUser(id));
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        id: ids[index],
        success: result.status === 'fulfilled' && result.value.success,
        user: result.status === 'fulfilled' ? result.value.user : null,
        error: result.status === 'rejected' ? result.reason.message : 
               (result.value?.success === false ? result.value.message : null)
      }));
    } catch (error) {
      throw new Error('Failed to batch get users');
    }
  }
}

// Export singleton instance
const grpcClient = new GrpcClientService();
export default grpcClient;

// Export class for testing
export { GrpcClientService };