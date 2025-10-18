import React from 'react'

function StatCard({ title, value, change, icon, className = '' }) {
  // Determine icon based on title if not provided
  const getIcon = () => {
    if (icon) return icon

    if (title.toLowerCase().includes('student')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    } else if (title.toLowerCase().includes('progress') || title.toLowerCase().includes('completion')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    } else if (title.toLowerCase().includes('syllabus')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    }

    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  }

  // Determine color scheme based on title
  const getColorScheme = () => {
    if (title.toLowerCase().includes('student')) return 'blue'
    if (title.toLowerCase().includes('progress')) return 'green'
    if (title.toLowerCase().includes('completion')) return 'purple'
    if (title.toLowerCase().includes('syllabus')) return 'indigo'
    return 'gray'
  }

  const colorScheme = getColorScheme()
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      text: 'text-blue-600',
      value: 'text-blue-900'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      text: 'text-green-600',
      value: 'text-green-900'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      text: 'text-purple-600',
      value: 'text-purple-900'
    },
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      text: 'text-indigo-600',
      value: 'text-indigo-900'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      text: 'text-gray-600',
      value: 'text-gray-900'
    }
  }

  const colors = colorClasses[colorScheme]

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className={`text-xs md:text-sm font-semibold uppercase tracking-wide ${colors.text}`}>
          {title}
        </h3>
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <div className={colors.icon}>
            {getIcon()}
          </div>
        </div>
      </div>
      <div className={`text-2xl md:text-3xl font-bold ${colors.value} mb-1 md:mb-2`}>{value}</div>
      {change && (
        <div className={`text-xs md:text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </div>
      )}
    </div>
  )
}

export default StatCard