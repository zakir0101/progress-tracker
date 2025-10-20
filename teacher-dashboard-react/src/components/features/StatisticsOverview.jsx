import React from 'react'
import StatCard from '../ui/StatCard'

function StatisticsOverview({ totalStudents, averageProgress, totalSyllabuses, totalAssignments }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total Students"
        value={totalStudents}
      />
      <StatCard
        title="Average Progress (Selected Syllabus)"
        value={`${Math.round(averageProgress)}%`}
      />
      <StatCard
        title="Syllabuses Assigned"
        value={totalSyllabuses}
      />
    </div>
  )
}

export default StatisticsOverview