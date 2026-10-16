/*
  PRODUCT DETAILS PAGE (public)

  Ek product ki poori detail (professional 2-column layout).
  - URL se id lo (/products/:id)
  - product AUR showStock dono LIVE aate hain (onSnapshot)
      -> admin product edit kare to foran update, reload ki zaroorat nahi
  - Stock sirf tab dikhta hai jab settings/store mein showStock ON ho
*/

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { onSnapshot, doc } from "firebase/firestore"
import { db } from "../utils/firebase"

function ProductDetails() {

  // URL se product ki id
  const { id } = useParams()

  // Firestore se mila product
  const [product, setProduct] = useState(null)

  // stock dikhana hai ya nahi (settings/store se) - ye GLOBAL setting hai
  const [showStock, setShowStock] = useState(false)

  // load aur error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  /* =========================================================
     1. PRODUCT -> LIVE sun-o (onSnapshot)

     getDoc() sirf EK dafa data deta tha, isliye admin ke
     edit ki hui detail yahan reload ke bagair nahi aati thi.
     onSnapshot har change pe khud chalta hai.
     ========================================================= */

  useEffect(() => {

    const unsubscribe = onSnapshot(
      doc(db, "products", id),
      (snap) => {
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() })
          setError("")
        } else {
          setProduct(null)
          setError("Product not found")
        }
        setLoading(false)
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      }
    )

    // page chhoote hi listener hata do (memory leak se bachne ke liye)
    return () => unsubscribe()

  }, [id])


  /* =========================================================
     2. STOCK SETTING -> LIVE sun-o (onSnapshot)
     ========================================================= */

  useEffect(() => {

    const unsubscribe = onSnapshot(
      doc(db, "settings", "store"),
      (snap) => {
        setShowStock(snap.exists() && snap.data().showStock === true)
      },
      () => {
        // settings na mile to stock chhup jata hai (page phir bhi theek chalta hai)
        setShowStock(false)
      }
    )

    return () => unsubscribe()

  }, [])


  /* =========================================================
     3. PAGE (JSX)
     ========================================================= */

  if (loading) {
    return <p className="empty-text center">Loading product...</p>
  }

  if (error || !product) {
    return (
      <div className="details-error">
        <p className="error-text">{error || "Product not found"}</p>
        <Link className="btn btn-primary" to="/">Back to Products</Link>
      </div>
    )
  }

  return (
    <div className="product-page">

      {/* breadcrumb: aap kahan ho */}
      <Link className="breadcrumb" to="/">← Back to Products</Link>

      <div className="product-details">

        {/* ---------- LEFT: image ---------- */}
        <div className="product-details-gallery">
          {product.image ? (
            <img
              className="product-details-image"
              src={product.image}
              alt={product.name}
            />
          ) : (
            <div className="product-details-image placeholder">No Image</div>
          )}
        </div>

        {/* ---------- RIGHT: info ---------- */}
        <div className="product-details-info">
          <span className="section-tag">Product Details</span>

          <h1 className="details-title">{product.name}</h1>

          <p className="details-price">Rs. {product.price}</p>

          {/* stock sirf tab dikhao jab showStock ON ho */}
          {showStock ? (
            <span className="stock-badge big">
              {product.stock == 1 ? "1 left" : product.stock + " in stock"}
            </span>
          ) : null}

          {/* description sirf tab dikhao jab likha ho */}
          {product.description ? (
            <p className="details-desc">{product.description}</p>
          ) : null}

          <hr className="details-divider" />

          <div className="details-actions">
            <Link className="btn btn-primary" to="/">Browse all products</Link>
            <Link className="btn btn-outline" to="/">Back to Home</Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProductDetails
