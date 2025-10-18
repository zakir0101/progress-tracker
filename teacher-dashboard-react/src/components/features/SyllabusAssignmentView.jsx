import React, { useState, useEffect } from 'react'
import StatusMessage from '../ui/StatusMessage'
import { useDashboardStore } from '../../stores/dashboardStore'

function SyllabusAssignmentView() {
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
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Syllabus Assignment</h2>

        <StatusMessage
          message={statusMessage.text}
          type={statusMessage.type}
          onClose={() => setStatusMessage('')}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              ℹ️
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-1">Syllabus Assignment</h3>
              <p className="text-blue-700 text-sm">
                Use this form to assign syllabuses to students. Students will automatically see the assigned syllabus
                in their tracker and can start tracking their progress.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="studentEmail" className="block text-sm font-semibold text-gray-800 mb-3">
                Select Student
              </label>
              <div className="relative">
                <select
                  id="studentEmail"
                  value={formData.studentEmail}
                  onChange={(e) => handleChange('studentEmail', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none pr-12"
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

            <div>
              <label htmlFor="syllabusId" className="block text-sm font-semibold text-gray-800 mb-3">
                Select Syllabus
              </label>
              <div className="relative">
                <select
                  id="syllabusId"
                  value={formData.syllabusId}
                  onChange={(e) => handleChange('syllabusId', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-base focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none pr-12"
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
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-success px-8 py-3 text-base flex items-center justify-center gap-2"
              disabled={isAssigning}
            >
              {isAssigning ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning Syllabus...
                </>
              ) : (
                'Assign Syllabus'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Assignment Statistics */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Assignment Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-semibold">Total Students</p>
            <p className="text-2xl font-bold text-blue-800">{uniqueStudents.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-semibold">Available Syllabuses</p>
            <p className="text-2xl font-bold text-green-800">{assignmentSyllabuses.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-semibold">Total Assignments</p>
            <p className="text-2xl font-bold text-purple-800">
              {allStudentsProgress.filter(s => s.syllabus_name !== 'contact').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SyllabusAssignmentView