import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, AlertCircle, CheckCircle } from 'lucide-react';

// Mock gRPC client implementation
// In a real application, you would use grpc-web generated client
class UserServiceClient {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async makeRequest(method, data) {
    // Simulate gRPC call with REST API for demo purposes
    // In production, use proper gRPC-Web client
    const response = await fetch(`${this.baseUrl}/api/users${method === 'list' ? '' : `/${data?.id || ''}`}`, {
      method: method === 'list' ? 'GET' : method === 'create' ? 'POST' : method === 'update' ? 'PUT' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: method !== 'list' && method !== 'delete' ? JSON.stringify(data) : undefined,
    });
    
    return response.json();
  }

  async getUser(id) {
    // Simulate gRPC call
    const users = JSON.parse(localStorage.getItem('grpc_users') || '[]');
    const user = users.find(u => u.id === parseInt(id));
    return {
      user,
      success: !!user,
      message: user ? 'User retrieved successfully' : 'User not found'
    };
  }

  async createUser(userData) {
    const users = JSON.parse(localStorage.getItem('grpc_users') || '[]');
    const existingUser = users.find(u => u.email === userData.email);
    
    if (existingUser) {
      return {
        user: null,
        success: false,
        message: 'Email already exists'
      };
    }

    const newUser = {
      id: Date.now(),
      ...userData,
      role: userData.role || 'user',
      created_at: Date.now()
    };

    users.push(newUser);
    localStorage.setItem('grpc_users', JSON.stringify(users));

    return {
      user: newUser,
      success: true,
      message: 'User created successfully'
    };
  }

  async listUsers(page = 1, limit = 10) {
    const users = JSON.parse(localStorage.getItem('grpc_users') || '[]');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      total: users.length,
      success: true,
      message: 'Users retrieved successfully'
    };
  }

  async updateUser(userData) {
    const users = JSON.parse(localStorage.getItem('grpc_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userData.id);

    if (userIndex === -1) {
      return {
        user: null,
        success: false,
        message: 'User not found'
      };
    }

    const existingUser = users.find(u => u.email === userData.email && u.id !== userData.id);
    if (existingUser) {
      return {
        user: null,
        success: false,
        message: 'Email already exists'
      };
    }

    const updatedUser = { ...users[userIndex], ...userData };
    users[userIndex] = updatedUser;
    localStorage.setItem('grpc_users', JSON.stringify(users));

    return {
      user: updatedUser,
      success: true,
      message: 'User updated successfully'
    };
  }

  async deleteUser(id) {
    const users = JSON.parse(localStorage.getItem('grpc_users') || '[]');
    const userIndex = users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    users.splice(userIndex, 1);
    localStorage.setItem('grpc_users', JSON.stringify(users));

    return {
      success: true,
      message: 'User deleted successfully'
    };
  }
}

const UserManagementApp = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');

  const client = new UserServiceClient();

  // Initialize with sample data
  useEffect(() => {
    const initData = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', created_at: Date.now() },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', created_at: Date.now() },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', created_at: Date.now() }
    ];
    
    if (!localStorage.getItem('grpc_users')) {
      localStorage.setItem('grpc_users', JSON.stringify(initData));
    }
    
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await client.listUsers();
      if (response.success) {
        setUsers(response.users);
      } else {
        showMessage(response.message, 'error');
      }
    } catch (error) {
      showMessage('Failed to load users', 'error');
    }
    setLoading(false);
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let response;
      if (selectedUser) {
        response = await client.updateUser({ ...formData, id: selectedUser.id });
      } else {
        response = await client.createUser(formData);
      }

      if (response.success) {
        showMessage(response.message, 'success');
        setShowForm(false);
        setSelectedUser(null);
        setFormData({ name: '', email: '', role: 'user' });
        loadUsers();
      } else {
        showMessage(response.message, 'error');
      }
    } catch (error) {
      showMessage('Operation failed', 'error');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setLoading(true);
    try {
      const response = await client.deleteUser(id);
      if (response.success) {
        showMessage(response.message, 'success');
        loadUsers();
      } else {
        showMessage(response.message, 'error');
      }
    } catch (error) {
      showMessage('Failed to delete user', 'error');
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setShowForm(true);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setShowForm(false);
    setSelectedUser(null);
    setFormData({ name: '', email: '', role: 'user' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-indigo-600" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">gRPC User Management</h1>
                <p className="text-gray-600">Microservice Architecture Demo</p>
              </div>
            </div>
            <div className="bg-indigo-100 px-4 py-2 rounded-lg">
              <span className="text-indigo-800 font-semibold">Protocol: gRPC</span>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${
            message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add User
            </button>
          </div>
        </div>

        {/* User Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {selectedUser ? 'Edit User' : 'Create New User'}
            </h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : selectedUser ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Users ({filteredUsers.length})</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Architecture Info */}
        <div className="mt-6 bg-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-indigo-800 mb-2">Microservice Architecture</h3>
          <p className="text-indigo-700 mb-3">
            This application demonstrates gRPC-based microservice communication with the following components:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
              <strong>Frontend (React)</strong><br />
              gRPC-Web client with modern UI
            </div>
            <div className="bg-white p-3 rounded border-l-4 border-green-500">
              <strong>Backend (Node.js)</strong><br />
              gRPC server with Protocol Buffers
            </div>
            <div className="bg-white p-3 rounded border-l-4 border-orange-500">
              <strong>Proxy Server</strong><br />
              gRPC-Web proxy for browser compatibility
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementApp;