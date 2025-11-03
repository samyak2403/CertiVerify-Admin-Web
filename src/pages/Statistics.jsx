import { useState, useEffect, useRef } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Chart, registerables } from 'chart.js'
import './Statistics.css'

Chart.register(...registerables)

function Statistics() {
  const [stats, setStats] = useState({
    totalCerts: 0,
    verifiedRate: 0,
    totalUsers: 0,
    avgScore: 0
  })
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  const statusChartRef = useRef(null)
  const typesChartRef = useRef(null)
  const monthlyChartRef = useRef(null)
  const scoreChartRef = useRef(null)
  const institutionsChartRef = useRef(null)

  const statusChartInstance = useRef(null)
  const typesChartInstance = useRef(null)
  const monthlyChartInstance = useRef(null)
  const scoreChartInstance = useRef(null)
  const institutionsChartInstance = useRef(null)

  useEffect(() => {
    loadStatistics()
    return () => {
      // Cleanup charts on unmount
      if (statusChartInstance.current) statusChartInstance.current.destroy()
      if (typesChartInstance.current) typesChartInstance.current.destroy()
      if (monthlyChartInstance.current) monthlyChartInstance.current.destroy()
      if (scoreChartInstance.current) scoreChartInstance.current.destroy()
      if (institutionsChartInstance.current) institutionsChartInstance.current.destroy()
    }
  }, [])

  useEffect(() => {
    if (certificates.length > 0 && !loading) {
      displayCharts()
    }
  }, [certificates, loading])

  const loadStatistics = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'profiles'))
      const certsSnap = await getDocs(collection(db, 'certificates'))

      const certsData = certsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setCertificates(certsData)

      const totalCerts = certsData.length
      const verifiedCount = certsData.filter(c => c.verification_status === 'VERIFIED').length
      const verifiedRate = totalCerts > 0 ? ((verifiedCount / totalCerts) * 100).toFixed(1) : 0
      const avgScore = totalCerts > 0
        ? (certsData.reduce((sum, cert) => sum + (cert.score || 0), 0) / totalCerts).toFixed(1)
        : 0

      setStats({
        totalCerts,
        verifiedRate,
        totalUsers: usersSnap.size,
        avgScore
      })
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayCharts = () => {
    displayStatusChart()
    displayTypesChart()
    displayMonthlyChart()
    displayScoreChart()
    displayInstitutionsChart()
  }

  const displayStatusChart = () => {
    if (!statusChartRef.current) return

    const statusStats = {
      VERIFIED: certificates.filter(c => c.verification_status === 'VERIFIED').length,
      PENDING: certificates.filter(c => c.verification_status === 'PENDING').length,
      REJECTED: certificates.filter(c => c.verification_status === 'REJECTED').length
    }

    const total = Object.values(statusStats).reduce((a, b) => a + b, 0)
    if (total === 0) return

    const statusOrder = ['VERIFIED', 'PENDING', 'REJECTED']
    const statusColors = {
      VERIFIED: '#10b981',
      PENDING: '#f59e0b',
      REJECTED: '#ef4444'
    }

    const labels = []
    const data = []
    const colors = []

    for (const status of statusOrder) {
      const count = statusStats[status] || 0
      if (count > 0) {
        labels.push(status)
        data.push(count)
        colors.push(statusColors[status])
      }
    }

    if (statusChartInstance.current) {
      statusChartInstance.current.destroy()
    }

    const ctx = statusChartRef.current.getContext('2d')
    statusChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 13, weight: '500' },
              usePointStyle: true,
              pointStyle: 'circle',
              color: '#f1f5f9'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => {
                const label = context.label || ''
                const value = context.parsed || 0
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: ${value} (${percentage}%)`
              }
            }
          }
        }
      }
    })
  }

  const displayTypesChart = () => {
    if (!typesChartRef.current) return

    const typeStats = {}
    certificates.forEach(cert => {
      const type = cert.certificate_type || 'Unknown'
      typeStats[type] = (typeStats[type] || 0) + 1
    })

    const entries = Object.entries(typeStats)
    if (entries.length === 0) return

    const labels = entries.map(([type]) => type)
    const data = entries.map(([, count]) => count)
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0'
    ]

    if (typesChartInstance.current) {
      typesChartInstance.current.destroy()
    }

    const ctx = typesChartRef.current.getContext('2d')
    typesChartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              font: { size: 12 },
              usePointStyle: true,
              color: '#f1f5f9'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => {
                const label = context.label || ''
                const value = context.parsed || 0
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return `${label}: ${value} (${percentage}%)`
              }
            }
          }
        }
      }
    })
  }

  const displayMonthlyChart = () => {
    if (!monthlyChartRef.current) return

    const monthlyStats = {}
    certificates.forEach(cert => {
      const date = new Date(cert.timestamp)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1
    })

    const entries = Object.entries(monthlyStats)
    if (entries.length === 0) return

    entries.sort((a, b) => a[0].localeCompare(b[0]))

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const labels = entries.map(([monthKey]) => {
      const [year, month] = monthKey.split('-')
      return `${monthNames[parseInt(month) - 1]} ${year}`
    })
    const data = entries.map(([, count]) => count)

    if (monthlyChartInstance.current) {
      monthlyChartInstance.current.destroy()
    }

    const ctx = monthlyChartRef.current.getContext('2d')
    monthlyChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Certificates',
          data,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `Certificates: ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 12 },
              color: '#94a3b8'
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            ticks: {
              font: { size: 12 },
              color: '#94a3b8'
            },
            grid: { display: false }
          }
        }
      }
    })
  }

  const displayScoreChart = () => {
    if (!scoreChartRef.current) return

    const scoreRanges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'Below 60': 0
    }

    certificates.forEach(cert => {
      const score = cert.score || 0
      if (score >= 90) scoreRanges['90-100']++
      else if (score >= 80) scoreRanges['80-89']++
      else if (score >= 70) scoreRanges['70-79']++
      else if (score >= 60) scoreRanges['60-69']++
      else scoreRanges['Below 60']++
    })

    const labels = Object.keys(scoreRanges)
    const data = Object.values(scoreRanges)
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280']

    if (scoreChartInstance.current) {
      scoreChartInstance.current.destroy()
    }

    const ctx = scoreChartRef.current.getContext('2d')
    scoreChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Number of Certificates',
          data,
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `Certificates: ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 },
              color: '#94a3b8'
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            ticks: {
              font: { size: 11 },
              color: '#94a3b8'
            },
            grid: { display: false }
          }
        }
      }
    })
  }

  const displayInstitutionsChart = () => {
    if (!institutionsChartRef.current) return

    const institutionStats = {}
    certificates.forEach(cert => {
      const institution = cert.institution_name || 'Unknown'
      institutionStats[institution] = (institutionStats[institution] || 0) + 1
    })

    const entries = Object.entries(institutionStats)
    entries.sort((a, b) => b[1] - a[1])
    const top10 = entries.slice(0, 10)

    if (top10.length === 0) return

    const labels = top10.map(([name]) => name)
    const data = top10.map(([, count]) => count)

    if (institutionsChartInstance.current) {
      institutionsChartInstance.current.destroy()
    }

    const ctx = institutionsChartRef.current.getContext('2d')
    institutionsChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Certificates',
          data,
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            callbacks: {
              label: (context) => `Certificates: ${context.parsed.x}`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 },
              color: '#94a3b8'
            },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            ticks: {
              font: { size: 11 },
              color: '#94a3b8'
            },
            grid: { display: false }
          }
        }
      }
    })
  }

  if (loading) {
    return <div className="loading">Loading statistics...</div>
  }

  return (
    <div className="statistics-page">
      <h1>Statistics</h1>

      {/* Summary Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Certificates</h3>
          <p className="stat-number">{stats.totalCerts}</p>
        </div>
        <div className="stat-card">
          <h3>Verified Rate</h3>
          <p className="stat-number">{stats.verifiedRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Score</h3>
          <p className="stat-number">{stats.avgScore}%</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="stats-container">
        <div className="chart-card">
          <h3>Verification Status Distribution</h3>
          <canvas ref={statusChartRef} style={{maxHeight: '300px'}}></canvas>
        </div>
        <div className="chart-card">
          <h3>Certificate Types</h3>
          <canvas ref={typesChartRef} style={{maxHeight: '300px'}}></canvas>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="stats-container" style={{marginTop: '20px'}}>
        <div className="chart-card">
          <h3>Monthly Uploads Trend</h3>
          <canvas ref={monthlyChartRef} style={{maxHeight: '300px'}}></canvas>
        </div>
        <div className="chart-card">
          <h3>Score Distribution</h3>
          <canvas ref={scoreChartRef} style={{maxHeight: '300px'}}></canvas>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="stats-container" style={{marginTop: '20px'}}>
        <div className="chart-card" style={{gridColumn: '1 / -1'}}>
          <h3>Top Institutions</h3>
          <canvas ref={institutionsChartRef} style={{maxHeight: '250px'}}></canvas>
        </div>
      </div>
    </div>
  )
}

export default Statistics
