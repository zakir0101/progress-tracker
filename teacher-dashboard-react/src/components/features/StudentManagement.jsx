import React, { useState, useEffect } from 'react'
import { useDashboardStore } from '../../stores/dashboardStore'
import StatusMessage from '../ui/StatusMessage'
import StudentDetailModal from './StudentDetailModal'

function StudentManagement() {
  const {
    allStudentsProgress,
    allSyllabuses,
    statusMessage,
    setStatusMessage,
    assignSyllabus,
    removeSyllabus,
    loadDashboardData
  } = useDashboardStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSyllabus, setSelectedSyllabus] = useState('all')
  const [progressFilter, setProgressFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchValidation, setSearchValidation] = useState('')
  const [quickAssignSyllabus, setQuickAssignSyllabus] = useState('')
  const [quickAssignStudent, setQuickAssignStudent] = useState(null)

  // First group students by email
  const studentsByEmail = allStudentsProgress.reduce((acc, student) => {
    if (!acc[student.email]) {
      acc[student.email] = {
        email: student.email,
        name: student.name,
        syllabuses: []
      }
    }
    acc[student.email].syllabuses.push(student)
    return acc
  }, {})

  // Convert to array and calculate total progress
  const allStudents = Object.values(studentsByEmail).map(student => ({
    ...student,
    totalProgress: student.syllabuses.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / student.syllabuses.length
  }))

  // Filter students based on search and filters
  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())

    // Check if student has any syllabus that matches the selected syllabus filter
    const matchesSyllabus = selectedSyllabus === 'all' ||
      student.syllabuses.some(s => s.syllabus_name === selectedSyllabus)

    const matchesProgress = progressFilter === 'all' ||
      (progressFilter === '0-25' && student.totalProgress <= 25) ||
      (progressFilter === '25-50' && student.totalProgress > 25 && student.totalProgress <= 50) ||
      (progressFilter === '50-75' && student.totalProgress > 50 && student.totalProgress <= 75) ||
      (progressFilter === '75-100' && student.totalProgress > 75)

    return matchesSearch && matchesSyllabus && matchesProgress
  })

  const uniqueStudents = filteredStudents

  const handleAssignSyllabus = async (studentEmail, syllabusId) => {
    setIsLoading(true)
    try {
      await assignSyllabus(studentEmail, syllabusId)
      setStatusMessage(`Syllabus assigned successfully to ${studentEmail}`, 'success')
    } catch (error) {
      setStatusMessage('Failed to assign syllabus: ' + error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSyllabus = async (studentEmail, syllabus) => {
    if (window.confirm(`Are you sure you want to remove "${syllabus.syllabus_name}" from this student? All progress data for this syllabus will be permanently deleted.`)) {
      try {
        // Find the syllabus ID from the syllabus name
        const syllabusObj = allSyllabuses.find(s => s.name === syllabus.syllabus_name)
        if (syllabusObj) {
          await removeSyllabus(studentEmail, syllabusObj.id)
          setStatusMessage(`Syllabus removed successfully from ${studentEmail}`, 'success')
        } else {
          throw new Error('Could not find syllabus ID')
        }
      } catch (error) {
        setStatusMessage('Failed to remove syllabus: ' + error.message, 'error')
      }
    }
  }

  const handleStudentClick = (student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
  }

  const handleQuickAssign = (student) => {
    setQuickAssignStudent(student)
    setQuickAssignSyllabus('')
  }

  const handleQuickAssignSubmit = async () => {
    if (!quickAssignSyllabus || !quickAssignStudent) {
      setStatusMessage('Please select a syllabus to assign', 'error')
      return
    }

    setIsLoading(true)
    try {
      await assignSyllabus(quickAssignStudent.email, quickAssignSyllabus)
      setStatusMessage(`Syllabus assigned successfully to ${quickAssignStudent.name}`, 'success')
      setQuickAssignStudent(null)
      setQuickAssignSyllabus('')
      await loadDashboardData()
    } catch (error) {
      setStatusMessage('Failed to assign syllabus: ' + error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseQuickAssign = () => {
    setQuickAssignStudent(null)
    setQuickAssignSyllabus('')
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Management</h2>

        <StatusMessage
          message={statusMessage.text}
          type={statusMessage.type}
          onClose={() => setStatusMessage('')}
        />

        {/* Search and Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Search Students
            </label>
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchTerm(value)

                  // Validate search input
                  if (value.length > 0 && value.length < 2) {
                    setSearchValidation('Search term must be at least 2 characters')
                  } else if (value.length > 50) {
                    setSearchValidation('Search term must be less than 50 characters')
                  } else {
                    setSearchValidation('')
                  }
                }}
                className={`w-full px-4 py-3 md:py-3 border-2 rounded-lg bg-white text-base md:text-base focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                  searchValidation ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
              />
              {searchValidation && (
                <p className="text-red-500 text-sm">{searchValidation}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Filter by Syllabus
            </label>
            <div className="relative">
              <select
                value={selectedSyllabus}
                onChange={(e) => setSelectedSyllabus(e.target.value)}
                className="w-full px-4 py-3 md:py-3 border-2 border-gray-300 rounded-lg bg-white text-base md:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none pr-12"
              >
                <option value="all">All Syllabuses</option>
                {allSyllabuses.map(syllabus => (
                  <option key={syllabus.id} value={syllabus.name}>
                    {syllabus.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-500">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Filter by Progress
            </label>
            <div className="relative">
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="w-full px-4 py-3 md:py-3 border-2 border-gray-300 rounded-lg bg-white text-base md:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none pr-10"
              >
                <option value="all">All Progress</option>
                <option value="0-25">0-25%</option>
                <option value="25-50">25-50%</option>
                <option value="50-75">50-75%</option>
                <option value="75-100">75-100%</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-4">
          {uniqueStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students found matching your search criteria.
            </div>
          ) : (
            uniqueStudents.map(student => (
              <div
                key={student.email}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => handleStudentClick(student)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-gray-600 text-sm">{student.email}</p>
                    <div className="mt-2 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <span className="text-sm text-gray-500">
                        {student.syllabuses.length} syllabus{student.syllabuses.length !== 1 ? 'es' : ''} assigned
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        Avg. Progress: {Math.round(student.totalProgress)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStudentClick(student)
                      }}
                      className="btn-primary text-sm py-2 px-4 min-h-[44px] flex items-center justify-center"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuickAssign(student)
                      }}
                      className="btn-success text-sm py-2 px-4 min-h-[44px] flex items-center justify-center"
                    >
                      Quick Assign
                    </button>
                  </div>
                </div>

                {/* Assigned Syllabuses */}
                {student.syllabuses.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Assigned Syllabuses:</h4>
                    <div className="flex flex-wrap gap-2">
                      {student.syllabuses.map(syllabus => (
                        <div key={syllabus.syllabus_name} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm flex items-center space-x-2 min-h-[36px]">
                          <span className="text-xs sm:text-sm">{syllabus.syllabus_name}</span>
                          <span className="text-xs bg-blue-200 px-2 py-1 rounded">{syllabus.progress_percentage}%</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveSyllabus(student.email, syllabus)
                            }}
                            className="text-blue-500 hover:text-blue-700 text-sm w-6 h-6 flex items-center justify-center rounded-full hover:bg-blue-100 transition-colors"
                            title="Remove syllabus"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Quick Assign Modal */}
      {quickAssignStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Quick Assign Syllabus</h3>
              <button
                onClick={handleCloseQuickAssign}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Assign syllabus to <span className="font-semibold">{quickAssignStudent.name}</span>
                </p>
                <p className="text-xs text-gray-500">{quickAssignStudent.email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Select Syllabus
                </label>
                <select
                  value={quickAssignSyllabus}
                  onChange={(e) => setQuickAssignSyllabus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a syllabus...</option>
                  {allSyllabuses
                    .filter(syllabus => syllabus.id !== 'contact')
                    .filter(syllabus =>
                      !quickAssignStudent.syllabuses?.some(s => s.syllabus_name === syllabus.name)
                    )
                    .map(syllabus => (
                      <option key={syllabus.id} value={syllabus.id}>
                        {syllabus.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCloseQuickAssign}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickAssignSubmit}
                  disabled={!quickAssignSyllabus || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? 'Assigning...' : 'Assign Syllabus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentManagement