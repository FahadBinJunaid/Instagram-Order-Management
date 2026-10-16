/*
  ADMIN LAYOUT

  Admin ke saare pages ke upar ek sidebar (left menu) dikhata hai.
  Badi website dashboard jaisa look:
  - Left: brand + menu links (active page highlight) + logout
  - Upar: topbar
  - Andar: asli page content
*/

import { NavLink, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../utils/firebase"

function AdminLayout({ children }) {

  let navigate = useNavigate()

  // logout: Firebase se sign out karo, phir login page pe bhej do
  let handleLogout = async () => {
    await signOut(auth)
    navigate("/admin/login")
  }

  // link ka class: jo page khula hai usme "active" lag jaye
  let linkClass = ({ isActive }) => {
    return isActive ? "admin-nav-link active" : "admin-nav-link"
  }

  return (
    <div className="admin-layout">

      {/* ---------- LEFT SIDEBAR ---------- */}
      <aside className="admin-sidebar">
        <div className="admin-brand">Clothing Store</div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/admin/orders" className={linkClass}>Orders</NavLink>
          <NavLink to="/admin/products" className={linkClass}>Products</NavLink>
          <NavLink to="/admin/settings" className={linkClass}>Settings</NavLink>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>Logout</button>
      </aside>

      {/* ---------- RIGHT: topbar + content ---------- */}
      <div className="admin-main">

        <header className="admin-topbar">
          <span className="admin-topbar-title">Admin Panel</span>
          <span className="admin-topbar-user">Seller</span>
        </header>

        <div className="admin-content">{children}</div>
      </div>

    </div>
  )
}

export default AdminLayout
