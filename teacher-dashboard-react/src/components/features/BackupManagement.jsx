import React, { useState, useEffect } from 'react'

// API configuration matching dashboard store
const API_CONFIG = {
  BASE_URL: import.meta.env.DEV ? 'http://localhost:5000/tracker' : '/tracker'
}

function BackupManagement() {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [backupName, setBackupName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Fetch backups on component mount
  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/backups`)
      const data = await response.json()

      if (data.success) {
        setBackups(data.backups)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch backups' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while fetching backups' })
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    if (!backupName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a backup name' })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/backups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: backupName })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setBackupName('')
        fetchBackups() // Refresh the list
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create backup' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while creating backup' })
    } finally {
      setLoading(false)
    }
  }

  const restoreBackup = async (filename) => {
    if (!confirm(`Are you sure you want to restore from backup "${filename}"? This will replace the current database.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/backups/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message + ' Page will refresh in 3 seconds...' })
        // Refresh the page after successful restore
        setTimeout(() => window.location.reload(), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to restore backup' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while restoring backup' })
    } finally {
      setLoading(false)
    }
  }

  const deleteBackup = async (filename) => {
    if (!confirm(`Are you sure you want to delete backup "${filename}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/backups/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        fetchBackups() // Refresh the list
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to delete backup' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while deleting backup' })
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Backup Management</h2>
        <p className="text-gray-600 mb-6">
          Create, restore, and manage database backups to protect your student progress data.
        </p>
      </section>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Create Backup Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Backup</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="backupName" className="block text-sm font-medium text-gray-700 mb-2">
              Backup Name
            </label>
            <input
              type="text"
              id="backupName"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              placeholder="Enter a descriptive name for this backup"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
          </div>
          <button
            onClick={createBackup}
            disabled={loading || !backupName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Backup'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          A timestamp will be automatically added to the backup filename.
        </p>
      </section>

      {/* Backup List Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Available Backups</h3>
          <button
            onClick={fetchBackups}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading backups...</p>
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No backups found. Create your first backup to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {backups.map((backup) => (
              <div key={backup.name} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{backup.name}</h4>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Size: {formatFileSize(backup.size)}</p>
                      <p>Created: {formatDate(backup.created)}</p>
                      <p>Modified: {formatDate(backup.modified)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => restoreBackup(backup.name)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                      title="Restore this backup"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => deleteBackup(backup.name)}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                      title="Delete this backup"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Important Notes Section */}
      <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Notes</h3>
        <ul className="text-yellow-700 space-y-1 text-sm">
          <li>• Creating a backup will save the current state of your database</li>
          <li>• Restoring a backup will replace the current database with the selected backup</li>
          <li>• A backup of the current database is automatically created before any restore operation</li>
          <li>• Backups are stored locally and persist across server restarts</li>
          <li>• It's recommended to create regular backups before making significant changes</li>
        </ul>
      </section>
    </div>
  )
}

export default BackupManagement