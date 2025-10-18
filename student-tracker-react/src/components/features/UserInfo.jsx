import React from 'react'
import Button from '../ui/Button'

function UserInfo({ user, onLogout }) {
  if (!user) return null

  return (
    <div className="bg-green-50 p-4 rounded-lg mx-5 my-5 flex justify-between items-center border-l-4 border-green-500">
      <div className="flex items-center gap-4">
        <img
          src={user.picture}
          alt="User Avatar"
          className="w-10 h-10 rounded-full border-2 border-green-500"
        />
        <div>
          <strong className="text-gray-800">{user.name}</strong>
          <div className="text-sm text-gray-600">
            {user.email}
          </div>
        </div>
      </div>
      <Button
        variant="danger"
        onClick={onLogout}
      >
        Logout
      </Button>
    </div>
  )
}

export default UserInfo