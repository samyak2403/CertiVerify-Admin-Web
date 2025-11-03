import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import './Layout.css'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">🎓</span>
          <h2>Certificate Admin</h2>
        </div>
        
        <nav className="nav-menu">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/users" className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
            <span className="icon">👥</span>
            <span>Users</span>
          </Link>
          <Link to="/certificates" className={`nav-item ${isActive('/certificates') ? 'active' : ''}`}>
            <span className="icon">📜</span>
            <span>Certificates</span>
          </Link>
          <Link to="/verifications" className={`nav-item ${isActive('/verifications') ? 'active' : ''}`}>
            <span className="icon">✓</span>
            <span>Verifications</span>
          </Link>
          <Link to="/statistics" className={`nav-item ${isActive('/statistics') ? 'active' : ''}`}>
            <span className="icon">📈</span>
            <span>Statistics</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className="user-info-link">
            <div className="user-info">
              <div className="user-avatar">
                {auth.currentUser?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{auth.currentUser?.displayName || auth.currentUser?.email}</span>
                <span className="user-role">Admin</span>
              </div>
            </div>
          </Link>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
