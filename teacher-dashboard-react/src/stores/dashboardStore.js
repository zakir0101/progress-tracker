import { create } from 'zustand'

const API_CONFIG = {
  BASE_URL: import.meta.env.DEV ? 'http://localhost:5000/tracker' : '/tracker'
}

// localStorage keys
const STORAGE_KEYS = {
  SELECTED_SYLLABUS_ID: 'teacher_selected_syllabus_id',
  SEARCH_TERM: 'teacher_search_term',
  PROGRESS_FILTER: 'teacher_progress_filter',
  LAST_DATA_REFRESH: 'teacher_last_data_refresh'
}

// Auto-refresh interval in milliseconds (5 minutes)
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000

// Load initial state from localStorage
const loadInitialState = () => ({
  selectedViewSyllabusId: localStorage.getItem(STORAGE_KEYS.SELECTED_SYLLABUS_ID) || 'all',
  searchTerm: localStorage.getItem(STORAGE_KEYS.SEARCH_TERM) || '',
  progressFilter: localStorage.getItem(STORAGE_KEYS.PROGRESS_FILTER) || 'all'
})

export const useDashboardStore = create((set, get) => ({
  // Data
  allStudentsProgress: [],
  allSyllabuses: [],
  displayedStudents: [],

  // UI State
  ...loadInitialState(),
  statusMessage: { text: '', type: 'info' },
  isLoading: false,
  isRefreshing: false,
  lastRefreshTime: null,
  autoRefreshEnabled: true,

  // Statistics
  statistics: {
    totalStudents: 0,
    averageProgress: 0,
    syllabusesAssigned: 0,
    completionRate: 0
  },

  // Actions
  setStatusMessage: (text, type = 'info') => {
    set({ statusMessage: { text, type } })
  },

  clearStatusMessage: () => {
    set({ statusMessage: { text: '', type: 'info' } })
  },

  setAutoRefresh: (enabled) => {
    set({ autoRefreshEnabled: enabled })
    if (enabled) {
      get().startAutoRefresh()
    } else {
      get().stopAutoRefresh()
    }
  },

  startAutoRefresh: () => {
    const { autoRefreshInterval } = get()
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
    }
    const interval = setInterval(() => {
      const { autoRefreshEnabled, isRefreshing } = get()
      if (autoRefreshEnabled && !isRefreshing) {
        get().refreshData()
      }
    }, AUTO_REFRESH_INTERVAL)
    set({ autoRefreshInterval: interval })
  },

  stopAutoRefresh: () => {
    const { autoRefreshInterval } = get()
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval)
      set({ autoRefreshInterval: null })
    }
  },

  refreshData: async () => {
    const { isRefreshing } = get()
    if (isRefreshing) return

    set({ isRefreshing: true })
    try {
      await get().loadDashboardData()
      const now = new Date().toISOString()
      set({ lastRefreshTime: now })
      localStorage.setItem(STORAGE_KEYS.LAST_DATA_REFRESH, now)
    } catch (error) {
      console.error('Auto-refresh failed:', error)
    } finally {
      set({ isRefreshing: false })
    }
  },

  manualRefresh: async () => {
    const { isRefreshing } = get()
    if (isRefreshing) return

    set({ isRefreshing: true })
    try {
      await get().loadDashboardData()
      const now = new Date().toISOString()
      set({ lastRefreshTime: now })
      localStorage.setItem(STORAGE_KEYS.LAST_DATA_REFRESH, now)
      get().setStatusMessage('Data refreshed successfully!', 'success')
    } catch (error) {
      console.error('Manual refresh failed:', error)
      get().setStatusMessage('Failed to refresh data. Please try again.', 'error')
    } finally {
      set({ isRefreshing: false })
    }
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term })
    localStorage.setItem(STORAGE_KEYS.SEARCH_TERM, term)
    get().filterStudents()
  },

  setProgressFilter: (filter) => {
    set({ progressFilter: filter })
    localStorage.setItem(STORAGE_KEYS.PROGRESS_FILTER, filter)
    get().filterStudents()
  },

  setSelectedViewSyllabusId: (syllabusId) => {
    set({ selectedViewSyllabusId: syllabusId })
    localStorage.setItem(STORAGE_KEYS.SELECTED_SYLLABUS_ID, syllabusId)
    get().filterStudents()
  },

  loadDashboardData: async () => {
    set({ isLoading: true })
    try {
      await get().loadAllSyllabuses()
      await get().loadAllProgress()

      // Initialize auto-refresh after successful data load
      if (get().autoRefreshEnabled) {
        get().startAutoRefresh()
      }

      // Update last refresh time
      const now = new Date().toISOString()
      set({ lastRefreshTime: now })
      localStorage.setItem(STORAGE_KEYS.LAST_DATA_REFRESH, now)

    } catch (error) {
      get().handleBackendError(error)
      // Set some default data for UI testing
      set({
        allStudentsProgress: [],
        allSyllabuses: [],
        displayedStudents: []
      })
    } finally {
      set({ isLoading: false })
    }
  },

  loadAllSyllabuses: async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/all-syllabuses`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.status === 'success' && Array.isArray(result.data)) {
        set({ allSyllabuses: result.data })
      } else {
        throw new Error('Invalid data format for syllabuses')
      }
    } catch (error) {
      console.error('Error loading all syllabuses:', error)
      throw error
    }
  },

  loadAllProgress: async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/all-progress`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result && result.status === 'success' && Array.isArray(result.data)) {
        set({ allStudentsProgress: result.data })
        get().filterStudents()
      } else {
        throw new Error('Invalid data format received from server for student progress')
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      throw error
    }
  },

  filterStudents: () => {
    const { allStudentsProgress, selectedViewSyllabusId, searchTerm, progressFilter, allSyllabuses } = get()

    const filteredStudents = allStudentsProgress.filter(student => {
      const studentName = student.name?.toLowerCase() || ''
      const studentEmail = student.email?.toLowerCase() || ''
      const syllabusName = student.syllabus_name?.toLowerCase() || ''

      // Search filter
      const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
        studentEmail.includes(searchTerm.toLowerCase()) ||
        syllabusName.includes(searchTerm.toLowerCase())

      // Syllabus filter
      const matchesSyllabus = selectedViewSyllabusId === 'all' ||
        student.syllabus_name === allSyllabuses.find(s => s.id === selectedViewSyllabusId)?.name

      // Progress filter
      let matchesProgress = true
      if (progressFilter !== 'all') {
        const [min, max] = progressFilter.split('-').map(Number)
        matchesProgress = (student.progress_percentage || 0) >= min && (student.progress_percentage || 0) <= max
      }

      // Exclude 'contact' syllabus from general view unless specifically selected
      if (selectedViewSyllabusId === 'all' && student.syllabus_name === 'Contact Syllabus') {
        return false
      }
      if (selectedViewSyllabusId === 'contact' && student.syllabus_name !== 'Contact Syllabus') {
        return false
      }

      return matchesSearch && matchesSyllabus && matchesProgress
    })

    set({ displayedStudents: filteredStudents })
    get().updateStatistics()
  },

  updateStatistics: () => {
    const { displayedStudents } = get()

    const totalStudents = new Set(displayedStudents.map(s => s.email)).size
    const studentsWithProgress = displayedStudents.filter(student => student.progress_percentage > 0)
    const averageProgress = studentsWithProgress.length > 0
      ? Math.round(studentsWithProgress.reduce((sum, student) => sum + student.progress_percentage, 0) / studentsWithProgress.length)
      : 0
    const syllabusesAssigned = new Set(displayedStudents.map(s => s.syllabus_name)).size
    const completionRate = totalStudents > 0
      ? Math.round((studentsWithProgress.length / totalStudents) * 100)
      : 0

    set({
      statistics: {
        totalStudents,
        averageProgress,
        syllabusesAssigned,
        completionRate
      }
    })
  },

  assignSyllabus: async (studentEmail, syllabusId) => {
    // Validate inputs
    if (!studentEmail || !studentEmail.trim()) {
      throw new Error('Student email is required')
    }
    if (!syllabusId || !syllabusId.trim()) {
      throw new Error('Syllabus ID is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(studentEmail)) {
      throw new Error('Invalid student email format')
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/assign-syllabus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          student_email: studentEmail.trim(),
          syllabus_id: syllabusId.trim()
        })
      })

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      if (result.success) {
        get().setStatusMessage(result.message, 'success')
        // Automatically refresh all data after successful assignment
        await get().loadDashboardData()
      } else {
        throw new Error(result.error || 'Assignment failed')
      }
    } catch (error) {
      console.error('Syllabus assignment error:', error)

      // Provide user-friendly error messages
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.')
      } else if (error.message.includes('HTTP 429')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      } else if (error.message.includes('HTTP 400')) {
        throw new Error('Invalid request. Please check the student email and syllabus selection.')
      } else if (error.message.includes('HTTP 500')) {
        throw new Error('Server error. Please try again later.')
      }

      throw error
    }
  },

  removeSyllabus: async (studentEmail, syllabusId) => {
    // Validate inputs
    if (!studentEmail || !studentEmail.trim()) {
      throw new Error('Student email is required')
    }
    if (!syllabusId || !syllabusId.trim()) {
      throw new Error('Syllabus ID is required')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(studentEmail)) {
      throw new Error('Invalid student email format')
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/remove-syllabus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          student_email: studentEmail.trim(),
          syllabus_id: syllabusId.trim()
        })
      })

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()

      if (result.success) {
        get().setStatusMessage(result.message, 'success')
        // Automatically refresh all data after successful removal
        await get().loadDashboardData()
      } else {
        throw new Error(result.error || 'Removal failed')
      }
    } catch (error) {
      console.error('Syllabus removal error:', error)

      // Provide user-friendly error messages
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.')
      } else if (error.message.includes('HTTP 429')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      } else if (error.message.includes('HTTP 400')) {
        throw new Error('Invalid request. Please check the student email and syllabus selection.')
      } else if (error.message.includes('HTTP 500')) {
        throw new Error('Server error. Please try again later.')
      }

      throw error
    }
  },

  handleBackendError: (error) => {
    console.error('Backend connection error:', error)
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      get().setStatusMessage('Cannot connect to backend server. Please ensure the Flask server is running.', 'error')
    } else {
      get().setStatusMessage('Backend error: ' + error.message, 'error')
    }
  },

  exportData: () => {
    const { displayedStudents } = get()

    try {
      const headers = ['Student Name', 'Student Email', 'Syllabus', 'Progress %', 'Completed Topics', 'Total Topics', 'Last Updated']
      const rows = displayedStudents.map(student => [
        student.name,
        student.email,
        student.syllabus_name || 'N/A',
        Math.round(student.progress_percentage || 0),
        student.completed_count || 0,
        student.total_topics || 0,
        student.last_updated ? new Date(student.last_updated).toLocaleString() : 'Never'
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `teacher_dashboard_progress_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      get().setStatusMessage('Data exported successfully!', 'success')
    } catch (error) {
      console.error('Export error:', error)
      get().setStatusMessage('Failed to export data.', 'error')
    }
  }
}))