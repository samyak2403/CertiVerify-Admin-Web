import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import './Certificates.css'

function Certificates() {
  const navigate = useNavigate()
  const [certificates, setCertificates] = useState([])
  const [filteredCerts, setFilteredCerts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCertificates()
  }, [])

  useEffect(() => {
    let filtered = certificates

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateType?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.verificationStatus?.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredCerts(filtered)
  }, [searchTerm, statusFilter, certificates])

  const loadCertificates = async () => {
    try {
      const certsSnap = await getDocs(collection(db, 'certificates'))
      const certsData = certsSnap.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          userEmail: data.user_email || '',
          studentName: data.student_name || 'Unknown',
          studentId: data.student_id || 'N/A',
          certificateTitle: data.certificate_title || 'Untitled',
          issuerName: data.issuer_name || 'Unknown',
          issueDate: data.issue_date || 'N/A',
          certificateType: data.certificate_type || 'General',
          duration: data.duration || 'N/A',
          imagePath: data.image_path || '',
          imageBase64: data.image_base64 || '',
          extractedText: data.extracted_text || '',
          score: data.score || 0,
          verificationStatus: data.verification_status || 'PENDING',
          timestamp: data.timestamp || 0,
          courseName: data.course_name || '',
          institutionName: data.institution_name || '',
          grade: data.grade || ''
        }
      })
      setCertificates(certsData)
      setFilteredCerts(certsData)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const editStatus = (certId) => {
    navigate(`/certificates/${certId}/edit`)
  }

  const deleteCertificate = async (certId) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'certificates', certId))
      alert('Certificate deleted successfully')
      loadCertificates()
    } catch (error) {
      console.error('Error deleting certificate:', error)
      alert('Failed to delete certificate: ' + error.message)
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
    return <div className="loading">Loading certificates...</div>
  }

  return (
    <div className="certificates-page">
      <h1>Certificates Management</h1>

      <div className="page-header">
        <input
          type="text"
          placeholder="Search certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Certificate ID</th>
              <th>Student Name</th>
              <th>Title</th>
              <th>Type</th>
              <th>Issue Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCerts.length > 0 ? (
              filteredCerts.map(cert => (
                <tr key={cert.id}>
                  <td>{cert.id.substring(0, 8)}...</td>
                  <td>{cert.studentName}</td>
                  <td>{cert.certificateTitle}</td>
                  <td>{cert.certificateType}</td>
                  <td>{cert.issueDate}</td>
                  <td>{getStatusBadge(cert.verificationStatus)}</td>
                  <td>
                    <button className="btn-action btn-view" onClick={() => viewCertificate(cert.id)}>View</button>
                    <button className="btn-action btn-edit" onClick={() => editStatus(cert.id)}>Edit Status</button>
                    <button className="btn-action btn-delete" onClick={() => deleteCertificate(cert.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No certificates found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Certificates
