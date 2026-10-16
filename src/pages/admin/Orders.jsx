/*
  ADMIN ORDERS PAGE

  Is page ke 3 kaam:
  1) Instagram / WhatsApp se aaya order ADMIN khud enter karta hai (form)
  2) Saare orders ki list dikhana
  3) Har order ka payment / order status badalna (dropdown)
*/

import { useEffect, useState } from "react"
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { db } from "../../utils/firebase"

function Orders() {

  /* =========================================================
     1. STATES  (jo data form aur list mein chahiye)
     ========================================================= */

  // Firestore se aaye orders (list ke liye)
  const [orders, setOrders] = useState([])

  // Firestore ke products (dropdown ke liye)
  const [products, setProducts] = useState([])

  // Form ki fields
  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [instagramUsername, setInstagramUsername] = useState("")   // optional
  const [productId, setProductId] = useState("")                   // dropdown wala product
  const [quantity, setQuantity] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("unpaid")
  const [orderStatus, setOrderStatus] = useState("pending")

  // Save hote tak button rokne ke liye
  const [loading, setLoading] = useState(false)

  // Error message (neeche red mein dikhta hai)
  const [error, setError] = useState("")


  /* =========================================================
     2. PAGE KHULNE PAR -> Firestore se data le aao
     ========================================================= */

  useEffect(() => {

    // dropdown ke liye products laao
    let loadProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"))
        let list = []
        snapshot.forEach((productDoc) => {
          list.push({ id: productDoc.id, ...productDoc.data() })
        })
        setProducts(list)
      } catch (error) {
        setError(error.message)
      }
    }

    // list ke liye orders laao
    let loadOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, "orders"))
        let list = []
        snapshot.forEach((orderDoc) => {
          list.push({ id: orderDoc.id, ...orderDoc.data() })
        })
        setOrders(list)
      } catch (error) {
        setError(error.message)
      }
    }

    loadProducts()
    loadOrders()

  }, [])


  /* =========================================================
     3. TOTAL khud calculate hota hai -> price × quantity
     ========================================================= */

  // Dropdown se jo product selected hai, uska price nikaalo
  let selectedProduct = products.find((product) => product.id == productId)
  let orderTotal = selectedProduct ? selectedProduct.price * Number(quantity) : 0


  /* =========================================================
     4. NAYA ORDER SAVE  (form submit)
     ========================================================= */

  let handleSaveOrder = async (e) => {
    e.preventDefault()   // page refresh na ho

    // validation (instagram optional hai isliye check nahi)
    if (customerName == "" || phone == "" || productId == "" || quantity == "") {
      return setError("please fill name, phone, product and quantity")
    }

    setError("")
    setLoading(true)

    // order ka object (plan wale saare fields)
    let obj = {
      customerName: customerName,
      phone: phone,
      instagramUsername: instagramUsername,   // optional
      productId: productId,
      productName: selectedProduct.name,
      price: selectedProduct.price,
      quantity: Number(quantity),
      total: orderTotal,                      // price × quantity
      paymentStatus: paymentStatus,           // "paid" | "unpaid"
      orderStatus: orderStatus,               // pending/confirmed/shipped/delivered
      createdAt: serverTimestamp(),
    }

    try {
      // addDoc khud nayi id bana deta hai -> woh ref.id mein milti hai
      const ref = await addDoc(collection(db, "orders"), obj)

      // naya order screen wali list mein bhi add kar do
      setOrders([...orders, { id: ref.id, ...obj }])

      resetForm()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }


  /* =========================================================
     5. STATUS UPDATE  (payment aur order status)

     Yahan 2 kaam hote hain:
       1) Firebase mein status badalna   (updateDoc)
       2) Screen pe naya status dikhana  (list ko update karna)

     Firebase khud screen nahi badalta, isliye humein apni
     "orders" list bhi badalni parti hai. Isi ko "extra code" kehte hain.
     ========================================================= */

  // PAYMENT status update (unpaid <-> paid)
  let handlePaymentUpdate = async (id, value) => {
    try {
      // 1) Firebase mein sirf paymentStatus update karo
      await updateDoc(doc(db, "orders", id), { paymentStatus: value })

      // 2) Screen pe bhi naya status dikhao.
      //    Har order pe jao:
      //      - jo order badla (id match) -> uski copy banao, sirf paymentStatus naya rakho
      //      - baaki orders -> waise hi rehne do
      //    { ...singleOrder, paymentStatus: value } ka matlab:
      //    purane order ki saari fields copy + naya paymentStatus.
      let newOrders = orders.map((singleOrder) => {
        if (singleOrder.id == id) {
          return { ...singleOrder, paymentStatus: value }
        }
        return singleOrder
      })

      setOrders(newOrders)
    } catch (error) {
      setError(error.message)
    }
  }

  // ORDER status update (pending / confirmed / shipped / delivered)
  let handleOrderStatusUpdate = async (id, value) => {
    try {
      // 1) Firebase mein sirf orderStatus update karo
      await updateDoc(doc(db, "orders", id), { orderStatus: value })

      // 2) Screen pe bhi naya status dikhao (wahi tarika jo upar hai)
      let newOrders = orders.map((singleOrder) => {
        if (singleOrder.id == id) {
          return { ...singleOrder, orderStatus: value }
        }
        return singleOrder
      })

      setOrders(newOrders)
    } catch (error) {
      setError(error.message)
    }
  }


  /* =========================================================
     6. FORM SAAF KARO
     ========================================================= */

  let resetForm = () => {
    setCustomerName("")
    setPhone("")
    setInstagramUsername("")
    setProductId("")
    setQuantity("")
    setPaymentStatus("unpaid")
    setOrderStatus("pending")
  }


  /* =========================================================
     7. PAGE (JSX)
     ========================================================= */

  return (
    <div className="admin-orders">
      <h1>Admin Orders</h1>

      {/* ---------- FORM: naya order ---------- */}
      <form className="order-form" onSubmit={handleSaveOrder}>
        <h2>New Order</h2>

        <label>Customer Name</label>
        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />

        <label>Phone</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <label>Instagram Username (optional)</label>
        <input type="text" value={instagramUsername} onChange={(e) => setInstagramUsername(e.target.value)} />

        {/* Product ka dropdown - Firestore ke products se */}
        <label>Product</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">-- select product --</option>
          {products.map((product) => {
            return (
              <option value={product.id} key={product.id}>
                {product.name} (Rs. {product.price})
              </option>
            )
          })}
        </select>

        <label>Quantity</label>
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />

        <label>Payment Status</label>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="unpaid">unpaid</option>
          <option value="paid">paid</option>
        </select>

        <label>Order Status</label>
        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="shipped">shipped</option>
          <option value="delivered">delivered</option>
        </select>

        {/* total khud calculate hokar yahan dikhta hai */}
        <p className="order-total">Total: Rs. {orderTotal}</p>

        <button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Order"}
        </button>

        {error ? <p className="error-text">{error}</p> : null}
      </form>

      {/* ---------- LIST: saare orders ---------- */}
      <h2>Orders List</h2>
      {orders.map((order) => {
        return (
          <div className="order-card" key={order.id}>
            <h3>{order.customerName}</h3>
            <p>Phone: {order.phone}</p>
            {/* instagram sirf tab dikhao jab bhari ho */}
            {order.instagramUsername ? <p>Instagram: {order.instagramUsername}</p> : null}
            <p>Product: {order.productName}</p>
            <p>Qty: {order.quantity} | Price: Rs. {order.price} | Total: Rs. {order.total}</p>

            {/* payment status dropdown (badalne pe seedha update) */}
            <label>Payment:</label>
            <select
              value={order.paymentStatus}
              onChange={(e) => handlePaymentUpdate(order.id, e.target.value)}
            >
              <option value="unpaid">unpaid</option>
              <option value="paid">paid</option>
            </select>

            {/* order status dropdown (badalne pe seedha update) */}
            <label>Order:</label>
            <select
              value={order.orderStatus}
              onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
            >
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="shipped">shipped</option>
              <option value="delivered">delivered</option>
            </select>
          </div>
        )
      })}
    </div>
  )
}

export default Orders
