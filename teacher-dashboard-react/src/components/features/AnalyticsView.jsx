import React from 'react'
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
  const { displayedStudents, allStudentsProgress, allSyllabuses } = useDashboardStore()

  // Progress distribution chart data
  const progressChartData = React.useMemo(() => {
    const progressRanges = {
      '0-25': 0,
      '25-50': 0,
      '50-75': 0,
      '75-100': 0
    }

    displayedStudents.forEach(student => {
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
  }, [displayedStudents])

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

  // Calculate overall statistics
  const totalStudents = [...new Set(allStudentsProgress.map(s => s.email))].length
  const totalAssignments = allStudentsProgress.filter(s => s.syllabus_name !== 'contact').length
  const totalSyllabuses = allSyllabuses.filter(s => s.id !== 'contact').length
  const averageProgress = displayedStudents.length > 0
    ? displayedStudents.reduce((sum, s) => sum + (s.progress_percentage || 0), 0) / displayedStudents.length
    : 0

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              📊
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-1">Progress Analytics</h3>
              <p className="text-blue-700 text-sm">
                Comprehensive analytics showing student progress distribution and syllabus assignments across your classes.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-semibold">Total Students</p>
            <p className="text-2xl font-bold text-blue-800">{totalStudents}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-semibold">Total Assignments</p>
            <p className="text-2xl font-bold text-green-800">{totalAssignments}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-semibold">Available Syllabuses</p>
            <p className="text-2xl font-bold text-purple-800">{totalSyllabuses}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600 font-semibold">Average Progress</p>
            <p className="text-2xl font-bold text-orange-800">{Math.round(averageProgress)}%</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Distribution Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="h-80">
              <Bar data={progressChartData} options={progressChartOptions} />
            </div>
          </div>

          {/* Syllabus Distribution Chart */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="h-80">
              <Doughnut data={syllabusChartData} options={syllabusChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Top Performing Students</h4>
            <div className="space-y-2">
              {displayedStudents
                .filter(s => s.progress_percentage > 75)
                .slice(0, 5)
                .map((student, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-sm text-gray-700">{student.name}</span>
                    <span className="text-sm font-semibold text-green-600">{student.progress_percentage}%</span>
                  </div>
                ))
              }
              {displayedStudents.filter(s => s.progress_percentage > 75).length === 0 && (
                <p className="text-gray-500 text-sm">No students with high progress yet</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Need Attention</h4>
            <div className="space-y-2">
              {displayedStudents
                .filter(s => s.progress_percentage < 25)
                .slice(0, 5)
                .map((student, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-sm text-gray-700">{student.name}</span>
                    <span className="text-sm font-semibold text-red-600">{student.progress_percentage}%</span>
                  </div>
                ))
              }
              {displayedStudents.filter(s => s.progress_percentage < 25).length === 0 && (
                <p className="text-gray-500 text-sm">All students are making good progress</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsView