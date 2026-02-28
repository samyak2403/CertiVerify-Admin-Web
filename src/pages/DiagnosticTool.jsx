import { useState, useEffect } from 'react'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '../firebase/config'
import './DiagnosticTool.css'

function DiagnosticTool() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSampleCertificates()
  }, [])

  const loadSampleCertificates = async () => {
    try {
      const q = query(collection(db, 'certificates'), limit(5))
      const snapshot = await getDocs(q)
      
      const certs = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }))
      
      setCertificates(certs)
      console.log('Sample certificates:', certs)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="diagnostic-page">Loading...</div>
  }

  return (
    <div className="diagnostic-page">
      <h1>Certificate Data Diagnostic Tool</h1>
      <p>This shows the raw data structure of your certificates</p>
      
      {certificates.map(cert => (
        <div key={cert.id} className="cert-diagnostic">
          <h3>Certificate ID: {cert.id}</h3>
          <div className="data-section">
            <h4>Image Storage Fields:</h4>
            <ul>
              <li><strong>image_path:</strong> {cert.data.image_path || '❌ NOT FOUND'}</li>
              <li><strong>image_base64:</strong> {cert.data.image_base64 ? `✅ EXISTS (${cert.data.image_base64.substring(0, 50)}...)` : '❌ NOT FOUND'}</li>
              <li><strong>image_url:</strong> {cert.data.image_url || '❌ NOT FOUND'}</li>
            </ul>
            
            <h4>All Fields:</h4>
            <pre>{JSON.stringify(cert.data, null, 2)}</pre>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DiagnosticTool
