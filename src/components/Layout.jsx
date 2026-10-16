import Navbar from './Navbar'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="page">{children}</main>

      {/* website ka footer (sirf public pages pe) */}
      <footer className="footer">
        <span className="footer-brand">Clothing Store</span>
        <span className="footer-text">
          © {new Date().getFullYear()} Clothing Store. All rights reserved.
        </span>
      </footer>
    </>
  )
}

export default Layout
