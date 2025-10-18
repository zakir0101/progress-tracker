import { useState, useEffect, useCallback } from 'react'

const API_CONFIG = {
  BASE_URL: '/tracker',
  SESSION_TIMEOUT: 60 * 60 * 1000 // 1 hour in milliseconds
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessionTimer, setSessionTimer] = useState(null)

  const clearUserSession = useCallback(() => {
    localStorage.removeItem('igcse_user_session')
    setUser(null)
    setIsAuthenticated(false)
    if (sessionTimer) {
      clearTimeout(sessionTimer)
      setSessionTimer(null)
    }
  }, [sessionTimer])

  const startSessionTimer = useCallback(() => {
    if (sessionTimer) {
      clearTimeout(sessionTimer)
    }
    const timer = setTimeout(() => {
      clearUserSession()
    }, API_CONFIG.SESSION_TIMEOUT)
    setSessionTimer(timer)
  }, [sessionTimer, clearUserSession])

  // Function to register student in backend database
  const registerStudentInBackend = useCallback(async (email, name) => {
    try {
      // Use the update-topic endpoint to register student
      // This endpoint automatically registers students if they don't exist
      const response = await fetch(`${API_CONFIG.BASE_URL}/update-topic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_email: email,
          student_name: name,
          syllabus_id: 'contact', // Use contact syllabus for registration
          topic_id: 'contact_register', // Dummy topic ID for registration
          is_completed: false
        })
      })

      if (!response.ok) {
        console.error('Failed to register student in backend:', response.statusText)
      } else {
        console.log('Student successfully registered in backend database')
      }
    } catch (error) {
      console.error('Error registering student in backend:', error)
    }
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = useCallback(() => {
    const userSession = localStorage.getItem('igcse_user_session')

    if (userSession) {
      try {
        const session = JSON.parse(userSession)
        const now = Date.now()

        // Check if session is still valid
        if (session.expiresAt > now) {
          setUser(session.user)
          setIsAuthenticated(true)
          startSessionTimer()

          // Also register student in backend if they have existing session
          registerStudentInBackend(session.user.email, session.user.name)
          return
        } else {
          // Session expired
          clearUserSession()
        }
      } catch (error) {
        console.error('Error parsing user session:', error)
        clearUserSession()
      }
    }
  }, [])

  const handleGoogleAuth = useCallback((response) => {
    console.log('Google OAuth response received:', response)

    if (!response || !response.access_token) {
      console.error('Invalid OAuth response:', response)
      throw new Error('Authentication failed: Invalid response from Google. Please try again.')
    }

    try {
      // For implicit flow, we need to fetch user info from Google API
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${response.access_token}`
        }
      })
      .then(res => res.json())
      .then(userInfo => {
        console.log('Google user info:', userInfo)

        const newUser = {
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
          loginTime: Date.now()
        }

        // Create session with expiration
        const session = {
          user: newUser,
          expiresAt: Date.now() + API_CONFIG.SESSION_TIMEOUT
        }

        localStorage.setItem('igcse_user_session', JSON.stringify(session))

        setUser(newUser)
        setIsAuthenticated(true)
        startSessionTimer()

        // Automatically register student in backend database
        registerStudentInBackend(newUser.email, newUser.name)
      })
      .catch(error => {
        console.error('Error fetching user info:', error)
        throw new Error('Authentication failed: Could not fetch user information.')
      })

    } catch (error) {
      console.error('Authentication error:', error)
      throw new Error('Authentication failed: ' + error.message)
    }
  }, [])

  const logout = useCallback(() => {
    if (window.confirm('Are you sure you want to log out? Your progress will be saved.')) {
      clearUserSession()
    }
  }, [])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        checkExistingSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, checkExistingSession])

  return {
    user,
    isAuthenticated,
    handleGoogleAuth,
    logout,
    checkExistingSession
  }
}