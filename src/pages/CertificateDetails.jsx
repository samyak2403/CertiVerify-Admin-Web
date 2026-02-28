import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import './CertificateDetails.css'

function CertificateDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [certificate, setCertificate] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCertificate()
  }, [id])

  const loadCertificate = async () => {
    try {
      const docRef = doc(db, 'certificates', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        setCertificate({
          id: docSnap.id,
          userEmail: data.user_email || '',
          studentName: data.student_name || 'Unknown',
          studentId: data.student_id || 'N/A',
          certificateTitle: data.certificate_title || 'Untitled',
          issuerName: data.issuer_name || 'Unknown',
          issueDate: data.issue_date || 'N/A',
          certificateType: data.certificate_type || 'General',
          duration: data.duration || 'N/A',
          imagePath: data.image_path || '',
          extractedText: data.extracted_text || '',
          score: data.score || 0,
          verificationStatus: data.verification_status || 'PENDING',
          timestamp: data.timestamp || 0,
          courseName: data.course_name || '',
          institutionName: data.institution_name || '',
          grade: data.grade || '',
          createdAt: data.created_at || 0,
          updatedAt: data.updated_at || 0
        })

        // Load image URL directly from Firestore
        // Priority: image_storage_url (Firebase Storage URL) > image_url > imageUrl > image_path
        const imageUrl = data.image_storage_url || data.image_url || data.imageUrl || data.image_path || data.imagePath

        if (imageUrl) {
          console.log('Image URL found:', imageUrl)
          setImageUrl(imageUrl)
        } else {
          console.log('No image URL found in certificate data')
          console.log('Available fields:', Object.keys(data))
        }
      } else {
        alert('Certificate not found!')
        navigate('/certificates')
      }
    } catch (error) {
      console.error('Error loading certificate:', error)
      alert('Failed to load certificate')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || 'pending'
    return <span className={`status-badge status-${statusLower}`}>{status}</span>
  }

  if (loading) {
    return <div className="loading">Loading certificate details...</div>
  }

  if (!certificate) {
    return <div className="loading">Certificate not found</div>
  }

  return (
    <div className="certificate-details-page">
      <div className="details-header">
        <button className="btn-back" onClick={() => navigate('/certificates')}>
          ← Back to Certificates
        </button>
        <h1>Certificate Details</h1>
      </div>

      <div className="details-container">
        {/* Certificate Image */}
        {imageUrl && (
          <div className="image-section">
            <h2>Certificate Image</h2>
            <div className="image-wrapper">
              <img
                src={imageUrl}
                alt="Certificate"
                className="certificate-image"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl)
                  e.target.style.display = 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="info-section">
          <h2>Basic Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Certificate ID</label>
              <div className="info-value">{certificate.id}</div>
            </div>
            <div className="info-item">
              <label>Status</label>
              <div className="info-value">{getStatusBadge(certificate.verificationStatus)}</div>
            </div>
            <div className="info-item">
              <label>Verification Score</label>
              <div className="info-value score-value">{certificate.score.toFixed(2)}%</div>
            </div>
            <div className="info-item">
              <label>Upload Date</label>
              <div className="info-value">{new Date(certificate.timestamp).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="info-section">
          <h2>Student Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Student Name</label>
              <div className="info-value">{certificate.studentName}</div>
            </div>
            <div className="info-item">
              <label>Student ID</label>
              <div className="info-value">{certificate.studentId}</div>
            </div>
            <div className="info-item">
              <label>Email</label>
              <div className="info-value">{certificate.userEmail}</div>
            </div>
          </div>
        </div>

        {/* Certificate Information */}
        <div className="info-section">
          <h2>Certificate Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Certificate Title</label>
              <div className="info-value">{certificate.certificateTitle}</div>
            </div>
            <div className="info-item">
              <label>Certificate Type</label>
              <div className="info-value">{certificate.certificateType}</div>
            </div>
            <div className="info-item">
              <label>Course Name</label>
              <div className="info-value">{certificate.courseName || 'N/A'}</div>
            </div>
            <div className="info-item">
              <label>Grade</label>
              <div className="info-value">{certificate.grade || 'N/A'}</div>
            </div>
            <div className="info-item">
              <label>Issuer Name</label>
              <div className="info-value">{certificate.issuerName}</div>
            </div>
            <div className="info-item">
              <label>Institution</label>
              <div className="info-value">{certificate.institutionName || 'N/A'}</div>
            </div>
            <div className="info-item">
              <label>Issue Date</label>
              <div className="info-value">{certificate.issueDate}</div>
            </div>
            <div className="info-item">
              <label>Duration</label>
              <div className="info-value">{certificate.duration}</div>
            </div>
          </div>
        </div>

        {/* Extracted Text */}
        {certificate.extractedText && (
          <div className="info-section">
            <h2>Extracted Text (OCR)</h2>
            <div className="extracted-text">
              {certificate.extractedText}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CertificateDetails
