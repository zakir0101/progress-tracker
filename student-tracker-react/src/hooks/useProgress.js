import { useState, useCallback } from 'react'

const API_CONFIG = {
  BASE_URL: '/tracker'
}

export function useProgress() {
  const [progressData, setProgressData] = useState({
    topics: {},
    overall_progress: {
      percentage: 0,
      completed: 0,
      total: 0
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadProgress = useCallback(async (studentEmail, syllabusId) => {
    if (!studentEmail || !syllabusId) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        student_email: studentEmail,
        syllabus_id: syllabusId
      })

      const response = await fetch(`${API_CONFIG.BASE_URL}/student-progress?${params}`, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          updateProgressFromBackend(result.progress)
          return
        }
      }

      // If we get here, either the request failed or no progress data exists
      // Initialize with default progress (0% complete)
      initializeDefaultProgress()
    } catch (err) {
      console.error('Error loading progress:', err)
      // Initialize with default progress on error
      initializeDefaultProgress()
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTopicProgress = useCallback(async (requestData) => {
    const { topic_id, is_completed } = requestData

    // Optimistic update: immediately update UI
    setProgressData(prevData => {
      const updatedTopics = {
        ...prevData.topics,
        [topic_id]: is_completed
      }

      // Calculate optimistic overall progress
      const completedTopics = Object.values(updatedTopics).filter(Boolean).length
      const totalTopics = Object.keys(updatedTopics).length
      const optimisticPercentage = totalTopics > 0 ? (completedTopics / totalTopics * 100) : 0

      return {
        ...prevData,
        topics: updatedTopics,
        overall_progress: {
          percentage: optimisticPercentage,
          completed: completedTopics,
          total: totalTopics
        }
      }
    })

    setLoading(true)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/update-topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Update UI with confirmed data from backend
        updateProgressFromBackend({
          topics: result.topics,
          overall_progress: result.overall_progress
        })
      } else {
        throw new Error(result.error || 'Update failed')
      }
    } catch (err) {
      console.error('Topic update error:', err)
      setError('Failed to update progress. Please try again.')

      // Revert optimistic update on error
      setProgressData(prevData => {
        const revertedTopics = {
          ...prevData.topics,
          [topic_id]: !is_completed // Revert to previous state
        }

        // Recalculate overall progress
        const completedTopics = Object.values(revertedTopics).filter(Boolean).length
        const totalTopics = Object.keys(revertedTopics).length
        const revertedPercentage = totalTopics > 0 ? (completedTopics / totalTopics * 100) : 0

        return {
          ...prevData,
          topics: revertedTopics,
          overall_progress: {
            percentage: revertedPercentage,
            completed: completedTopics,
            total: totalTopics
          }
        }
      })

      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProgressFromBackend = useCallback((progressData) => {
    if (!progressData) return

    setProgressData(prevData => {
      // Convert topics array to object for easier lookup
      const topicsObj = {...prevData.topics}
      if (progressData.topics) {
        progressData.topics.forEach(topic => {
          topicsObj[topic.id] = topic.completed
        })
      }

      return {
        ...prevData,
        topics: topicsObj,
        overall_progress: progressData.overall_progress || {
          percentage: 0,
          completed: 0,
          total: 0
        }
      }
    })
  }, [])

  const initializeDefaultProgress = useCallback(() => {
    setProgressData({
      topics: {},
      overall_progress: {
        percentage: 0,
        completed: 0,
        total: 0
      }
    })
  }, [])

  return {
    progressData,
    loading,
    error,
    updateTopicProgress,
    loadProgress,
    updateProgressFromBackend,
    initializeDefaultProgress
  }
}