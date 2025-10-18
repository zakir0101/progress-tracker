import React from 'react'

function SyllabusSelector({
  syllabuses = [],
  selectedSyllabusId,
  onSyllabusChange,
  disabled = false
}) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mx-5 my-5 flex items-center gap-4 shadow-md">
      <label className="font-semibold text-blue-800 text-lg whitespace-nowrap">
        Select Syllabus:
      </label>
      <div className="relative flex-1 max-w-md">
        <select
          value={selectedSyllabusId || ''}
          onChange={(e) => onSyllabusChange(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg bg-white text-base cursor-pointer
                     focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200
                     appearance-none pr-10"
        >
          <option value="">Select a syllabus...</option>
          {syllabuses.map(syllabus => (
            <option key={syllabus.id} value={syllabus.id}>
              {syllabus.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default SyllabusSelector