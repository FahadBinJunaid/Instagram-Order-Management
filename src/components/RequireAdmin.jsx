import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../utils/firebase"
import AdminLayout from "./AdminLayout"

function RequireAdmin({ children }) {
  const [admin, setadmin] = useState(false)
  const [checking, setchecking] = useState(true)

  // Firebase se check karte hain ke admin login hai ya nahi
  useEffect(() => {
    // listener ko "unsubscribe" mein rakho
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setadmin(true)
      } else {
        setadmin(false)
      }
      setchecking(false)
    })

    // page chhoote hi listener hata do (memory leak se bachne ke liye)
    return () => unsubscribe()
  }, [])

  // Abhi check ho raha hai
  if (checking) {
    return <h1 className="page-title">Loading...</h1>
  }

  // Login nahi hai to login page pe bhej do
  if (admin == false) {
    return <Navigate to="/admin/login" />
  }

  // Login hai to admin nav ke saath andar wala page dikhao
  return <AdminLayout>{children}</AdminLayout>
}

export default RequireAdmin
