import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useDashboardStore } from '../../stores/dashboardStore'

function StudentDetailModal({ student, isOpen, onClose }) {
  const {
    assignSyllabus,
    removeSyllabus,
    allSyllabuses,
    allStudentsProgress,
    setStatusMessage,
    loadDashboardData
  } = useDashboardStore()
  const [selectedSyllabus, setSelectedSyllabus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [dragOver, setDragOver] = useState(false)
  const [draggedSyllabus, setDraggedSyllabus] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const modalRef = useRef(null)

  // Get updated student data from store whenever it changes
  const currentStudent = useMemo(() => {
    if (!student?.email) return null
    const studentData = allStudentsProgress.filter(s => s.email === student.email)
    if (studentData.length === 0) return null

    const mainStudent = studentData[0]
    return {
      email: mainStudent.email,
      name: mainStudent.name,
      syllabuses: studentData,
      totalProgress: studentData.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / studentData.length
    }
  }, [student, allStudentsProgress, refreshTrigger])

  const handleDragStart = useCallback((e, syllabus) => {
    setDraggedSyllabus(syllabus)
    e.dataTransfer.setData('text/plain', syllabus.id)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setDragOver(false)

    const syllabusId = e.dataTransfer.getData('text/plain')
    const syllabus = allSyllabuses.find(s => s.id === syllabusId)

    if (syllabus && student?.email) {
      setIsLoading(true)
      try {
        await assignSyllabus(student.email, syllabus.id)
        setValidationErrors({})
        // Refresh data to update UI - the currentStudent will automatically update
        await loadDashboardData()
        // Force UI refresh by triggering the refresh trigger
        setRefreshTrigger(prev => prev + 1)
      } catch (error) {
        console.error('Failed to assign syllabus:', error)
        setStatusMessage('Failed to assign syllabus: ' + error.message, 'error')
      } finally {
        setIsLoading(false)
      }
    }
  }, [allSyllabuses, assignSyllabus, student?.email, setStatusMessage, loadDashboardData])

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Regular functions (not hooks) can be defined conditionally
  const handleAssignSyllabus = async () => {
    // Clear previous errors
    setValidationErrors({})

    // Validate form
    const errors = {}
    if (!selectedSyllabus) {
      errors.syllabus = 'Please select a syllabus to assign'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    // Check if syllabus is already assigned
    const isAlreadyAssigned = currentStudent.syllabuses?.some(
      s => s.syllabus_name === allSyllabuses.find(syllabus => syllabus.id === selectedSyllabus)?.name
    )

    if (isAlreadyAssigned) {
      setStatusMessage('This syllabus is already assigned to the student', 'warning')
      return
    }

    setIsLoading(true)
    try {
      await assignSyllabus(currentStudent.email, selectedSyllabus)
      setSelectedSyllabus('')
      setValidationErrors({})
      // Refresh data to update UI
      await loadDashboardData()
      // Force UI refresh by triggering the refresh trigger
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Failed to assign syllabus:', error)
      setStatusMessage('Failed to assign syllabus: ' + error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSyllabus = async (syllabus) => {
    if (window.confirm(`Are you sure you want to remove "${syllabus.syllabus_name}" from ${currentStudent.name}? All progress data for this syllabus will be permanently deleted.`)) {
      setIsRemoving(true)
      try {
        // Find the syllabus ID from the syllabus name
        const syllabusObj = allSyllabuses.find(s => s.name === syllabus.syllabus_name)
        if (syllabusObj) {
          await removeSyllabus(currentStudent.email, syllabusObj.id)
          // Refresh data to update UI
          await loadDashboardData()
          // Force UI refresh by triggering the refresh trigger
          setRefreshTrigger(prev => prev + 1)
        } else {
          throw new Error('Could not find syllabus ID')
        }
      } catch (error) {
        console.error('Failed to remove syllabus:', error)
      } finally {
        setIsRemoving(false)
      }
    }
  }

  // Get available syllabuses (not already assigned)
  const availableSyllabuses = useMemo(() => {
    if (!currentStudent) return []
    return allSyllabuses.filter(syllabus =>
      !currentStudent.syllabuses?.some(s => s.syllabus_name === syllabus.name)
    )
  },
    [allSyllabuses, currentStudent, refreshTrigger]
  )

  if (!isOpen || !currentStudent) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{currentStudent.name}</h2>
              <p className="text-gray-600">{currentStudent.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-semibold">Total Syllabuses</p>
              <p className="text-2xl font-bold text-blue-800">{currentStudent.syllabuses?.length || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-semibold">Average Progress</p>
              <p className="text-2xl font-bold text-green-800">
                {Math.round(currentStudent.totalProgress || 0)}%
              </p>
            </div>
          </div>

          {/* Drag & Drop Syllabus Assignment */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Drag & Drop Syllabus Assignment</h3>

            {/* Available Syllabuses */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Syllabuses</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {availableSyllabuses.length > 0 ? (
                  availableSyllabuses.map(syllabus => (
                    <div
                      key={syllabus.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, syllabus)}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-move hover:bg-blue-100 transition-colors duration-200"
                    >
                      <p className="text-sm font-medium text-blue-800">{syllabus.name}</p>
                      <p className="text-xs text-blue-600">Drag to assign</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm col-span-2 text-center py-4">
                    All syllabuses are already assigned to this student.
                  </p>
                )}
              </div>
            </div>

            {/* Drop Zone */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Drop Zone</h4>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-6 border-2 border-dashed rounded-lg text-center transition-all duration-200 ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-blue-600 text-sm">Assigning syllabus...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 text-sm">
                      {dragOver ? 'Drop syllabus here to assign' : 'Drag a syllabus here to assign it'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Or use the traditional method below
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Traditional Assignment Method (Fallback) */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Traditional Assignment</h4>
              <div className="flex gap-2">
                <div className="flex-1">
                  <select
                    value={selectedSyllabus}
                    onChange={(e) => {
                      setSelectedSyllabus(e.target.value)
                      if (validationErrors.syllabus) {
                        setValidationErrors({...validationErrors, syllabus: ''})
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.syllabus ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a syllabus...</option>
                    {availableSyllabuses.map(syllabus => (
                      <option key={syllabus.id} value={syllabus.id}>
                        {syllabus.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.syllabus && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.syllabus}</p>
                  )}
                </div>
                <button
                  onClick={handleAssignSyllabus}
                  disabled={!selectedSyllabus || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>

          {/* Assigned Syllabuses */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Assigned Syllabuses</h3>
            {currentStudent.syllabuses && currentStudent.syllabuses.length > 0 ? (
              <div className="space-y-3">
                {currentStudent.syllabuses.map((syllabus, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{syllabus.syllabus_name || 'Unknown Syllabus'}</p>
                      <p className="text-sm text-gray-600">
                        Progress: {syllabus.progress_percentage || 0}% •
                        {syllabus.completed_count || 0}/{syllabus.total_topics || 0} topics
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveSyllabus(syllabus)}
                      disabled={isRemoving}
                      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {isRemoving ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No syllabuses assigned yet.</p>
            )}
          </div>

          {/* Progress Charts (Placeholder for future implementation) */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Progress Overview</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
              Progress charts and detailed analytics will be implemented in a future update.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetailModal