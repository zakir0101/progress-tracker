import React from 'react'

function ProgressBar({ progress = 0, className = '' }) {
  return (
    <div className={`progress-bar ${className}`}>
      <div
        className="progress-fill"
        style={{ width: `${progress}%` }}
      >
        {Math.round(progress)}%
      </div>
    </div>
  )
}

export default ProgressBar