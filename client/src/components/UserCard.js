import React from 'react';
import { User, Mail, Shield, Calendar, Edit, Trash2 } from 'lucide-react';

const UserCard = ({ user, onEdit, onDelete, className = '' }) => {
  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      moderator: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      user: 'bg-green-100 text-green-800 border-green-200',
      viewer: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[role] || colors.user;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'moderator':
        return '🛡️';
      case 'viewer':
        return '👀';
      default:
        return '👤';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden card-hover ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{user.name}</h3>
              <p className="text-indigo-100 text-sm">ID: {user.id}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-white ${getRoleColor(user.role)}`}>
            <span className="mr-1">{getRoleIcon(user.role)}</span>
            {user.role}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center text-gray-600">
          <Mail className="mr-3 text-gray-400" size={18} />
          <span className="text-sm">{user.email}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Shield className="mr-3 text-gray-400" size={18} />
          <span className="text-sm">Role: {user.role}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Calendar className="mr-3 text-gray-400" size={18} />
          <span className="text-sm">Created: {formatDate(user.created_at)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(user)}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 btn-hover"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(user.id, user.name)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 btn-hover"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* gRPC Info */}
      <div className="px-6 py-2 bg-indigo-50 border-t border-indigo-100">
        <p className="text-xs text-indigo-600">
          <span className="font-semibold">gRPC Source:</span> UserService.GetUser()
        </p>
      </div>
    </div>
  );
};

export default UserCard;