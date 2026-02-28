import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import './EditCertificateStatus.css'

function EditCertificateStatus() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [certificate, setCertificate] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    verificationStatus: '',
    score: 0,
    remarks: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadCertificate()
  }, [id])

  const loadCertificate = async () => {
    try {
      const docRef = doc(db, 'certificates', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        const cert = {
          id: docSnap.id,
          studentName: data.student_name || 'Unknown',
          certificateTitle: data.certificate_title || 'Untitled',
          certificateType: data.certificate_type || 'General',
          issueDate: data.issue_date || 'N/A',
          verificationStatus: data.verification_status || 'PENDING',
          score: data.score || 0,
          remarks: data.remarks || '',
          imagePath: data.image_path || ''
        }

        setCertificate(cert)
        setFormData({
          verificationStatus: cert.verificationStatus,
          score: cert.score,
          remarks: cert.remarks
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
        showMessage('error', 'Certificate not found!')
        setTimeout(() => navigate('/certificates'), 2000)
      }
    } catch (error) {
      console.error('Error loading certificate:', error)
      showMessage('error', 'Failed to load certificate')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'score' ? parseFloat(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      await updateDoc(doc(db, 'certificates', id), {
        verification_status: formData.verificationStatus,
        score: formData.score,
        remarks: formData.remarks,
        updated_at: Date.now()
      })

      showMessage('success', 'Certificate status updated successfully!')

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/certificates')
      }, 1500)
    } catch (error) {
      console.error('Error updating status:', error)
      showMessage('error', 'Failed to update status: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED':
        return 'status-verified'
      case 'PENDING':
        return 'status-pending'
      case 'REJECTED':
        return 'status-rejected'
      default:
        return 'status-pending'
    }
  }

  if (loading) {
    return <div className="loading">Loading certificate...</div>
  }

  if (!certificate) {
    return <div className="loading">Certificate not found</div>
  }

  return (
    <div className="edit-status-page">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/certificates')}>
          ← Back to Certificates
        </button>
        <h1>Edit Certificate Status</h1>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="edit-container">
        {/* Certificate Preview */}
        <div className="preview-section">
          <h2>Certificate Preview</h2>
          
          {imageUrl && (
            <div className="image-preview">
              <img 
                src={imageUrl} 
                alt="Certificate"
                onError={(e) => {
                  console.error('Image failed to load:', imageUrl)
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="cert-info">
            <div className="info-item">
              <label>Student Name</label>
              <span>{certificate.studentName}</span>
            </div>
            <div className="info-item">
              <label>Certificate Title</label>
              <span>{certificate.certificateTitle}</span>
            </div>
            <div className="info-item">
              <label>Type</label>
              <span>{certificate.certificateType}</span>
            </div>
            <div className="info-item">
              <label>Issue Date</label>
              <span>{certificate.issueDate}</span>
            </div>
            <div className="info-item">
              <label>Current Status</label>
              <span className={`status-badge ${getStatusColor(certificate.verificationStatus)}`}>
                {certificate.verificationStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="form-section">
          <h2>Update Verification Status</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Verification Status *</label>
              <div className="status-options">
                <label className={`status-option ${formData.verificationStatus === 'VERIFIED' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="verificationStatus"
                    value="VERIFIED"
                    checked={formData.verificationStatus === 'VERIFIED'}
                    onChange={handleChange}
                    required
                  />
                  <span className="status-icon">✓</span>
                  <span className="status-text">Verified</span>
                  <span className="status-desc">Certificate is authentic</span>
                </label>

                <label className={`status-option ${formData.verificationStatus === 'PENDING' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="verificationStatus"
                    value="PENDING"
                    checked={formData.verificationStatus === 'PENDING'}
                    onChange={handleChange}
                    required
                  />
                  <span className="status-icon">⏳</span>
                  <span className="status-text">Pending</span>
                  <span className="status-desc">Under review</span>
                </label>

                <label className={`status-option ${formData.verificationStatus === 'REJECTED' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="verificationStatus"
                    value="REJECTED"
                    checked={formData.verificationStatus === 'REJECTED'}
                    onChange={handleChange}
                    required
                  />
                  <span className="status-icon">✗</span>
                  <span className="status-text">Rejected</span>
                  <span className="status-desc">Certificate is invalid</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Verification Score (0-100) *</label>
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                required
              />
              <div className="score-indicator">
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{ width: `${formData.score}%` }}
                  ></div>
                </div>
                <span className="score-value">{formData.score.toFixed(2)}%</span>
              </div>
            </div>

            <div className="form-group">
              <label>Remarks (Optional)</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Add any notes or comments about this verification..."
                rows="4"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/certificates')}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditCertificateStatus
