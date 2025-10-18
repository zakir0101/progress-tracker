import React from 'react'
import { useAuthStore } from '../../stores/authStore'

function UserInfo() {
  const { currentUser, logout } = useAuthStore()

  if (!currentUser) return null

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout()
    }
  }

  return (
    <div className="bg-green-50 rounded-lg p-5 border-l-4 border-green-500 mb-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.picture}
            alt="User Avatar"
            className="w-10 h-10 rounded-full border-2 border-green-500"
          />
          <div>
            <strong className="text-gray-800">{currentUser.name}</strong>
            <div className="text-sm text-gray-600">{currentUser.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn-danger text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default UserInfo