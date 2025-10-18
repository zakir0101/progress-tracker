import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useDashboardStore } from '../../stores/dashboardStore'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

function ProgressChart() {
  const { displayedStudents, allStudentsProgress } = useDashboardStore()

  const chartData = React.useMemo(() => {
    const progressRanges = {
      '0-25': 0,
      '25-50': 0,
      '50-75': 0,
      '75-100': 0
    }

    // Use allStudentsProgress if displayedStudents is empty
    const studentsToUse = displayedStudents.length > 0 ? displayedStudents : allStudentsProgress.filter(s => s.syllabus_name !== 'contact')

    studentsToUse.forEach(student => {
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
  }, [displayedStudents, allStudentsProgress])

  const options = {
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

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Progress Distribution (Selected Syllabus)
      </h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}

export default ProgressChart