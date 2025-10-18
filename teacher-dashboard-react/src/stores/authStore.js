import { create } from 'zustand'

const API_CONFIG = {
  BASE_URL: import.meta.env.DEV ? 'http://localhost:5000/tracker' : '/tracker',
  SESSION_TIMEOUT: 60 * 60 * 1000 // 1 hour in milliseconds
}

export const useAuthStore = create((set, get) => ({
  currentUser: null,
  isLoading: true,
  sessionTimer: null,
  statusMessage: { text: '', type: 'info' },

  setStatusMessage: (text, type = 'info') => {
    set({ statusMessage: { text, type } })
  },

  clearStatusMessage: () => {
    set({ statusMessage: { text: '', type: 'info' } })
  },

  initializeAuth: () => {
    const userSession = localStorage.getItem('igcse_teacher_session')

    if (userSession) {
      try {
        const session = JSON.parse(userSession)
        const now = Date.now()

        if (session.expiresAt > now) {
          set({ currentUser: session.user, isLoading: false })
          get().startSessionTimer()
          return
        }
      } catch (error) {
        console.error('Error parsing user session:', error)
      }
      localStorage.removeItem('igcse_teacher_session')
    }

    set({ isLoading: false })
  },

  handleGoogleAuth: (response) => {
    if (!response?.access_token) {
      throw new Error('Invalid OAuth response from Google')
    }

    // For implicit flow, we need to fetch user info from Google API
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${response.access_token}`
      }
    })
    .then(res => res.json())
    .then(userInfo => {
      console.log('Google user info:', userInfo)

      const currentUser = {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        loginTime: Date.now()
      }

      const session = {
        user: currentUser,
        expiresAt: Date.now() + API_CONFIG.SESSION_TIMEOUT
      }

      localStorage.setItem('igcse_teacher_session', JSON.stringify(session))
      set({ currentUser })
      get().startSessionTimer()
    })
    .catch(error => {
      console.error('Error fetching user info:', error)
      throw new Error('Authentication failed: Could not fetch user information.')
    })
  },

  logout: () => {
    const { sessionTimer } = get()
    if (sessionTimer) {
      clearTimeout(sessionTimer)
    }

    localStorage.removeItem('igcse_teacher_session')
    set({ currentUser: null, sessionTimer: null })
  },

  startSessionTimer: () => {
    const { sessionTimer } = get()
    if (sessionTimer) {
      clearTimeout(sessionTimer)
    }

    const timer = setTimeout(() => {
      get().logout()
    }, API_CONFIG.SESSION_TIMEOUT)

    set({ sessionTimer: timer })
  }
}))