import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase/config'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCertificates: 0,
    verified: 0,
    pending: 0
  })
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load users from profiles collection
      const usersSnap = await getDocs(collection(db, 'profiles'))
      
      // Load certificates
      const certsSnap = await getDocs(
        query(collection(db, 'certificates'), orderBy('timestamp', 'desc'))
      )
      
      const certificates = certsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // Count by verification status
      const verifiedCount = certificates.filter(c => c.verification_status === 'VERIFIED').length
      const pendingCount = certificates.filter(c => c.verification_status === 'PENDING').length

      setStats({
        totalUsers: usersSnap.size,
        totalCertificates: certificates.length,
        verified: verifiedCount,
        pending: pendingCount
      })

      // Get recent 10 certificates for activity
      const recentActivities = certificates.slice(0, 10).map(cert => ({
        id: cert.id,
        studentName: cert.student_name || 'Unknown',
        certificateTitle: cert.certificate_title || 'Untitled',
        verificationStatus: cert.verification_status || 'PENDING',
        timestamp: cert.timestamp || 0
      }))
      
      setActivities(recentActivities)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Certificates</h3>
          <p className="stat-number">{stats.totalCertificates}</p>
        </div>
        <div className="stat-card">
          <h3>Verified</h3>
          <p className="stat-number">{stats.verified}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pending}</p>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {activities.length > 0 ? (
            activities.map(activity => {
              const date = new Date(activity.timestamp).toLocaleDateString()
              return (
                <div key={activity.id} className="activity-item">
                  <div>
                    <strong>{activity.studentName}</strong> uploaded certificate{' '}
                    <strong>{activity.certificateTitle}</strong>{' '}
                    <span className={`status-badge status-${activity.verificationStatus.toLowerCase()}`}>
                      {activity.verificationStatus}
                    </span>
                  </div>
                  <div>{date}</div>
                </div>
              )
            })
          ) : (
            <p className="no-data">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
