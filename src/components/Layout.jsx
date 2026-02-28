import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import './Layout.css'

function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      {/* Mobile Header elements */}
      <div className="mobile-header">
        <div className="logo-mobile">
          <span className="logo-icon">🎓</span>
          <h2>Admin Dashboard</h2>
        </div>
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <span className="logo-icon">🎓</span>
          <h2>Certificate Admin</h2>
          <button className="mobile-close-btn" onClick={closeSidebar}>×</button>
        </div>

        <nav className="nav-menu">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link to="/users" className={`nav-item ${isActive('/users') ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="icon">👥</span>
            <span>Users</span>
          </Link>
          <Link to="/certificates" className={`nav-item ${isActive('/certificates') ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="icon">📜</span>
            <span>Certificates</span>
          </Link>
          <Link to="/verifications" className={`nav-item ${isActive('/verifications') ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="icon">✓</span>
            <span>Verifications</span>
          </Link>
          <Link to="/statistics" className={`nav-item ${isActive('/statistics') ? 'active' : ''}`} onClick={closeSidebar}>
            <span className="icon">📈</span>
            <span>Statistics</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className="user-info-link" onClick={closeSidebar}>
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
