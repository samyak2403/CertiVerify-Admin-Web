import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile, updatePassword, updateEmail } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import './AdminProfile.css'

function AdminProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [changePassword, setChangePassword] = useState(false)
  
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
    role: 'Admin',
    photoURL: ''
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const user = auth.currentUser
      if (!user) {
        navigate('/login')
        return
      }

      // Try to load additional profile data from Firestore
      const profileDoc = await getDoc(doc(db, 'admin_profiles', user.uid))
      
      if (profileDoc.exists()) {
        const data = profileDoc.data()
        setProfile({
          displayName: user.displayName || data.displayName || '',
          email: user.email || '',
          phone: data.phone || '',
          role: data.role || 'Admin',
          photoURL: user.photoURL || data.photoURL || ''
        })
      } else {
        setProfile({
          displayName: user.displayName || '',
          email: user.email || '',
          phone: '',
          role: 'Admin',
          photoURL: user.photoURL || ''
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      showMessage('error', 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const user = auth.currentUser

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profile.displayName,
        photoURL: profile.photoURL
      })

      // Save additional data to Firestore
      await setDoc(doc(db, 'admin_profiles', user.uid), {
        displayName: profile.displayName,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        photoURL: profile.photoURL,
        updatedAt: Date.now()
      }, { merge: true })

      showMessage('success', 'Profile updated successfully!')
      setEditMode(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      showMessage('error', 'Failed to update profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (passwords.new !== passwords.confirm) {
      showMessage('error', 'New passwords do not match')
      return
    }

    if (passwords.new.length < 6) {
      showMessage('error', 'Password must be at least 6 characters')
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const user = auth.currentUser
      await updatePassword(user, passwords.new)
      
      showMessage('success', 'Password changed successfully!')
      setChangePassword(false)
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error) {
      console.error('Error changing password:', error)
      if (error.code === 'auth/requires-recent-login') {
        showMessage('error', 'Please log out and log in again before changing password')
      } else {
        showMessage('error', 'Failed to change password: ' + error.message)
      }
    } finally {
      setSaving(false)
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 5000)
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>
  }

  return (
    <div className="admin-profile-page">
      <div className="profile-header">
        <h1>Admin Profile</h1>
        {!editMode && !changePassword && (
          <button className="btn-edit-profile" onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-large">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} />
            ) : (
              <span>{profile.displayName?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || 'A'}</span>
            )}
          </div>
          <h2 className="profile-name">{profile.displayName || 'Admin User'}</h2>
          <p className="profile-email">{profile.email}</p>
          <span className="profile-role-badge">{profile.role}</span>
        </div>

        {/* Profile Information */}
        {!changePassword ? (
          <div className="info-card">
            <h2>Profile Information</h2>
            
            {editMode ? (
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={profile.displayName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Profile Photo URL</label>
                  <input
                    type="url"
                    name="photoURL"
                    value={profile.photoURL}
                    onChange={handleInputChange}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel" 
                    onClick={() => {
                      setEditMode(false)
                      loadProfile()
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-display">
                <div className="info-row">
                  <label>Display Name</label>
                  <span>{profile.displayName || 'Not set'}</span>
                </div>
                <div className="info-row">
                  <label>Email Address</label>
                  <span>{profile.email}</span>
                </div>
                <div className="info-row">
                  <label>Phone Number</label>
                  <span>{profile.phone || 'Not set'}</span>
                </div>
                <div className="info-row">
                  <label>Role</label>
                  <span>{profile.role}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="info-card">
            <h2>Change Password</h2>
            
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    setChangePassword(false)
                    setPasswords({ current: '', new: '', confirm: '' })
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Section */}
        {!editMode && !changePassword && (
          <div className="info-card">
            <h2>Security</h2>
            <div className="security-section">
              <div className="security-item">
                <div>
                  <h3>Password</h3>
                  <p>Change your password to keep your account secure</p>
                </div>
                <button 
                  className="btn-change-password" 
                  onClick={() => setChangePassword(true)}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminProfile
