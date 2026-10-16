import { useEffect, useState } from "react"
import { getDoc, setDoc, doc } from "firebase/firestore"
import { db } from "../../utils/firebase"

function Settings() {

  // stock website pe dikhana hai ya nahi
  const [showStock, setShowStock] = useState(false)

  // page load / save ho raha hai
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // error message
  const [error, setError] = useState("")

  // page khulte waqt pehle se saved value laao
  useEffect(() => {
    let loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "store"))

        // doc agar maujood hai to uski value, warna default OFF
        if (snap.exists()) {
          setShowStock(snap.data().showStock === true)
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  // toggle dabao -> value badlo aur Firestore mein save karo
  let handleToggle = async () => {
    let newValue = !showStock

    setSaving(true)
    setError("")

    try {
      // merge: true -> doc na ho to bana do, ho to sirf showStock update karo
      // (baaki settings overwrite nahi hoti)
      await setDoc(doc(db, "settings", "store"), { showStock: newValue }, { merge: true })
      setShowStock(newValue)   // save kamyab -> screen update
    } catch (error) {
      setError(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <h1 className="page-title">Loading...</h1>
  }

  return (
    <div className="admin-settings">
      <h1>Settings</h1>

      {error ? <p className="error-text">{error}</p> : null}

      <label className="toggle-label">
        <input
          type="checkbox"
          checked={showStock}
          disabled={saving}
          onChange={handleToggle}
        />
        Show stock on website
      </label>

      {saving ? <p className="muted-text">Saving...</p> : null}
    </div>
  )
}

export default Settings
