import React from 'react'
import ProgressBar from './ProgressBar'

function StudentCard({ student }) {
  const {
    name,
    email,
    syllabus_name = 'N/A',
    progress_percentage = 0,
    completed_count = 0,
    total_topics = 0,
    last_updated
  } = student

  return (
    <div className="student-card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="text-lg font-semibold text-gray-800">{name}</div>
          <div className="text-gray-600 text-sm">{email}</div>
          <div className="text-gray-500 text-xs mt-1">Syllabus: {syllabus_name}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{Math.round(progress_percentage)}%</div>
          <div className="text-gray-500 text-xs">Progress</div>
        </div>
      </div>

      <ProgressBar progress={progress_percentage} />

      <div className="flex justify-between text-sm text-gray-600 mt-3">
        <span>Completed: {completed_count}/{total_topics}</span>
        <span>
          Last Updated: {last_updated
            ? new Date(last_updated).toLocaleDateString()
            : 'Never'
          }
        </span>
      </div>
    </div>
  )
}

export default StudentCard