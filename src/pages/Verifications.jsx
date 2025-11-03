import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import './Verifications.css'

function Verifications() {
  const navigate = useNavigate()
  const [verifications, setVerifications] = useState([])
  const [filteredVers, setFilteredVers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadVerifications()
  }, [])

  useEffect(() => {
    const filtered = verifications.filter(ver =>
      ver.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ver.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredVers(filtered)
  }, [searchTerm, verifications])

  const loadVerifications = async () => {
    try {
      const certsSnap = await getDocs(collection(db, 'certificates'))

      // Create verification records from certificates that are not pending
      const versData = certsSnap.docs
        .map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            studentName: data.student_name || 'Unknown',
            certificateTitle: data.certificate_title || 'Untitled',
            score: data.score || 0,
            verificationStatus: data.verification_status || 'PENDING',
            updatedAt: data.updated_at || data.timestamp || 0,
            ...data
          }
        })
        .filter(ver => ver.verificationStatus !== 'PENDING')

      setVerifications(versData)
      setFilteredVers(versData)
    } catch (error) {
      console.error('Error loading verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewVerification = (verId) => {
    navigate(`/certificates/${verId}`)
  }

  if (loading) {
    return <div className="loading">Loading verifications...</div>
  }

  return (
    <div className="verifications-page">
      <h1>Verifications</h1>

      <div className="page-header">
        <input
          type="text"
          placeholder="Search verifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Certificate ID</th>
              <th>Student Name</th>
              <th>Title</th>
              <th>Date</th>
              <th>Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVers.length > 0 ? (
              filteredVers.map(ver => {
                const date = new Date(ver.updatedAt).toLocaleDateString()
                const isValid = ver.verificationStatus === 'VERIFIED'
                return (
                  <tr key={ver.id}>
                    <td>{ver.id.substring(0, 8)}...</td>
                    <td>{ver.studentName}</td>
                    <td>{ver.certificateTitle}</td>
                    <td>{date}</td>
                    <td>{ver.score.toFixed(2)}%</td>
                    <td>
                      <span className={`status-badge ${isValid ? 'status-verified' : 'status-rejected'}`}>
                        {ver.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <button className="btn-action btn-view" onClick={() => viewVerification(ver.id)}>View</button>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No verifications found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Verifications
