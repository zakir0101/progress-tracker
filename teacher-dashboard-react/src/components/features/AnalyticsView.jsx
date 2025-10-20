import React, { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useDashboardStore } from '../../stores/dashboardStore'
import StatisticsOverview from './StatisticsOverview'
import ProgressChart from './ProgressChart'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

function AnalyticsView() {
  const { allStudentsProgress, allSyllabuses, selectedViewSyllabusId, setSelectedViewSyllabusId } = useDashboardStore()
  const [analyticsSyllabus, setAnalyticsSyllabus] = useState(selectedViewSyllabusId || '')

  // Filter students by selected syllabus for analytics
  const filteredStudents = React.useMemo(() => {
    if (!analyticsSyllabus || analyticsSyllabus === 'all') {
      // If no syllabus selected or "All Syllabuses", show all students (deduplicated by email)
      const uniqueStudents = new Map()
      allStudentsProgress.forEach(student => {
        if (!uniqueStudents.has(student.email)) {
          uniqueStudents.set(student.email, student)
        }
      })
      return Array.from(uniqueStudents.values())
    } else {
      // Filter by specific syllabus and deduplicate by email
      const selectedSyllabusName = allSyllabuses.find(s => s.id === analyticsSyllabus)?.name
      const uniqueStudents = new Map()
      allStudentsProgress.forEach(student => {
        if (student.syllabus_name === selectedSyllabusName) {
          if (!uniqueStudents.has(student.email)) {
            uniqueStudents.set(student.email, student)
          }
        }
      })
      return Array.from(uniqueStudents.values())
    }
  }, [allStudentsProgress, allSyllabuses, analyticsSyllabus])

  // Progress distribution chart data
  const progressChartData = React.useMemo(() => {
    const progressRanges = {
      '0-25': 0,
      '25-50': 0,
      '50-75': 0,
      '75-100': 0
    }

    filteredStudents.forEach(student => {
      const progress = student.progress_percentage || 0
      if (progress <= 25) progressRanges['0-25']++
      else if (progress <= 50) progressRanges['25-50']++
      else if (progress <= 75) progressRanges['50-75']++
      else progressRanges['75-100']++
    })

    return {
      labels: ['0-25%', '25-50%', '50-75%', '75-100%'],
      datasets: [
        {
          label: 'Number of Students',
          data: [
            progressRanges['0-25'],
            progressRanges['25-50'],
            progressRanges['50-75'],
            progressRanges['75-100']
          ],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ],
          borderColor: [
            'rgb(239, 68, 68)',
            'rgb(245, 158, 11)',
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)'
          ],
          borderWidth: 1,
        },
      ],
    }
  }, [filteredStudents])

  // Syllabus distribution chart data
  const syllabusChartData = React.useMemo(() => {
    const syllabusCounts = {}

    allStudentsProgress.forEach(student => {
      const syllabusName = student.syllabus_name
      if (syllabusName && syllabusName !== 'contact') {
        syllabusCounts[syllabusName] = (syllabusCounts[syllabusName] || 0) + 1
      }
    })

    const labels = Object.keys(syllabusCounts)
    const data = Object.values(syllabusCounts)

    // Generate colors dynamically
    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(14, 165, 233, 0.8)',
      'rgba(20, 184, 166, 0.8)',
      'rgba(249, 115, 22, 0.8)',
    ]

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        },
      ],
    }
  }, [allStudentsProgress])

  const progressChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Student Progress Distribution',
        font: {
          size: 18,
          weight: 'bold'
        },
        color: '#374151'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          color: '#6b7280'
        },
        title: {
          display: true,
          text: 'Number of Students',
          color: '#4b5563',
          font: {
            size: 14,
            weight: '500'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        },
        title: {
          display: true,
          text: 'Progress Range',
          color: '#4b5563',
          font: {
            size: 14,
            weight: '500'
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  }

  const syllabusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Syllabus Distribution',
        font: {
          size: 18,
          weight: 'bold'
        },
        color: '#374151'
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  }

  // Calculate overall statistics based on filtered students
  const totalStudents = filteredStudents.length
  const totalAssignments = filteredStudents.length
  const totalSyllabuses = analyticsSyllabus ? 1 : allSyllabuses.filter(s => s.id !== 'contact').length
  const averageProgress = filteredStudents.length > 0
    ? filteredStudents.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / filteredStudents.length
    : 0

  // Handle syllabus selection change
  const handleSyllabusChange = (syllabusId) => {
    setAnalyticsSyllabus(syllabusId)
    setSelectedViewSyllabusId(syllabusId)
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">
          Comprehensive analytics showing student progress distribution and syllabus assignments across your classes.
        </p>
      </section>

      {/* Syllabus Picker Section */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Syllabus Filter</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="syllabusPicker" className="block text-sm font-medium text-gray-700 mb-2">
              Select Syllabus for Analytics
            </label>
            <select
              id="syllabusPicker"
              value={analyticsSyllabus}
              onChange={(e) => handleSyllabusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Syllabuses</option>
              {allSyllabuses
                .map(syllabus => (
                  <option key={syllabus.id} value={syllabus.id}>
                    {syllabus.name} ({syllabus.id})
                  </option>
                ))
              }
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Select a specific syllabus to view analytics filtered by that syllabus, or leave empty to view all syllabuses.
        </p>
      </section>

      {/* Statistics Overview Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
        <StatisticsOverview
          totalStudents={totalStudents}
          averageProgress={averageProgress}
          totalSyllabuses={totalSyllabuses}
          totalAssignments={totalAssignments}
        />
      </section>

      {/* Progress Analytics Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Analytics</h2>
        <ProgressChart filteredStudents={filteredStudents} />
      </section>

      {/* Additional Analytics */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Top Performing Students</h4>
            <div className="space-y-2">
              {(() => {
                // Deduplicate students by email for top performing section
                const uniqueStudents = new Map()
                filteredStudents
                  .filter(s => s.progress_percentage > 75)
                  .forEach(student => {
                    if (!uniqueStudents.has(student.email)) {
                      uniqueStudents.set(student.email, student)
                    }
                  })
                const topStudents = Array.from(uniqueStudents.values()).slice(0, 5)

                return topStudents.map((student, index) => (
                  <div key={`${student.email}-${index}`} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-sm text-gray-700">{student.name}</span>
                    <span className="text-sm font-semibold text-green-600">{Math.round(student.progress_percentage)}%</span>
                  </div>
                ))
              })()}
              {filteredStudents.filter(s => s.progress_percentage > 75).length === 0 && (
                <p className="text-gray-500 text-sm">No students with high progress yet</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Need Attention</h4>
            <div className="space-y-2">
              {(() => {
                // Deduplicate students by email for need attention section
                const uniqueStudents = new Map()
                filteredStudents
                  .filter(s => s.progress_percentage < 25)
                  .forEach(student => {
                    if (!uniqueStudents.has(student.email)) {
                      uniqueStudents.set(student.email, student)
                    }
                  })
                const attentionStudents = Array.from(uniqueStudents.values()).slice(0, 5)

                return attentionStudents.map((student, index) => (
                  <div key={`${student.email}-${index}`} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-sm text-gray-700">{student.name}</span>
                    <span className="text-sm font-semibold text-red-600">{Math.round(student.progress_percentage)}%</span>
                  </div>
                ))
              })()}
              {filteredStudents.filter(s => s.progress_percentage < 25).length === 0 && (
                <p className="text-gray-500 text-sm">All students are making good progress</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AnalyticsView