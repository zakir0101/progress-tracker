import React from 'react'
import StatCard from '../ui/StatCard'
import { useDashboardStore } from '../../stores/dashboardStore'

function StatisticsOverview() {
  const { statistics } = useDashboardStore()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Students"
        value={statistics.totalStudents}
      />
      <StatCard
        title="Average Progress (Selected Syllabus)"
        value={`${statistics.averageProgress}%`}
      />
      <StatCard
        title="Syllabuses Assigned"
        value={statistics.syllabusesAssigned}
      />
      <StatCard
        title="Completion Rate (Selected Syllabus)"
        value={`${statistics.completionRate}%`}
      />
    </div>
  )
}

export default StatisticsOverview