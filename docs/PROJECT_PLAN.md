# PROJECT PLAN — Clothing Store + Admin Order Management

> Yeh file assignment ka plan hai. **Sirf planning** — abhi koi code, package ya
> feature nahi banaya gaya.
>
> **Assignment brief (asli situation):** Instagram pe clothes bechte hain, orders
> DMs mein aate hain, paid/unpaid track karna mushkil hai. Website chahiye + orders
> manage karne ka system (Firebase). Customers ko stock **sirf tab** dikhana hai jab
> admin chahe (`showStock` setting ON ho).

---

## 1. Technology (kya kya use honge)

| Cheez | Kyun / Haal |
|---|---|
| React 19 + Vite | Project pehle se bana hua hai (`package.json` mein maujood) |
| React Router (`react-router-dom` v7) | Pehle se installed hai — routes ke liye |
| Firebase Authentication | Sirf **admin login** ke liye (customer ka koi signup nahi) |
| Cloud Firestore | products, orders, settings ka data |
| Images | **Recommendation: Firebase Storage** |

**Images ka simple tareqa:** Firebase Storage recommend karta hoon — kyunki
Firebase waise hi use ho raha hai, alag account manage karne ki zaroorat nahi
(Cloudinary free aur acha hai, lekin uske liye alag account + alag SDK). Pehle
version mein sabse simple: admin image ka **URL input** mein daale, baad mein
Storage upload bhi add kar sakte hain. (Confirm karna hai — Section 11.)

---

## 2. Public website routes (koi login nahi)

| Route | File (pehle se maujood) | Kaam |
|---|---|---|
| `/` | `src/pages/Store.jsx` | Home — clothing products ki list (image, name, price, aur stock — stock sirf jab `showStock` ON ho) |
| `/products/:id` | `src/pages/ProductDetails.jsx` | Ek product ki detail jab customer click kare |

- Dono pages pe **public Navbar** (`src/components/Navbar.jsx`) — pehle se
  `Layout.jsx` ke andar wrap hai, isliye dono pages pe khud aa jata hai.
- Navbar mein chhota **admin/key icon** daalna hai jo `/admin/login` pe le jaye
  (abhi "Admin Login" ka text link hai — usko icon banayenge).

Is version mein customer ka **login / signup / cart / checkout / payment NAHI** hai.

---

## 3. Admin routes (routes pehle se `App.jsx` mein bane hain)

| Route | File | Kaam |
|---|---|---|
| `/admin/login` | `src/pages/admin/AdminLogin.jsx` | Admin login. Account **Firebase Console** mein manually banega — **signup page nahi** |
| `/admin` | `src/pages/admin/Dashboard.jsx` | Chhota overview (kitne orders, pending, products) |
| `/admin/orders` | `src/pages/admin/Orders.jsx` | Orders ki list **+ isi page pe naya order** (same page) |
| `/admin/products` | `src/pages/admin/Products.jsx` | Products ki list **+ add + edit** (same page) |
| `/admin/settings` | `src/pages/admin/Settings.jsx` | Stock visibility ON/OFF toggle |

- Alag routes jaise `/admin/orders/new` ya `/admin/products/new` **nahi**
  chahiye — assignment kehta hai view aur add/edit **same page** pe.
- Admin pages **protected** honge: login nahi to `/admin/login` pe bhej do
  (`onAuthStateChanged` se check).

---

## 4. Product management

Ek product Firestore mein aise store hoga:

- `name` — e.g. "Blue Kurti"
- `description` — chhoti si detail
- `price` — number (PKR)
- `image` — image URL (Storage link ya direct URL)
- `stock` — number (kitne mojood hain)

**Active/Inactive functionality NAHI** — assignment mein nahi chahiye.

---

## 5. Order management

Admin Instagram/WhatsApp se aaya order **khud enter** karta hai:

- `customerName`
- `phone`
- `instagramUsername` — **optional** (khaali bhi chalega)
- **Product selection** — Firestore ke products se dropdown
- `quantity` — admin likhta hai
- `total` — **khud calculate** hoga: `price × quantity`
- `paymentStatus` — `"paid"` ya `"unpaid"`
- `orderStatus` — `"pending"`, `"confirmed"`, `"shipped"`, `"delivered"`
- `createdAt` — `serverTimestamp()`

**Zaroori:** payment status aur order status **alag-alag** hain (assignment mein
aisa hi likha hai). Misal: order **delivered** ho chuka hai lekin abhi bhi
**unpaid** hai — yeh do alag fields se pata chalta hai.

---

## 6. Stock visibility (simple, practical tareeqa)

`settings/store` (ek hi document) mein ek field:
```
showStock: false
```

- **ON (`true`):** public pages pe **exact quantity** dikhe — e.g. `5 in stock` /
  `1 left`.
- **OFF (`false`):** stock ki **koi maloomat hi na dikhe** — na "In stock", na
  "Out of stock", na koi quantity. Stock wala hissa bilkul **chhupa** rahe.

**Kaam kaise karega (simple):**
1. Public pages (`Store`, `ProductDetails`) load hote waqt `settings/store` ka doc
   ek baar parh lein (`getDoc`).
2. `showStock` ki value dekh kar:
   - `true` → exact quantity dikhayein.
   - `false` → stock ka koi text na dikhayein (bilkul hide).
3. Admin `Settings` page pe sirf **ek toggle** ho — label
   **`Show stock on website`**. Toggle dabane pe `setDoc(..., { merge: true })`
   se Firestore update ho. Agar `settings/store` doc pehle se maujood na ho to
   `merge: true` ki wajah se wo **khud ban jata hai** — Console mein manually
   banane ki zaroorat nahi.
4. Live update baad mein `onSnapshot` se ho sakta hai — is version mein zaroorat
   nahi, page refresh pe naya setting aa jayega.

---

## 7. Firestore planning (collections + example documents)

### `products` — har document = ek product
```js
{
  name: "Blue Kurti",
  description: "Cotton kurti, medium size",
  price: 2500,
  image: "https://...jpg",
  stock: 12,
  createdAt: <serverTimestamp>
}
```

### `orders` — har document = ek order
```js
{
  customerName: "Ali Khan",
  phone: "0300-1234567",
  instagramUsername: "ali.styles",   // optional, "" bhi theek
  productId: "abc123",               // products doc ki id
  productName: "Blue Kurti",         // list mein dikhane ke liye
  price: 2500,
  quantity: 2,
  total: 5000,                        // price × quantity
  paymentStatus: "unpaid",            // "paid" | "unpaid"
  orderStatus: "pending",             // "pending" | "confirmed" | "shipped" | "delivered"
  createdAt: <serverTimestamp>
}
```

### `settings/store` — ek hi document (store ki setting)
```js
{
  showStock: false
}
```

### `users` — abhi ZAROORAT NAHI
Sirf ek admin hai jo Firebase Console mein manually banega, isliye role check ki
zaroorat nahi. Sirf tab banayein jab aage multiple admins aayein.
```js
// users/{uid} — future ke liye (abhi nahi banayenge)
{ uid: "...", role: "admin" }
```

**Security rules (sirf ek line, lambi discussion nahi):**
`products` sab parh sakte hain, write sirf admin. `settings/store` bhi **sab parh
sakte hain** — kyunki public pages ko `showStock` parhna hota hai — magar update
(write) sirf **authenticated admin** kar sakta hai. `orders` sirf admin.

---

## 8. File structure — kya reuse hoga, kya banega

### Pehle se maujood — REUSE (koi naya route nahi chahiye)
```
src/App.jsx                      -> routes pehle se assignment ke hisaab se hain (reuse)
src/main.jsx                     -> jaise hai waise hi (reuse)
src/components/Navbar.jsx        -> reuse + chhota admin/key icon add hoga
src/components/Layout.jsx        -> reuse (Navbar + children wrapper)
src/pages/Store.jsx              -> reuse (home page, products list)
src/pages/ProductDetails.jsx     -> reuse (product detail)
src/pages/admin/AdminLogin.jsx   -> reuse (admin login)
src/pages/admin/Dashboard.jsx    -> reuse (overview)
src/pages/admin/Orders.jsx       -> reuse (orders list + new order form)
src/pages/admin/Products.jsx     -> reuse (products list + add/edit)
src/pages/admin/Settings.jsx     -> reuse (stock visibility toggle)
src/App.css                      -> reuse (apni block-element class naming style)
src/index.css                    -> reuse (waise hi)
```

### Nayi files (implementation ke waqt banengi — abhi nahi)
```
.env.local                      -> Firebase keys (git mein ignore hota hai — neeche note)
src/utils/firebase.js           -> Firebase init + auth/db export karega
src/components/AdminLayout.jsx  -> admin pages ka shared navbar (Dashboard/Orders/Products/Settings links)
```

### Optional (sirf jab zaroorat mehsoos ho)
```
src/components/ProductCard.jsx  -> agar Store page ka card code dobara repeat ho
```

### Bilkul NAHI banane (assignment ke bahar)
signup page, customer account, cart, checkout, online payment,
`/admin/orders/new` aur `/admin/products/new` routes, Redux/Context (zaroorat nahi),
custom hooks (is version mein nahi).

---

## 9. Firebase setup (basic — koi credential yahan nahi)

1. [console.firebase.google.com](https://console.firebase.google.com) → naya project → **Web app** register karein.
2. **Authentication** → Sign-in method → **Email/Password** enable (sirf admin login).
3. **Firestore Database** banayein (production mode).
4. Console mein hi **admin account** banayein (Authentication → Users → Add user).
5. Implementation ke waqt package install: `npm install firebase` *(abhi nahi)*.
6. `.env.local` file (root mein) — **abhi nahi banani, implementation mein**:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
- Har naam ke aage **`VITE_`** zaroori hai — Vite sirf aisi keys browser tak pahunchata hai.
- `.env.local` use karenge (`.gitignore` mein `*.local` pehle se hai, isliye ye git
  mein commit **nahi** hoga). `.env` likh dein to wo ignore nahi hota — isliye
  `.env.local` behtar hai.
7. `src/utils/firebase.js` mein: `initializeApp({...import.meta.env se values})` →
   `auth` aur `db` export.

**Is document mein koi asli key/credential nahi likhi gayi.**

---

## 10. Implementation roadmap (step by step)

| Step | Kaam | Faida |
|---|---|---|
| 1 | Firebase project + `.env.local` + `src/utils/firebase.js` | React app Firebase se juda |
| 2 | `products` collection (console mein 2-3 products daalein) + `Store.jsx` mein list | Public home page pe products Firestore se aayein |
| 3 | `ProductDetails.jsx` (`useParams` + single product) | Customer product click kare to detail khule |
| 4 | Navbar + Layout polish (admin/key icon) | Public navbar assignment ke mutabiq |
| 5 | `AdminLogin.jsx` (Firebase login + `onAuthStateChanged`) | Sirf admin login kar sake |
| 6 | Admin routes protect (login na ho to `/admin/login`) | Admin pages sirf admin ke liye |
| 7 | `Products.jsx` admin — list + add + edit (same page) | Admin products manage kare |
| 8 | `Settings.jsx` — `showStock` toggle (sirf ek checkbox) | Stock visibility wali setting |
| 9 | Public side stock logic — ON par exact quantity, OFF par stock bilkul chhupa | Requirement 6 poora |
| 10 | `Orders.jsx` — form (product dropdown + auto total) + list + status | Order management poora |
| 11 | `Dashboard.jsx` — chhota summary (orders/pending/products) | Overview |
| 12 | CSS (`App.css`) + final testing | Sab kuch saaf aur ready |

Har step ke baad `npm run dev` chala ke check karna.

---

## 11. Decisions jo confirm karne hain

1. **`Store.jsx` ka naam `Home.jsx`?** — Pehle tay hua tha ke home page ka naam
   simple `Home` ho (page jaisa hai waisa naam). Abhi rename nahi hua. Karna hai ya
   `Store` hi rehne dein?
2. **Currency PKR?** — Prices "Rs. 2500" style mein dikhayein?
3. **Images ka tareeqa?** — Recommendation: Firebase Storage. Ya pehle version mein
   sirf URL input field (admin image ka URL paste kare)? Yeh sabse simple hai.
4. **`users` collection** — plan ke mutabiq abhi nahi banayenge (sirf ek admin).
   Theek hai?
