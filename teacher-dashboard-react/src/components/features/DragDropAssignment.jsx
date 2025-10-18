import React, { useState, useRef } from 'react'
import { useDashboardStore } from '../../stores/dashboardStore'

function DragDropAssignment({ student, onAssignmentComplete }) {
  const { allSyllabuses, assignSyllabus } = useDashboardStore()
  const [draggedSyllabus, setDraggedSyllabus] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropZoneRef = useRef(null)

  // Filter out syllabuses already assigned to the student
  const availableSyllabuses = allSyllabuses.filter(syllabus =>
    !student.syllabuses?.some(s => s.syllabus_name === syllabus.name)
  )

  const handleDragStart = (e, syllabus) => {
    setDraggedSyllabus(syllabus)
    e.dataTransfer.setData('text/plain', syllabus.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = (e) => {
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDragOver(false)

    const syllabusId = e.dataTransfer.getData('text/plain')
    const syllabus = allSyllabuses.find(s => s.id === syllabusId)

    if (syllabus && student) {
      setIsLoading(true)
      try {
        await assignSyllabus(student.email, syllabus.id)
        if (onAssignmentComplete) {
          onAssignmentComplete()
        }
      } catch (error) {
        console.error('Failed to assign syllabus:', error)
      } finally {
        setIsLoading(false)
      }
    }

    setDraggedSyllabus(null)
  }

  return (
    <div className="space-y-4">
      {/* Available Syllabuses */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Available Syllabuses</h4>
        {availableSyllabuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableSyllabuses.map(syllabus => (
              <div
                key={syllabus.id}
                draggable
                onDragStart={(e) => handleDragStart(e, syllabus)}
                className="bg-white border border-gray-300 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow duration-200 active:cursor-grabbing"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{syllabus.name}</p>
                    {syllabus.description && (
                      <p className="text-sm text-gray-600 mt-1">{syllabus.description}</p>
                    )}
                  </div>
                  <div className="text-gray-400 text-lg">↔️</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            All available syllabuses are already assigned to this student.
          </p>
        )}
      </div>

      {/* Drop Zone */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Assign to {student.name}
        </h4>
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
            ${isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-600">Assigning syllabus...</p>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-3">📚</div>
              <p className="text-gray-600 font-medium">
                {isDragOver ? 'Drop syllabus here' : 'Drag a syllabus here to assign'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Or use the dropdown in the student details modal
              </p>
            </>
          )}
        </div>
      </div>

      {/* Drag Preview (Visual feedback) */}
      {draggedSyllabus && (
        <div className="fixed pointer-events-none z-50 opacity-70">
          <div className="bg-white border border-blue-500 rounded-lg p-3 shadow-lg">
            <p className="font-medium text-blue-600">{draggedSyllabus.name}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DragDropAssignment