/*
  HOME PAGE (public)

  Yahan customer ko saare products dikhte hain.
  - Hero section (website ka intro)
  - Product grid (image, name, price, stock)
  - products AUR showStock dono LIVE aate hain (onSnapshot)
      -> admin product add/edit kare to foran update, reload ki zaroorat nahi
  - Stock sirf tab dikhta hai jab settings/store mein showStock ON ho
  - Product pe click -> /products/:id (detail page)
*/

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { collection, onSnapshot, doc } from "firebase/firestore"
import { db } from "../utils/firebase"

function Home() {

  // Firestore se aaye products (list ke liye)
  const [products, setProducts] = useState([])

  // stock dikhana hai ya nahi (settings/store se) - ye GLOBAL setting hai
  const [showStock, setShowStock] = useState(false)

  // products load ho rahe hain ya nahi
  const [loading, setLoading] = useState(true)

  // Error message
  const [error, setError] = useState("")


  /* =========================================================
     1. PRODUCTS -> LIVE sun-o (onSnapshot)

     getDocs() sirf EK dafa data deta tha, isliye admin ke naye
     product yahan reload ke bagair nahi aate the.
     onSnapshot har change pe khud chalta hai (add / edit / delete).
     ========================================================= */

  useEffect(() => {

    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        let list = []
        snapshot.forEach((productDoc) => {
          list.push({ id: productDoc.id, ...productDoc.data() })
        })

        setProducts(list)
        setLoading(false)
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      }
    )

    // page chhoote hi listener hata do (memory leak se bachne ke liye)
    return () => unsubscribe()

  }, [])


  /* =========================================================
     2. STOCK SETTING -> LIVE sun-o (onSnapshot)
     ========================================================= */

  useEffect(() => {

    const unsubscribe = onSnapshot(
      doc(db, "settings", "store"),
      (snap) => {
        setShowStock(snap.exists() && snap.data().showStock === true)
      },
      (error) => {
        setError(error.message)
      }
    )

    return () => unsubscribe()

  }, [])


  /* =========================================================
     3. PAGE (JSX)
     ========================================================= */

  return (
    <div className="home">

      {/* ---------- HERO (website ka intro) ---------- */}
      <section className="hero">
        <span className="hero-tag">New Season Collection</span>
        <h1 className="hero-title">Clothing That Feels Like You</h1>
        <p className="hero-text">
          Hand-picked outfits for everyday style. Browse the collection and
          order us directly on Instagram.
        </p>
        <a className="btn btn-light" href="#products">Shop Now</a>
      </section>

      {/* ---------- PRODUCTS SECTION ---------- */}
      <section className="products-section" id="products">

        <div className="section-head">
          <span className="section-tag">Our Collection</span>
          <h2 className="section-title">Latest Products</h2>
        </div>

        {/* koi error aaye to dikhao */}
        {error ? <p className="error-text">{error}</p> : null}

        {/* products load ho rahe hain */}
        {loading ? <p className="empty-text">Loading products...</p> : null}

        {/* saare products grid mein */}
        <div className="product-grid">
          {products.map((product) => {
            return (
              <article className="product-card" key={product.id}>

                {/* image ka area (overlay badge yahan hota hai) */}
                <div className="product-media">
                  {product.image ? (
                    <img className="product-image" src={product.image} alt={product.name} />
                  ) : (
                    <div className="product-image placeholder">No Image</div>
                  )}

                  {/* stock sirf tab dikhao jab showStock ON ho */}
                  {showStock ? (
                    <span className="stock-badge">
                      {product.stock == 1 ? "1 left" : product.stock + " in stock"}
                    </span>
                  ) : null}
                </div>

                {/* neeche wala text area */}
                <div className="product-body">
                  <h3 className="product-name">{product.name}</h3>

                  <div className="product-foot">
                    <span className="product-price">Rs. {product.price}</span>

                    {/* click karne pe us product ki detail khulegi */}
                    <Link className="product-cta" to={`/products/${product.id}`}>
                      View Details
                    </Link>
                  </div>
                </div>

              </article>
            )
          })}
        </div>

        {/* agar koi product na ho aur load bhi ho chuka ho */}
        {!loading && products.length == 0 && !error ? (
          <p className="empty-text">No products yet. Please check back soon.</p>
        ) : null}

      </section>
    </div>
  )
}

export default Home
