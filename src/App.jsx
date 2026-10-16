import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'
import RequireAdmin from './components/RequireAdmin'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import Orders from './pages/admin/Orders'
import Products from './pages/admin/Products'
import Settings from './pages/admin/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public store pages (Layout ke saath) */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetails /></Layout>} />

        {/* Admin login (yeh protected nahi hai) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin pages (protected - login na ho to /admin/login pe bhej do) */}
        <Route path="/admin" element={<RequireAdmin><Dashboard /></RequireAdmin>} />
        <Route path="/admin/orders" element={<RequireAdmin><Orders /></RequireAdmin>} />
        <Route path="/admin/products" element={<RequireAdmin><Products /></RequireAdmin>} />
        <Route path="/admin/settings" element={<RequireAdmin><Settings /></RequireAdmin>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
