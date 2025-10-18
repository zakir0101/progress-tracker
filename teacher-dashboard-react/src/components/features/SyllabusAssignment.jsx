import React, { useState, useEffect } from 'react'
import StatusMessage from '../ui/StatusMessage'
import { useDashboardStore } from '../../stores/dashboardStore'

function SyllabusAssignment() {
  const {
    allSyllabuses,
    allStudentsProgress,
    statusMessage,
    setStatusMessage,
    assignSyllabus,
    loadDashboardData
  } = useDashboardStore()

  const [formData, setFormData] = useState({
    studentEmail: '',
    syllabusId: ''
  })
  const [isAssigning, setIsAssigning] = useState(false)

  // Load fresh data when component mounts
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.studentEmail || !formData.syllabusId) {
      setStatusMessage('Please select a student and syllabus.', 'error')
      return
    }

    setIsAssigning(true)
    try {
      await assignSyllabus(formData.studentEmail, formData.syllabusId)
      setFormData({ studentEmail: '', syllabusId: '' })
      // Data is automatically refreshed by assignSyllabus action
    } catch (error) {
      setStatusMessage('Failed to assign syllabus: ' + error.message, 'error')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Get unique students for dropdown
  const uniqueStudents = [...new Set(allStudentsProgress.map(student => student.email))]
    .map(email => {
      const student = allStudentsProgress.find(s => s.email === email)
      return { email, name: student?.name || email }
    })

  // Filter out contact syllabus from assignment options
  const assignmentSyllabuses = allSyllabuses.filter(s => s.id !== 'contact')

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 md:mb-6">
        Assign Syllabus to Student
      </h3>

      <StatusMessage
        message={statusMessage.text}
        type={statusMessage.type}
        onClose={() => setStatusMessage('')}
      />

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:space-x-4 md:items-end">
        <div className="flex-1">
          <label htmlFor="studentEmail" className="block text-sm font-semibold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
            <span className="truncate">Student:</span>
          </label>
          <div className="relative">
            <select
              id="studentEmail"
              value={formData.studentEmail}
              onChange={(e) => handleChange('studentEmail', e.target.value)}
              className="w-full px-4 py-4 md:py-3 border-2 border-gray-300 rounded-lg bg-white text-base md:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none pr-12 min-h-[48px] touch-manipulation"
              required
            >
              <option value="">Select a student</option>
              {uniqueStudents.map(student => (
                <option key={student.email} value={student.email}>
                  {student.name} ({student.email})
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

        <div className="flex-1">
          <label htmlFor="syllabusId" className="block text-sm font-semibold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            <span className="truncate">Syllabus to Assign:</span>
          </label>
          <div className="relative">
            <select
              id="syllabusId"
              value={formData.syllabusId}
              onChange={(e) => handleChange('syllabusId', e.target.value)}
              className="w-full px-4 py-4 md:py-3 border-2 border-gray-300 rounded-lg bg-white text-base md:text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none pr-12 min-h-[48px] touch-manipulation"
              required
            >
              <option value="">Select a syllabus</option>
              {assignmentSyllabuses.map(syllabus => (
                <option key={syllabus.id} value={syllabus.id}>
                  {syllabus.name} ({syllabus.id})
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

        <button
          type="submit"
          className="btn-success w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 md:py-3 text-base md:text-sm min-h-[48px] touch-manipulation active:scale-95 transition-transform"
          disabled={isAssigning}
        >
          {isAssigning ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="truncate">Assigning...</span>
            </>
          ) : (
            <span className="truncate">Assign Syllabus</span>
          )}
        </button>
      </form>
    </div>
  )
}

export default SyllabusAssignment