import React, { useState, useEffect, useCallback } from 'react'
import MainLayout from '../components/layout/MainLayout'
import AuthenticationSection from '../components/features/AuthenticationSection'
import UserInfo from '../components/features/UserInfo'
import SyllabusSelector from '../components/ui/SyllabusSelector'
import ProgressBar from '../components/ui/ProgressBar'
import SyllabusContent from '../components/features/SyllabusContent'
import StatusMessage from '../components/ui/StatusMessage'
import { useAuth } from '../hooks/useAuth'
import { useSyllabus } from '../hooks/useSyllabus'
import { useProgress } from '../hooks/useProgress'

function StudentTracker() {
  const {
    user,
    isAuthenticated,
    handleGoogleAuth,
    logout
  } = useAuth()

  const {
    syllabuses,
    selectedSyllabusId,
    syllabusData,
    loading: syllabusLoading,
    error: syllabusError,
    loadAssignedSyllabuses,
    loadSyllabusContent,
    setSelectedSyllabusId
  } = useSyllabus()

  const {
    progressData,
    loading: progressLoading,
    error: progressError,
    updateTopicProgress,
    loadProgress
  } = useProgress()

  const [statusMessage, setStatusMessage] = useState({ message: '', type: 'info' })

  // Load syllabuses when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAssignedSyllabuses(user.email)
    }
  }, [isAuthenticated, user, loadAssignedSyllabuses])

  // Load syllabus content when syllabus is selected
  useEffect(() => {
    if (selectedSyllabusId) {
      loadSyllabusContent(selectedSyllabusId)
    }
  }, [selectedSyllabusId, loadSyllabusContent])

  // Load progress when syllabus content is loaded
  useEffect(() => {
    if (selectedSyllabusId && user && syllabusData) {
      loadProgress(user.email, selectedSyllabusId)
    }
  }, [selectedSyllabusId, user, syllabusData, loadProgress])

  // Handle syllabus selection change
  const handleSyllabusChange = useCallback((syllabusId) => {
    setSelectedSyllabusId(syllabusId)
  }, [setSelectedSyllabusId])

  // Handle topic toggle
  const handleTopicToggle = useCallback(async (topicId, isCompleted) => {
    if (!user || !selectedSyllabusId) {
      showStatus('Please sign in and select a syllabus to submit progress.', 'error')
      return
    }

    try {
      await updateTopicProgress({
        student_email: user.email,
        student_name: user.name,
        syllabus_id: selectedSyllabusId,
        topic_id: topicId,
        is_completed: isCompleted
      })
      showStatus('Progress saved!', 'success')
    } catch (error) {
      console.error('Failed to update topic progress:', error)
      // Don't show error for every checkbox change to avoid spam
    }
  }, [user, selectedSyllabusId, updateTopicProgress])

  // Show status message
  const showStatus = useCallback((message, type = 'info') => {
    setStatusMessage({ message, type })

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        setStatusMessage({ message: '', type: 'info' })
      }, 5000)
    }
  }, [])


  // Handle errors
  useEffect(() => {
    if (syllabusError) {
      showStatus(syllabusError, 'error')
    }
  }, [syllabusError, showStatus])

  useEffect(() => {
    if (progressError) {
      showStatus(progressError, 'error')
    }
  }, [progressError, showStatus])

  return (
    <MainLayout>
      {/* Authentication Section */}
      {!isAuthenticated && (
        <AuthenticationSection onSignIn={handleGoogleAuth} />
      )}

      {/* User Info */}
      {isAuthenticated && (
        <UserInfo user={user} onLogout={logout} />
      )}

      {/* Main Content */}
      {isAuthenticated && (
        <div>
          {/* Status Message */}
          <StatusMessage
            message={statusMessage.message}
            type={statusMessage.type}
          />

          {/* Syllabus Selector */}
          <SyllabusSelector
            syllabuses={syllabuses}
            selectedSyllabusId={selectedSyllabusId}
            onSyllabusChange={handleSyllabusChange}
            disabled={syllabusLoading}
          />

          {/* Progress Bar */}
          {selectedSyllabusId && (
            <ProgressBar
              percentage={progressData.overall_progress?.percentage || 0}
              completed={progressData.overall_progress?.completed || 0}
              total={progressData.overall_progress?.total || 0}
            />
          )}

          {/* Syllabus Content */}
          {selectedSyllabusId && syllabusData && (
            <SyllabusContent
              syllabusData={syllabusData}
              progressData={progressData}
              onTopicToggle={handleTopicToggle}
              disabled={progressLoading}
            />
          )}

          {/* Loading States */}
          {syllabusLoading && (
            <div className="p-8 text-center text-gray-600">
              Loading syllabus data...
            </div>
          )}

          {progressLoading && (
            <div className="p-8 text-center text-gray-600">
              Loading progress data...
            </div>
          )}
        </div>
      )}
    </MainLayout>
  )
}

export default StudentTracker