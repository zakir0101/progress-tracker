import React, { useState, useEffect } from 'react'
import StudentCard from '../ui/StudentCard'
import { useDashboardStore } from '../../stores/dashboardStore'

// Skeleton loading component for student cards
function StudentCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
      </div>

      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>

      <div className="mt-4">
        <div className="h-2 bg-gray-200 rounded-full w-full mb-2"></div>
        <div className="flex justify-between text-xs text-gray-400">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </div>
  )
}

function StudentGrid() {
  const {
    allSyllabuses,
    displayedStudents,
    allStudentsProgress,
    selectedViewSyllabusId,
    searchTerm,
    progressFilter,
    isLoading,
    isRefreshing: storeIsRefreshing,
    setSelectedViewSyllabusId,
    setSearchTerm,
    setProgressFilter,
    exportData,
    loadDashboardData
  } = useDashboardStore()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [filterTimeout, setFilterTimeout] = useState(null)

  // Handle search and filter changes with debouncing
  useEffect(() => {
    if (filterTimeout) {
      clearTimeout(filterTimeout)
    }

    if (searchTerm || progressFilter !== 'all' || selectedViewSyllabusId !== 'all') {
      setIsFiltering(true)
      const timeout = setTimeout(() => {
        setIsFiltering(false)
      }, 300)
      setFilterTimeout(timeout)
    } else {
      setIsFiltering(false)
    }

    return () => {
      if (filterTimeout) {
        clearTimeout(filterTimeout)
      }
    }
  }, [searchTerm, progressFilter, selectedViewSyllabusId])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadDashboardData()
    } finally {
      setIsRefreshing(false)
    }
  }

  const currentSyllabusName = selectedViewSyllabusId === 'all'
    ? 'All Syllabuses'
    : allSyllabuses.find(s => s.id === selectedViewSyllabusId)?.name || 'Unknown Syllabus'

  // Determine if we should show loading states
  const showLoading = isLoading || storeIsRefreshing || isRefreshing
  const showFiltering = isFiltering && !showLoading
  const showNoResults = !showLoading && !showFiltering && displayedStudents.length === 0
  const showStudents = !showLoading && !showFiltering && displayedStudents.length > 0
  const showError = !showLoading && !showFiltering && allStudentsProgress.length === 0 && allSyllabuses.length === 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
          <div>
            <h3 className="text-lg font-semibold">
              Student Progress - {currentSyllabusName}
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              {displayedStudents.length} student{displayedStudents.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <select
                value={selectedViewSyllabusId}
                onChange={(e) => setSelectedViewSyllabusId(e.target.value)}
                className="px-4 py-2 border border-blue-300 rounded-lg text-gray-700 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none pr-8 shadow-sm"
              >
                <option value="all">All Syllabuses</option>
                {allSyllabuses.map(syllabus => (
                  <option key={syllabus.id} value={syllabus.id}>
                    {syllabus.name} ({syllabus.id})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-600">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-blue-300 rounded-lg text-gray-700 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
            />

            <div className="relative">
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="px-4 py-2 border border-blue-300 rounded-lg text-gray-700 bg-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none pr-8 shadow-sm"
              >
                <option value="all">All Progress</option>
                <option value="0-25">0-25%</option>
                <option value="25-50">25-50%</option>
                <option value="50-75">50-75%</option>
                <option value="75-100">75-100%</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-600">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg text-sm font-medium hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>

            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm"
            >
              Export Data
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Loading state */}
        {showLoading && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="relative">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading student data</h3>
                <p className="text-sm text-gray-600 max-w-md">
                  {isRefreshing ? 'Refreshing latest data...' :
                   isLoading ? 'Fetching student progress and syllabus information...' :
                   'Loading dashboard data...'}
                </p>
                <div className="mt-3 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <StudentCardSkeleton key={index} />
              ))}
            </div>
          </div>
        )}

        {/* Filtering state */}
        {showFiltering && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-3 py-4">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm font-medium text-gray-700">Applying filters...</span>
              </div>
              <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                {searchTerm && `Search: "${searchTerm}"`}
                {progressFilter !== 'all' && ` • Progress: ${progressFilter}%`}
                {selectedViewSyllabusId !== 'all' && ` • Syllabus: ${currentSyllabusName}`}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <StudentCardSkeleton key={index} />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {showError && (
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Unable to load data</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              There was an error loading student data. Please check your connection and try refreshing the page.
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No results state */}
        {showNoResults && (
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No students found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              No students match your current search criteria. Try adjusting your filters or search terms.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
              {(progressFilter !== 'all' || selectedViewSyllabusId !== 'all') && (
                <button
                  onClick={() => {
                    setProgressFilter('all')
                    setSelectedViewSyllabusId('all')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Students display */}
        {showStudents && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {displayedStudents.length} student{displayedStudents.length !== 1 ? 's' : ''}
              </div>
              {displayedStudents.length > 0 && (
                <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  {searchTerm && `Search: "${searchTerm}"`}
                  {progressFilter !== 'all' && ` • Progress: ${progressFilter}%`}
                  {selectedViewSyllabusId !== 'all' && ` • Syllabus: ${currentSyllabusName}`}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedStudents.map((student, index) => (
                <StudentCard key={`${student.email}-${student.syllabus_name}-${index}`} student={student} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentGrid