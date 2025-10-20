import React from 'react'
import StudentGrid from './StudentGrid'
import RefreshStatus from './RefreshStatus'

function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Refresh Status Section */}
      <section>
        <RefreshStatus />
      </section>

      {/* Student Progress Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Student Progress</h2>
          <p className="text-sm text-gray-500">Filtered by selected syllabus</p>
        </div>
        <StudentGrid />
      </section>
    </div>
  )
}

export default DashboardContent