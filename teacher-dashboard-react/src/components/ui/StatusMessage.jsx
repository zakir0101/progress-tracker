import React from 'react'

function StatusMessage({ message, type = 'info', onClose }) {
  if (!message) return null

  const typeClasses = {
    success: 'status-success',
    error: 'status-error',
    warning: 'status-warning',
    info: 'bg-blue-50 text-blue-800 border border-blue-200'
  }

  React.useEffect(() => {
    if (type === 'success' && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [type, onClose])

  return (
    <div className={`status-message ${typeClasses[type]}`}>
      {message}
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 float-right text-sm opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default StatusMessage