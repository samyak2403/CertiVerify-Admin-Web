import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    adminCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Admin registration code (in production, this should be more secure)
  const ADMIN_REGISTRATION_CODE = 'ADMIN2024'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.adminCode !== ADMIN_REGISTRATION_CODE) {
      setError('Invalid admin registration code')
      return
    }

    setLoading(true)

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      const user = userCredential.user

      // Update profile with display name
      await updateProfile(user, {
        displayName: formData.displayName
      })

      // Save admin profile to Firestore
      await setDoc(doc(db, 'admin_profiles', user.uid), {
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        role: 'Admin',
        createdAt: Date.now(),
        updatedAt: Date.now()
      })

      // Save to admins collection for verification
      await setDoc(doc(db, 'admins', user.uid), {
        email: formData.email,
        displayName: formData.displayName,
        role: 'Admin',
        createdAt: Date.now()
      })

      // Redirect to dashboard
      navigate('/')
    } catch (error) {
      console.error('Registration error:', error)
      
      if (error.code === 'auth/email-already-in-use') {
        setError('Email is already registered')
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak')
      } else {
        setError('Failed to create account: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🎓 Certificate Admin</h1>
            <p>AI-Based Student Certificate Authentication</p>
          </div>
          
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Admin Registration</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1234567890"
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <small>Minimum 6 characters</small>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Admin Registration Code</label>
              <input
                type="text"
                name="adminCode"
                value={formData.adminCode}
                onChange={handleChange}
                placeholder="Enter admin code"
                required
              />
              <small>Contact system administrator for the code</small>
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Admin Account'}
            </button>

            <div className="form-footer">
              Already have an account? <Link to="/login">Login here</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
