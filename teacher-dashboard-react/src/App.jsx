import React from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import MainLayout from './components/layout/MainLayout'
import { useAuthStore } from './stores/authStore'
import { useDashboardStore } from './stores/dashboardStore'

function App() {
  const { currentUser, isLoading, initializeAuth } = useAuthStore()
  const { loadDashboardData } = useDashboardStore()

  React.useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  React.useEffect(() => {
    if (currentUser) {
      loadDashboardData()
    }
  }, [currentUser, loadDashboardData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <MainLayout />
      <Footer />
    </div>
  )
}

export default App