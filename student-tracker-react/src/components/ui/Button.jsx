import React from 'react'

function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  ...props
}) {
  const baseClasses = 'font-medium rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-8 rounded-lg transform hover:-translate-y-0.5 hover:shadow-lg focus:ring-blue-500',
    danger: 'bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors focus:ring-red-500',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded focus:ring-gray-500',
    success: 'bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors focus:ring-green-500'
  }

  const classes = `${baseClasses} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button