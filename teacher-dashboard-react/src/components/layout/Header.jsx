import React from 'react'
import { useAuthStore } from '../../stores/authStore'

function Header() {
  const { currentUser } = useAuthStore()

  return (
    <header className="bg-gradient-to-r from-gray-700 to-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Teacher Dashboard</h1>
          <p className="text-xl opacity-90">Multi-Syllabus Student Progress & Assignments</p>
          {currentUser && (
            <div className="mt-4 text-sm opacity-75">
              Welcome, {currentUser.name}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header