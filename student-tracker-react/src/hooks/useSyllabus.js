import { useState, useCallback, useEffect } from 'react'

const API_CONFIG = {
  BASE_URL: '/tracker'
}

// localStorage keys
const STORAGE_KEYS = {
  SELECTED_SYLLABUS_ID: 'student_selected_syllabus_id'
}

export function useSyllabus() {
  const [syllabuses, setSyllabuses] = useState([])
  const [selectedSyllabusId, setSelectedSyllabusId] = useState(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_SYLLABUS_ID)
    return saved || null
  })
  const [syllabusData, setSyllabusData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Persist selected syllabus ID to localStorage
  useEffect(() => {
    if (selectedSyllabusId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_SYLLABUS_ID, selectedSyllabusId)
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_SYLLABUS_ID)
    }
  }, [selectedSyllabusId])

  const loadAssignedSyllabuses = useCallback(async (studentEmail) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        student_email: studentEmail
      })

      const response = await fetch(`${API_CONFIG.BASE_URL}/student-syllabuses?${params}`, {
        method: "GET",
        headers: {
          "accept": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.syllabuses.length > 0) {
        setSyllabuses(result.syllabuses)
        // Select the first assigned syllabus by default
        setSelectedSyllabusId(result.syllabuses[0].id)
      } else {
        // If no syllabuses assigned, default to "contact" syllabus
        setSyllabuses([])
        setSelectedSyllabusId("contact")
      }
    } catch (err) {
      console.error('Error loading assigned syllabuses:', err)
      setError('Failed to load assigned syllabuses. Please try again.')
      // Fallback to contact syllabus if API fails
      setSelectedSyllabusId("contact")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSyllabusContent = useCallback(async (syllabusId) => {
    if (!syllabusId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/syllabus/${syllabusId}`, {
        method: "GET",
        headers: {
          "accept": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const syllabusData = await response.json()
      console.log("Syllabus Data:", syllabusData)

      if (!syllabusData.data || !syllabusData.data.variants) {
        throw new Error('No syllabus data available for this selection.')
      }

      setSyllabusData(syllabusData)
    } catch (err) {
      console.error('Error loading syllabus:', err)
      setError('Failed to load syllabus data. Please try again.')
      setSyllabusData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    syllabuses,
    selectedSyllabusId,
    syllabusData,
    loading,
    error,
    loadAssignedSyllabuses,
    loadSyllabusContent,
    setSelectedSyllabusId
  }
}