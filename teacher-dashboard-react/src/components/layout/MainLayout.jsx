import React, { useState } from 'react'
import AuthSection from '../features/AuthSection'
import UserInfo from '../features/UserInfo'
import DashboardContent from '../features/DashboardContent'
import StudentManagement from '../features/StudentManagement'
import SyllabusAssignmentView from '../features/SyllabusAssignmentView'
import AnalyticsView from '../features/AnalyticsView'
import Navigation from './Navigation'
import { useAuthStore } from '../../stores/authStore'

function MainLayout() {
  const { currentUser } = useAuthStore()

  // Load saved view from localStorage or default to 'dashboard'
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('teacherDashboardCurrentView')
    return savedView || 'dashboard'
  })

  // Handle view change with localStorage persistence
  const handleViewChange = (view) => {
    setCurrentView(view)
    localStorage.setItem('teacherDashboardCurrentView', view)
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardContent />
      case 'students':
        return <StudentManagement />
      case 'assignments':
        return <SyllabusAssignmentView />
      case 'analytics':
        return <AnalyticsView />
      default:
        return <DashboardContent />
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {!currentUser ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AuthSection />
        </div>
      ) : (
        <>
          <Navigation currentView={currentView} onViewChange={handleViewChange} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <UserInfo />
            {renderContent()}
          </div>
        </>
      )}
    </main>
  )
}

export default MainLayout