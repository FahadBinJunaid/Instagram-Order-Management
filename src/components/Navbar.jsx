import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      {/* website ka naam (mark ke saath) */}
      <Link to="/" className="navbar-brand">
        <span className="brand-mark">C</span>
        <span className="brand-text">Clothing Store</span>
      </Link>

      {/* navbar ke links */}
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/admin/login" className="navbar-link nav-admin">Admin Login</Link>
      </div>
    </nav>
  )
}

export default Navbar
