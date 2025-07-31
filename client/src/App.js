import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Server, Zap, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import grpcClient from './services/grpcClient';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import './App.css';

function App() {
  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '', show: false });
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0, moderators: 0 });

  // Initialize app and check gRPC connection
  useEffect(() => {
    checkConnection();
    loadUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  // Calculate stats whenever users change
  useEffect(() => {
    const newStats = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      users: users.filter(u => u.role === 'user').length,
      moderators: users.filter(u => u.role === 'moderator').length,
    };
    setStats(newStats);
  }, [users]);

  // Check gRPC connection health
  const checkConnection = async () => {
    try {
      const response = await grpcClient.healthCheck();
      setConnectionStatus(response.success ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Health check failed:', error);
      setConnectionStatus('error');
    }
  };

  // Show message with auto-hide
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type, show: true });
    setTimeout(() => {
      setMessage(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Load users from gRPC service
  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading users via gRPC...');
      const response = await grpcClient.listUsers(1, 100); // Load all users
      
      if (response.success) {
        setUsers(response.users);
        console.log(`✅ Loaded ${response.users.length} users via gRPC`);
      } else {
        showMessage('Failed to load users', 'error');
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      showMessage('Connection error: ' + error.message, 'error');
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Handle user form submission
  const handleSaveUser = async (userData) => {
    setFormLoading(true);
    try {
      let response;
      
      if (selectedUser) {
        console.log(`🔄 Updating user ${selectedUser.id} via gRPC...`);
        response = await grpcClient.updateUser(selectedUser.id, userData);
      } else {
        console.log('🔄 Creating new user via gRPC...');
        response = await grpcClient.createUser(userData);
      }

      if (response.success) {
        showMessage(response.message, 'success');
        setShowForm(false);
        setSelectedUser(null);
        loadUsers(); // Reload users
        console.log(`✅ ${selectedUser ? 'Updated' : 'Created'} user successfully`);
      } else {
        showMessage(response.message, 'error');
      }
    } catch (error) {
      console.error('❌ Error saving user:', error);
      showMessage('Error: ' + error.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle user edit
  const handleEditUser = (user) => {
    console.log(`📝 Editing user: ${user.name} (ID: ${user.id})`);
    setSelectedUser(user);
    setShowForm(true);
  };

  // Handle user deletion
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete "${userName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      console.log(`🗑️ Deleting user ${userId} via gRPC...`);
      const response = await grpcClient.deleteUser(userId);

      if (response.success) {
        showMessage(response.message, 'success');
        loadUsers(); // Reload users
        console.log(`✅ Deleted user ${userId} successfully`);
      } else {
        showMessage(response.message, 'error');
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      showMessage('Error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle form cancellation
  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  // Get connection status color and icon
  const getConnectionDisplay = () => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, text: 'Connected' };
      case 'disconnected':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertCircle, text: 'Disconnected' };
      case 'error':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle, text: 'Error' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: Activity, text: 'Checking...' };
    }
  };

  const connectionDisplay = getConnectionDisplay();
  const ConnectionIcon = connectionDisplay.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Server className="text-indigo-600" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">gRPC User Management</h1>
                <p className="text-gray-600 mt-1">Microservice Architecture with Protocol Buffers</p>
              </div>
            </div>

            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${connectionDisplay.bg}`}>
              <ConnectionIcon className={connectionDisplay.color} size={20} />
              <span className={`font-semibold ${connectionDisplay.color}`}>
                gRPC: {connectionDisplay.text}
              </span>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-600 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-indigo-800">{stats.total}</p>
                </div>
                <Users className="text-indigo-400" size={24} />
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Admins</p>
                  <p className="text-2xl font-bold text-red-800">{stats.admins}</p>
                </div>
                <span className="text-2xl">👑</span>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Users</p>
                  <p className="text-2xl font-bold text-green-800">{stats.users}</p>
                </div>
                <span className="text-2xl">👤</span>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Moderators</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.moderators}</p>
                </div>
                <span className="text-2xl">🛡️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.show && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 fade-in ${
            message.type === 'error' 
              ? 'bg-red-100 text-red-800 border border-red-200' 
              : message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {message.type === 'error' ? (
              <AlertCircle size={20} />
            ) : message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <Activity size={20} />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 fade-in">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search size={20} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={checkConnection}
                disabled={loading}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 btn-hover disabled:opacity-50"
              >
                <Activity size={16} />
                Test Connection
              </button>
              <button
                onClick={() => setShowForm(true)}
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 btn-hover disabled:opacity-50"
              >
                <Plus size={16} />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* User Form */}
          {showForm && (
            <div className="xl:col-span-1">
              <UserForm
                user={selectedUser}
                onSave={handleSaveUser}
                onCancel={handleCancelForm}
                loading={formLoading}
              />
            </div>
          )}

          {/* User List */}
          <div className={`${showForm ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
            <UserList
              users={filteredUsers}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              loading={loading}
            />
          </div>
        </div>

        {/* gRPC Architecture Info */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200 fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="text-indigo-600" size={24} />
            <h3 className="text-xl font-bold text-indigo-800">gRPC Microservice Architecture</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-500">
              <h4 className="font-semibold text-indigo-800 mb-2">Frontend (React)</h4>
              <p className="text-gray-700">HTTP client communicating with gRPC proxy</p>
              <p className="text-xs text-gray-500 mt-1">Port: 3000</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800 mb-2">Proxy Server (Express)</h4>
              <p className="text-gray-700">HTTP to gRPC protocol translation</p>
              <p className="text-xs text-gray-500 mt-1">Port: 8080</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
              <h4 className="font-semibold text-orange-800 mb-2">gRPC Server (Node.js)</h4>
              <p className="text-gray-700">Pure gRPC with Protocol Buffers</p>
              <p className="text-xs text-gray-500 mt-1">Port: 50051</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Data Flow:</span> React → HTTP (JSON) → Proxy → gRPC (Protocol Buffers) → Server
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;