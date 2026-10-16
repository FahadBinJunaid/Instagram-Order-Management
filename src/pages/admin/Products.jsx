/*
  ADMIN PRODUCTS PAGE

  Is page ke 3 kaam:
  1) Firestore se saari products list karna
  2) Naya product ADD karna (Add Product button)
  3) Purana product EDIT karna (Edit button -> form -> Update Product)
*/

import { useEffect, useState } from "react"
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "../../utils/firebase"

function Products() {

  /* =========================================================
     1. STATES  (jo data form aur list mein chahiye)
     ========================================================= */

  // Firestore se aayi hui products ki list
  const [products, setproducts] = useState([])

  // Form ke inputs ki values
  const [name, setname] = useState("")
  const [description, setdescription] = useState("")
  const [price, setprice] = useState("")
  const [image, setimage] = useState("")
  const [stock, setstock] = useState("")

  // YEH SABSE IMPORTANT CHEEZ HAI:
  //   editid KHAALI ho  ->  ADD  (naya product)
  //   editid mein id ho ->  EDIT (purana product)
  const [editid, seteditid] = useState("")

  // Save hote tak button rokne ke liye (double click se bachne ke liye)
  const [loading, setloading] = useState(false)

  // Error message (page pe neeche dikhta hai)
  const [error, seterror] = useState("")


  /* =========================================================
     2. PAGE KHULNE PAR -> Firestore se data le aao
     ========================================================= */

  useEffect(() => {
    let getproducts = async () => {
      try {
        // "products" collection ki SAARI documents le aao
        const snapshot = await getDocs(collection(db, "products"))

        // Har document se -> uski id + uska data dono nikaal kar list mein daalo
        let arr = []
        snapshot.forEach((productDoc) => {
          arr.push({ id: productDoc.id, ...productDoc.data() })
        })

        setproducts(arr)   // list ko screen pe bhar do
      } catch (error) {
        seterror(error.message)
      }
    }

    getproducts()
  }, [])


  /* =========================================================
     3. FORM SAVE  (add aur edit DONO isi ek function se)
     ========================================================= */

  let saveproduct = async (e) => {
    e.preventDefault()   // form submit pe page refresh na ho

    // --- validation: khali field ho to save mat karo ---
    if (name == "" || price == "" || stock == "") {
      return seterror("please fill name, price and stock")
    }

    seterror("")
    setloading(true)

    // Form ki values se product ka object banao
    let obj = {
      name: name,
      description: description,
      price: Number(price),   // input se STRING aata hai, isliye NUMBER bana diya
      image: image,
      stock: Number(stock),   // same -> number bana diya
    }

    try {
      if (editid == "") {
        // ---------- ADD (naya product) ----------
        // addDoc khud nayi id bana deta hai -> woh ref.id mein milti hai
        const ref = await addDoc(collection(db, "products"), obj)
        // us naye product ko screen wali list mein bhi add kar do
        setproducts([...products, { id: ref.id, ...obj }])

      } else {
        // ---------- EDIT (purana product) ----------
        // us product ki document update kar do (editid wali)
        await updateDoc(doc(db, "products", editid), obj)
        // list mein bhi us product ki jagah naya data rakh do (map se)
        setproducts(
          products.map((product) => product.id == editid ? { id: editid, ...obj } : product)
        )
      }

      resetform()   // sab kuch ho gaya -> form saaf kar do
    } catch (error) {
      seterror(error.message)
    } finally {
      setloading(false)
    }
  }


  /* =========================================================
     4. EDIT BUTTON  ->  form mein us product ki details bhar do
     ========================================================= */

  let editproduct = (product) => {
    seteditid(product.id)                 // ab "edit" mode on ho gaya
    setname(product.name)
    setdescription(product.description || "")   // agar empty ho to ""
    setprice(product.price)
    setimage(product.image || "")
    setstock(product.stock)
  }


  /* =========================================================
     5. FORM SAAF KARO  (wapas "Add" mode)
     ========================================================= */

  let resetform = () => {
    seteditid("")
    setname("")
    setdescription("")
    setprice("")
    setimage("")
    setstock("")
  }


  /* =========================================================
     6. PAGE (JSX)
     ========================================================= */

  return (
    <div className="admin-products">
      <h1>Admin Products</h1>

      {/* ---------- FORM: add aur edit dono isi se ---------- */}
      <form className="product-form" onSubmit={saveproduct}>

        {/* heading mode ke hisaab se badalta hai */}
        <h2>{editid == "" ? "Add Product" : "Edit Product"}</h2>

        <label htmlFor="product-name">Name</label>
        <input id="product-name" type="text" value={name} onChange={(e) => setname(e.target.value)} />

        <label htmlFor="product-description">Description</label>
        <input id="product-description" type="text" value={description} onChange={(e) => setdescription(e.target.value)} />

        <label htmlFor="product-price">Price (Rs.)</label>
        <input id="product-price" type="number" value={price} onChange={(e) => setprice(e.target.value)} />

        <label htmlFor="product-image">Image URL</label>
        <input id="product-image" type="text" value={image} onChange={(e) => setimage(e.target.value)} />

        <label htmlFor="product-stock">Stock</label>
        <input id="product-stock" type="number" value={stock} onChange={(e) => setstock(e.target.value)} />

        {/* button ka text bhi mode ke hisaab se badalta hai */}
        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : (editid == "" ? "Add Product" : "Update Product")}
        </button>

        {/* sirf edit mode mein ho to Cancel ka button dikhao */}
        {editid ? <button type="button" onClick={resetform}>Cancel Edit</button> : null}

        {/* koi error aaye to neeche dikhao */}
        {error ? <p className="error-text">{error}</p> : null}
      </form>

      {/* ---------- LIST: saare products screen pe ---------- */}
      <h2>Products List</h2>
      <div className="product-grid">
        {products.map((product) => {
          return (
            <article className="product-card" key={product.id}>
              <div className="product-media">
                {product.image ? (
                  <img className="product-image" src={product.image} alt={product.name} />
                ) : (
                  <div className="product-image placeholder">No Image</div>
                )}

                {/* admin ko stock HAMESHA dikhta hai (setting yahan lagu nahi) */}
                <span className="stock-badge muted">Stock: {product.stock}</span>
              </div>

              <div className="product-body">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>

                <div className="product-foot">
                  <span className="product-price">Rs. {product.price}</span>
                  <button className="btn btn-outline sm" onClick={() => editproduct(product)}>
                    Edit
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default Products
