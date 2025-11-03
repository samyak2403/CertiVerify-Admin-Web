import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import './UserDetails.css'

function UserDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [id])

  const loadUserData = async () => {
    try {
      // Load user profile
      const userDocRef = doc(db, 'profiles', id)
      const userDocSnap = await getDoc(userDocRef)

      if (!userDocSnap.exists()) {
        alert('User not found!')
        navigate('/users')
        return
      }

      const userData = userDocSnap.data()
      const userEmail = userData.email || ''

      // Load user's certificates
      const certsQuery = query(
        collection(db, 'certificates'),
        where('user_email', '==', userEmail)
      )
      const certsSnap = await getDocs(certsQuery)

      const certsData = certsSnap.docs.map(doc => ({
        id: doc.id,
        certificateTitle: doc.data().certificate_title || 'Untitled',
        certificateType: doc.data().certificate_type || 'General',
        issueDate: doc.data().issue_date || 'N/A',
        verificationStatus: doc.data().verification_status || 'PENDING',
        score: doc.data().score || 0,
        timestamp: doc.data().timestamp || 0
      }))

      const verifiedCount = certsData.filter(c => c.verificationStatus === 'VERIFIED').length

      setUser({
        id: userDocSnap.id,
        name: userData.full_name || userData.email || 'Unknown',
        email: userData.email || '',
        phone: userData.phone || 'N/A',
        studentId: userData.student_id || 'N/A',
        institution: userData.institution || 'N/A',
        department: userData.department || 'N/A',
        profilePictureUrl: userData.profile_picture_url || '',
        createdAt: userData.created_at || 0,
        totalCertificates: certsData.length,
        verifiedCertificates: verifiedCount
      })

      setCertificates(certsData)
    } catch (error) {
      console.error('Error loading user data:', error)
      alert('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const viewCertificate = (certId) => {
    navigate(`/certificates/${certId}`)
  }

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || 'pending'
    return <span className={`status-badge status-${statusLower}`}>{status}</span>
  }

  if (loading) {
    return <div className="loading">Loading user details...</div>
  }

  if (!user) {
    return <div className="loading">User not found</div>
  }

  return (
    <div className="user-details-page">
      <div className="details-header">
        <button className="btn-back" onClick={() => navigate('/users')}>
          ← Back to Users
        </button>
        <h1>User Details</h1>
      </div>

      <div className="details-container">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-avatar">
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={user.name} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-label">Total Certificates</span>
                <span className="stat-value">{user.totalCertificates}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Verified</span>
                <span className="stat-value">{user.verifiedCertificates}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{user.totalCertificates - user.verifiedCertificates}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="info-section">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <div className="info-value">{user.name}</div>
            </div>
            <div className="info-item">
              <label>Email Address</label>
              <div className="info-value">{user.email}</div>
            </div>
            <div className="info-item">
              <label>Student ID</label>
              <div className="info-value">{user.studentId}</div>
            </div>
            <div className="info-item">
              <label>Phone Number</label>
              <div className="info-value">{user.phone}</div>
            </div>
            <div className="info-item">
              <label>Institution</label>
              <div className="info-value">{user.institution}</div>
            </div>
            <div className="info-item">
              <label>Department</label>
              <div className="info-value">{user.department}</div>
            </div>
            <div className="info-item">
              <label>Member Since</label>
              <div className="info-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Certificates */}
        <div className="info-section">
          <h2>Certificates ({certificates.length})</h2>
          {certificates.length > 0 ? (
            <div className="certificates-list">
              {certificates.map(cert => (
                <div key={cert.id} className="certificate-card">
                  <div className="cert-info">
                    <div className="cert-title">{cert.certificateTitle}</div>
                    <div className="cert-meta">
                      <span>Type: {cert.certificateType}</span>
                      <span>Issue Date: {cert.issueDate}</span>
                      <span>Score: {cert.score.toFixed(2)}%</span>
                      <span>{getStatusBadge(cert.verificationStatus)}</span>
                    </div>
                  </div>
                  <div className="cert-actions">
                    <button 
                      className="btn-view-cert" 
                      onClick={() => viewCertificate(cert.id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-certificates">
              <p>📜 No certificates uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDetails
