import React from 'react'
import { useDashboardStore } from '../../stores/dashboardStore'

function RefreshStatus() {
  const {
    isRefreshing,
    lastRefreshTime,
    autoRefreshEnabled,
    manualRefresh,
    setAutoRefresh
  } = useDashboardStore()

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Never refreshed'

    const now = new Date()
    const lastRefresh = new Date(timestamp)
    const diffMs = now - lastRefresh
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {isRefreshing ? 'Refreshing...' : 'Data is up to date'}
          </span>
        </div>

        {lastRefreshTime && (
          <div className="text-xs text-gray-500">
            Last refresh: {formatTime(lastRefreshTime)} ({getTimeAgo(lastRefreshTime)})
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            Auto-refresh (5 min)
          </label>
        </div>

        <button
          onClick={manualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRefreshing ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Now
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default RefreshStatus