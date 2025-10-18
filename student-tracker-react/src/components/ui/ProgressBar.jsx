import React from 'react'

function ProgressBar({
  percentage = 0,
  completed = 0,
  total = 0,
  showStats = true
}) {
  const safePercentage = Math.max(0, Math.min(100, percentage))
  const roundedPercentage = Math.round(safePercentage)

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100 shadow-sm transition-all duration-300">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Your Overall Progress
        <small className="text-sm font-normal text-gray-600">(Weighted by Topics)</small>
      </h3>

      <div className="relative">
        <div className="bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-green-500 to-teal-500 h-full rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-500 ease-out"
            style={{ width: `${safePercentage}%` }}
          >
            {safePercentage > 10 ? `${roundedPercentage}%` : ''}
          </div>
        </div>
        {/* Show percentage outside bar when too small */}
        {safePercentage <= 10 && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-gray-700 font-medium text-sm">
            {roundedPercentage}%
          </div>
        )}
      </div>

      {showStats && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-4xl font-bold text-gray-800">{roundedPercentage}%</div>
          <div className="text-gray-700 font-medium bg-white px-3 py-2 rounded-lg border border-gray-200">
            {completed}/{total} topics completed
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600 mt-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Each topic contributes equally to overall progress
      </div>
    </div>
  )
}

export default ProgressBar