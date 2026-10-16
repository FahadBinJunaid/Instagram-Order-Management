/*
  ADMIN DASHBOARD (Analytics)

  Big website jaisa analytics dashboard:
  1) Stat cards   -> orders, revenue, pending, unpaid, products, stock
  2) Charts (Recharts) -> revenue trend, orders trend, payment donut,
                          order status, top products
  3) Low stock alert

  Saara data Firestore ke orders + products se hi banta hai.
*/

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../utils/firebase"

// charts ke liye (Recharts)
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts"

// chart colors ki list (ek hi jagah define, taake har chart match kare)
const COLORS = ["#6d28d9", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444"]
const CHART_TEXT = "#8b8fa3"
const GRID_COLOR = "rgba(128,128,128,0.18)"
const LOW_STOCK_LIMIT = 5


function Dashboard() {

  // Firestore se aaye orders aur products
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  // Error message
  const [error, setError] = useState("")


  /* =========================================================
     1. PAGE KHULNE PAR -> orders + products le aao
     ========================================================= */

  useEffect(() => {

    let loadData = async () => {
      try {
        const ordersSnapshot = await getDocs(collection(db, "orders"))
        let ordersList = []
        ordersSnapshot.forEach((orderDoc) => {
          ordersList.push({ id: orderDoc.id, ...orderDoc.data() })
        })
        setOrders(ordersList)

        const productsSnapshot = await getDocs(collection(db, "products"))
        let productsList = []
        productsSnapshot.forEach((productDoc) => {
          productsList.push({ id: productDoc.id, ...productDoc.data() })
        })
        setProducts(productsList)

      } catch (error) {
        setError(error.message)
      }
    }

    loadData()

  }, [])


  /* =========================================================
     2. ANALYTICS (poora data orders + products se calculate)
     ========================================================= */

  // --- GINTI (counts) ---
  let totalOrders = orders.length
  let pendingOrders = orders.filter((singleOrder) => singleOrder.orderStatus == "pending").length
  let paidOrders = orders.filter((singleOrder) => singleOrder.paymentStatus == "paid").length
  let unpaidOrders = orders.filter((singleOrder) => singleOrder.paymentStatus == "unpaid").length
  let totalProducts = products.length

  // --- REVENUE (sirf PAID orders ka total) ---
  let totalRevenue = orders
    .filter((singleOrder) => singleOrder.paymentStatus == "paid")
    .reduce((sum, singleOrder) => sum + (singleOrder.total || 0), 0)

  let totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0)

  let lowStockProducts = products.filter((product) => (product.stock || 0) <= LOW_STOCK_LIMIT)


  /* ---- Pichle 7 din: har din ka revenue aur orders ---- */
  let buildDailyData = (ordersList) => {
    let today = new Date()
    let list = []

    // 7 slots: 6 din pehle se le kar AAJ tak
    for (let i = 6; i >= 0; i--) {
      let dayStart = new Date(today)
      dayStart.setDate(today.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)

      let dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      let label = dayStart.toLocaleDateString(undefined, { weekday: "short" })

      // us din ke saare orders
      let dayOrders = ordersList.filter((singleOrder) => {
        if (!singleOrder.createdAt) return false          // abhi save hua ho to time na ho
        let orderTime = singleOrder.createdAt.toDate()
        return orderTime >= dayStart && orderTime <= dayEnd
      })

      let dayRevenue = dayOrders.reduce((sum, singleOrder) => sum + (singleOrder.total || 0), 0)

      list.push({
        name: label,
        revenue: dayRevenue,
        orders: dayOrders.length,
      })
    }

    return list
  }

  let dailyData = buildDailyData(orders)


  /* ---- Payment status (donut) ---- */
  let paymentData = [
    { name: "Paid", value: paidOrders },
    { name: "Unpaid", value: unpaidOrders },
  ].filter((singleRow) => singleRow.value > 0)   // jiska 0 hai wo mat dikhao


  /* ---- Order status breakdown (bar) ---- */
  let orderStatusData = [
    { name: "Pending", value: orders.filter((singleOrder) => singleOrder.orderStatus == "pending").length },
    { name: "Confirmed", value: orders.filter((singleOrder) => singleOrder.orderStatus == "confirmed").length },
    { name: "Shipped", value: orders.filter((singleOrder) => singleOrder.orderStatus == "shipped").length },
    { name: "Delivered", value: orders.filter((singleOrder) => singleOrder.orderStatus == "delivered").length },
  ].filter((singleRow) => singleRow.value > 0)


  /* ---- Top products (revenue ke hisaab se) ---- */
  let buildTopProducts = (ordersList) => {
    let revenueMap = {}

    ordersList.forEach((singleOrder) => {
      let key = singleOrder.productName || "Unknown"
      revenueMap[key] = (revenueMap[key] || 0) + (singleOrder.total || 0)
    })

    let list = Object.keys(revenueMap).map((name) => {
      return { name: name, revenue: revenueMap[name] }
    })

    list.sort((a, b) => b.revenue - a.revenue)   // sabse zyada revenue wale upar
    return list.slice(0, 5)                       // sirf top 5
  }

  let topProducts = buildTopProducts(orders)


  /* =========================================================
     3. PAGE (JSX)
     ========================================================= */

  return (
    <div className="dashboard">

      <div className="page-head">
        <h1>Dashboard</h1>
        <p className="page-sub">Store ki performance ka summary</p>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {/* ---------- STAT CARDS ---------- */}
      <div className="stats-grid">

        <div className="stat-card">
          <span className="stat-icon purple">▤</span>
          <div>
            <p className="stat-label">Total Orders</p>
            <h2 className="stat-value">{totalOrders}</h2>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon green">₨</span>
          <div>
            <p className="stat-label">Revenue (Paid)</p>
            <h2 className="stat-value">Rs. {totalRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon amber">◷</span>
          <div>
            <p className="stat-label">Pending Orders</p>
            <h2 className="stat-value">{pendingOrders}</h2>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon red">✕</span>
          <div>
            <p className="stat-label">Unpaid Orders</p>
            <h2 className="stat-value">{unpaidOrders}</h2>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon blue">▣</span>
          <div>
            <p className="stat-label">Products</p>
            <h2 className="stat-value">{totalProducts}</h2>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon teal">≡</span>
          <div>
            <p className="stat-label">Total Stock</p>
            <h2 className="stat-value">{totalStock}</h2>
          </div>
        </div>

      </div>


      {/* ---------- CHARTS ---------- */}
      <div className="charts-grid">

        {/* Revenue trend - pichle 7 din */}
        <div className="chart-card wide">
          <h2 className="chart-title">Revenue - Last 7 days</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} />
              <XAxis dataKey="name" stroke={CHART_TEXT} fontSize={12} tickLine={false} />
              <YAxis stroke={CHART_TEXT} fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }} />
              <Area type="monotone" dataKey="revenue" name="Revenue (Rs.)" stroke={COLORS[0]} strokeWidth={2.5} fill="url(#revenueFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders trend - pichle 7 din */}
        <div className="chart-card">
          <h2 className="chart-title">Orders - Last 7 days</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="name" stroke={CHART_TEXT} fontSize={12} tickLine={false} />
              <YAxis stroke={CHART_TEXT} fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }} />
              <Bar dataKey="orders" name="Orders" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment status donut */}
        <div className="chart-card">
          <h2 className="chart-title">Payment Status</h2>
          {paymentData.length == 0 ? (
            <p className="empty-text">Abhi koi order nahi hai.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={paymentData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {paymentData.map((singleRow, index) => (
                    <Cell key={singleRow.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order status bar */}
        <div className="chart-card">
          <h2 className="chart-title">Order Status</h2>
          {orderStatusData.length == 0 ? (
            <p className="empty-text">Abhi koi order nahi hai.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={orderStatusData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="name" stroke={CHART_TEXT} fontSize={12} tickLine={false} />
                <YAxis stroke={CHART_TEXT} fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }} />
                <Bar dataKey="value" name="Orders" fill={COLORS[2]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products by revenue */}
        <div className="chart-card wide">
          <h2 className="chart-title">Top Products (by Revenue)</h2>
          {topProducts.length == 0 ? (
            <p className="empty-text">Abhi koi order nahi hai.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={GRID_COLOR} horizontal={false} />
                <XAxis type="number" stroke={CHART_TEXT} fontSize={12} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke={CHART_TEXT} fontSize={12} width={130} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }} />
                <Bar dataKey="revenue" name="Revenue (Rs.)" fill={COLORS[3]} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>


      {/* ---------- LOW STOCK ALERT ---------- */}
      <div className="chart-card">
        <h2 className="chart-title">Low Stock Alert (≤ {LOW_STOCK_LIMIT})</h2>

        {lowStockProducts.length == 0 ? (
          <p className="empty-text">Sab products ki stock theek hai ✅</p>
        ) : (
          <div className="low-stock-list">
            {lowStockProducts.map((product) => {
              return (
                <div className="low-stock-item" key={product.id}>
                  <span className="low-stock-name">{product.name}</span>
                  <span className="low-stock-badge">{product.stock} left</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

export default Dashboard
