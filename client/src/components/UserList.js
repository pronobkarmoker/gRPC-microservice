import React from 'react';
import { Edit, Trash2, User, Mail, Shield, Calendar } from 'lucide-react';

const UserList = ({ users, onEdit, onDelete, loading }) => {
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Loading Users...</h2>
        </div>
        <div className="p-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 mb-4 border rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-full loading-skeleton"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded loading-skeleton w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded loading-skeleton w-1/2"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded loading-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center fade-in">
        <div className="flex flex-col items-center justify-center py-8">
          <User className="text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Users Found</h3>
          <p className="text-gray-500">Start by creating your first user.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden fade-in">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <User className="text-indigo-600" size={24} />
          Users ({users.length})
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Data fetched via gRPC ListUsers method
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr 
                key={user.id} 
                className="hover:bg-gray-50 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="text-indigo-600" size={20} />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Mail className="mr-2 text-gray-400" size={16} />
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                    <span className="mr-1">{getRoleIcon(user.role)}</span>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="mr-2 text-gray-400" size={16} />
                    {formatDate(user.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                      title="Edit User"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(user.id, user.name)}
                      className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                      title="Delete User"
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

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {users.map((user, index) => (
          <div 
            key={user.id} 
            className="p-6 slide-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">ID: {user.id}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                <span className="mr-1">{getRoleIcon(user.role)}</span>
                {user.role}
              </span>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="mr-2 text-gray-400" size={16} />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-2 text-gray-400" size={16} />
                {formatDate(user.created_at)}
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onEdit(user)}
                className="flex-1 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => onDelete(user.id, user.name)}
                className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* gRPC Info Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">gRPC Method:</span> ListUsers(ListUsersRequest) → ListUsersResponse
        </p>
      </div>
    </div>
  );
};

export default UserList;