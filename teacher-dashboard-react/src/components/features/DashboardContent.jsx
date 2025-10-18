import React from 'react'
import StatisticsOverview from './StatisticsOverview'
import SyllabusAssignment from './SyllabusAssignment'
import StudentGrid from './StudentGrid'
import ProgressChart from './ProgressChart'
import RefreshStatus from './RefreshStatus'

function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Refresh Status Section */}
      <section>
        <RefreshStatus />
      </section>

      {/* Statistics Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
        <StatisticsOverview />
      </section>

      {/* Quick Assignment Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Syllabus Assignment</h2>
        <SyllabusAssignment />
      </section>

      {/* Student Progress Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Student Progress</h2>
          <p className="text-sm text-gray-500">Filtered by selected syllabus</p>
        </div>
        <StudentGrid />
      </section>

      {/* Progress Analytics Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Analytics</h2>
        <ProgressChart />
      </section>
    </div>
  )
}

export default DashboardContent