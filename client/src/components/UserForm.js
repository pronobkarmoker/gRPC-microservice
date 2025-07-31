import React, { useState, useEffect } from 'react';
import { Save, X, User, Mail, Shield } from 'lucide-react';

const UserForm = ({ user, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'user'
      });
    }
    setErrors({});
  }, [user]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Trim whitespace from form data
    const cleanedData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role
    };

    onSave(cleanedData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user'
    });
    setErrors({});
    onCancel();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="text-indigo-600" size={24} />
          {user ? 'Edit User' : 'Create New User'}
        </h2>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <X size={24} />
        </button>
      </div>

      <div onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="inline mr-1" />
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            disabled={loading}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.name 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 slide-in">{errors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail size={16} className="inline mr-1" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            disabled={loading}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.email 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 slide-in">{errors.email}</p>
          )}
        </div>

        {/* Role Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield size={16} className="inline mr-1" />
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              errors.role 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="viewer">Viewer</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600 slide-in">{errors.role}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-hover"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {user ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save size={16} />
                {user ? 'Update User' : 'Create User'}
              </>
            )}
          </button>
          
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-hover"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>

      {/* gRPC Info */}
      <div className="mt-6 p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
        <p className="text-sm text-indigo-700">
          <span className="font-semibold">gRPC Method:</span> {' '}
          {user ? 'UpdateUser(UpdateUserRequest)' : 'CreateUser(CreateUserRequest)'}
        </p>
      </div>
    </div>
  );
};

export default UserForm;