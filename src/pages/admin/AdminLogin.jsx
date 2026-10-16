import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../utils/firebase"

function AdminLogin() {
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")
  const [loading, setloading] = useState(false)
  const [error, seterror] = useState("")

  let navigate = useNavigate()

  let login = async (e) => {
    e.preventDefault()

    if (email == "" || password == "") {
      return seterror("please fill email and password")
    }

    seterror("")
    setloading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/admin")
    } catch (error) {
      seterror(error.message)
    } finally {
      setloading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={login}>
        <h1>Admin Login</h1>

        {/* respected teacher (Sir Bilal) ke liye admin access (demo credentials) */}
        <p className="login-hint">
          <span className="login-hint-title">For Respected Sir Bilal</span>
          <span className="login-hint-sub">Admin Access (for project evaluation)</span>
          <span>Email: <b>admin123@gmail.com</b></span>
          <span>Password: <b>admin123</b></span>
        </p>

        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setemail(e.target.value)}
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setpassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {error ? <p className="error-text">{error}</p> : null}
      </form>
    </div>
  )
}

export default AdminLogin
