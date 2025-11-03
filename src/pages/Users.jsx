import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import './Users.css'

function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [certificates, setCertificates] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const loadData = async () => {
    try {
      // Load users from profiles collection
      const usersSnap = await getDocs(collection(db, 'profiles'))
      const certsSnap = await getDocs(collection(db, 'certificates'))
      
      const certsData = certsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setCertificates(certsData)

      const usersData = usersSnap.docs.map(doc => {
        const data = doc.data()
        const userEmail = data.email || ''
        const userCerts = certsData.filter(c => c.user_email === userEmail)
        
        return {
          id: doc.id,
          name: data.full_name || data.email || 'Unknown',
          email: data.email || '',
          phone: data.phone || 'N/A',
          studentId: data.student_id || 'N/A',
          institution: data.institution || 'N/A',
          department: data.department || 'N/A',
          certificates: userCerts.length
        }
      })
      
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewUser = (userId) => {
    navigate(`/users/${userId}`)
  }

  const deleteUser = async (userId, userEmail) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their certificates.')) {
      return
    }

    try {
      // Delete user's certificates
      const userCerts = certificates.filter(c => c.user_email === userEmail)
      for (const cert of userCerts) {
        await db.collection('certificates').doc(cert.id).delete()
      }

      // Delete user profile
      await db.collection('profiles').doc(userId).delete()

      alert('User deleted successfully')
      loadData()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user: ' + error.message)
    }
  }

  if (loading) {
    return <div className="loading">Loading users...</div>
  }

  return (
    <div className="users-page">
      <h1>Users Management</h1>
      
      <div className="page-header">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Certificates</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.studentId}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.certificates}</td>
                  <td>
                    <button className="btn-action btn-view" onClick={() => viewUser(user.id)}>View</button>
                    <button className="btn-action btn-delete" onClick={() => deleteUser(user.id, user.email)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

export default Users
