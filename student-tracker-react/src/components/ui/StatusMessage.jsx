import React from 'react'

function StatusMessage({ message, type = 'info' }) {
  if (!message) return null

  const typeClasses = {
    success: 'status-success',
    error: 'status-error',
    warning: 'status-warning',
    info: 'bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded'
  }

  return (
    <div className={`text-center font-medium ${typeClasses[type]}`}>
      {message}
    </div>
  )
}

export default StatusMessage