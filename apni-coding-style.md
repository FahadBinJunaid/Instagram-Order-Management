# Meri Coding Style (Notes - apne liye yaad rakhne ke liye)

Yeh file main apne liye bana raha hoon. Isme woh saare patterns hain jo main
apne projects mein use karta hoon. Sources jo check kiye:

- `React_project_Smit` (cards, props)
- `Smit_Blog_App` (CRUD, Input/Button components)
- `Voting_App_Smit` (state, useEffect)
- `Routing-App-Smit` (react-router, pages, API fetch)
- `Firebase_backend` (vanilla JS + Firebase auth/firestore - 3 projects)
- `clothing-store-management` (current project - admin store)
- `Clone_sir_repo/lostandfound` (sir ka repo - sirf dekhne/seekhne ke liye)

Jab bhi clothing-store-management par kaam karun, yeh dekh ke apna hi style
follow karunga.

---

## 1. Rehnay ka basic tareeqa (Beginner logic building)

Har naya feature main aise build karta hoon:

1. Pehle seedha page/`App.jsx` mein kaam karta hoon.
2. Khali dikhne wala hissa banata hoon (JSX).
3. Phir `useState` se data rakhta hoon.
4. Phir button / input pe handler lagata hoon.
5. Phir data ko `map` se screen pe dikhata hoon.
6. Jab cheez repeat hone lage (Input, Button) tabhi usko alag component banata hoon.
7. Aakhir mein CSS likhta hoon - class names jo JSX mein use kiye.

Data shuru mein memory mein rehta hai. Baad mein Firebase / API add karta hoon.

---

## 2. Components ka style

- Function component, declaration style (arrow nahi):
```jsx
function App() {
  return ( ... )
}

export default App
```
- `export default` hamesha file ke neeche.
- Component file ka naam mostly lowercase: `card.jsx`, `button.jsx`, `input.jsx`
  (kabhi PascalCase bhi: `Navbar.jsx`, `Button.jsx`).

### Props do tarah se likhta hoon

Purana style (props object) - Blog/React_project_Smit mein:
```jsx
function Button(props) {
  return <button onClick={props.onClick} className={props.class}>{props.title}</button>
}
```

Naya style (destructuring) - Routing-App mein:
```jsx
function Button({ title, onClick }) {
  return <button className="btn" type="button" onClick={onClick}>{title}</button>
}
```

Layout ke liye `children` pattern (clothing-store mein pehle se):
```jsx
function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div>{children}</div>
    </>
  )
}
```

---

## 3. State ka pattern

```jsx
const [blog, setblog] = useState([])
const [inputname, setinputname] = useState("")
const [currentquestion, setcurrentquestion] = useState("")
```
- Setter ka naam aksar **small letters** mein likhta hoon (`setblog`,
  `setinputname`). Kabhi normal camelCase bhi (`setAuthor`, `setTitle`,
  `setsaveproducts`). Mixed hai - dono chalte hain.
- Initial value jaise data ho: string ke liye `""`, list ke liye `[]`,
  single object ke liye `null` (jaise `saveproduct`).

---

## 4. Handlers ka pattern

```jsx
let addblog = () => {
  if (Btitle == "" || Bdescription == "") {
    return alert("please fill all inputs")
  }

  let obj = { title: Btitle, author: Bauthor }

  blog.push(obj)
  setblog([...blog])
  setTitle("")
}
```
- Handler ke liye `let X = () => {}` (const se zyada `let`).
- Validation: khali field check + seedha `alert(...)` + `return`.
- Object banane ke liye `let obj = { ... }`.

### List update ke 2 tareeqe jo main use karta hoon
Copy karke mutate:
```jsx
let arr = [...blog]
arr[index].Likes = arr[index].Likes + 1
setblog(arr)
```
Ya push karke spread:
```jsx
setvoterlist([...voterlist, obj])
```
Delete ke liye:
```jsx
let arr = [...blog]
arr.splice(index, 1)
setblog(arr)
```

---

## 5. List dikhane ka pattern (map)

```jsx
{blog.map((data, indx) => {
  return (
    <div className="blog-card" key={indx}>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <h3>By: {data.author}</h3>
      <button onClick={() => Likes(indx)}>Likes</button>
    </div>
  )
})}
```
- `map((data, indx) => ...)` aur `key={indx}` (API data ho to `key={products.id}`).
- Inline handler JSX mein: `onClick={() => Likes(indx)}`.
- Button ka text template literal se: `` title={`${data.Likes ? `Likes ${data.Likes}` : "Likes"}`} ``

---

## 6. Data lana (fetch / useEffect)

```jsx
useEffect(() => {
  fetch("https://fakestoreapi.com/products")
    .then((res) => res.json())
    .then((data) => setsaveproducts(data))
}, [])
```
- `.then()` chain se (React projects mein). async/await tab use karta hoon
  jab Firebase jaisi cheez aaye (Firebase_backend projects mein dono kiye hain).
- Fetch ke liye `[]` dependency; kisi cheez pe underline/trigger ke liye `[voterlist]`.
- Single item ke liye URL mein id: `` fetch(`.../products/${id}`) `` + `useParams`.
- Loading ka simple pattern:
```jsx
if (!saveproduct) {
  return <h1 className="page-title">Loading...</h1>;
}
```

---

## 7. Routing ka pattern (current project - react-router-dom v7)

Saare routes `App.jsx` mein (main.jsx mein nahi - clothing-store style):
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public store pages (Layout ke saath) */}
        <Route path="/" element={<Layout><Store /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetails /></Layout>} />

        {/* Admin pages (filhaal alag) */}
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  )
}
```
- Routing-App-Smit mein saare routes `main.jsx` mein the (purana tareeqa) -
  current project mein App.jsx mein rakhta hoon, Navbar ke saath.
- Link ke liye `Link` / `NavLink` (import from `react-router-dom`).
- Active link pe: `className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}`.
- URL se id nikalne ke liye `useParams()`.
- Layout se page ko Navbar wrap karna - `<Layout><Page /></Layout>`.

---

## 8. CSS likhne ka style

- Ek hi badi CSS file (`App.css`), class names JSX wale.
- Naming block-element jaisa: `blog-card`, `vote-item`, `card-buttons`,
  `product-grid`, `product-card`.
- Modern projects mein CSS variables:
```css
:root {
  --primary: #4f46e5;
  --radius: 14px;
  --shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}
```
- Hover pe: `transform: translateY(-5px)` + `box-shadow`.
- Grid: `repeat(auto-fit, minmax(260px, 1fr))`.
- `transition: 0.3s` har jagah.
- Section comments: `/* ===== CARDS ===== */`.
- Purane chhote projects mein simple hex colors + fixed columns
  (`repeat(3, 1fr)`, `repeat(4, 1fr)`).
- Tailwind CSS main khud NAHI likhta (sir ke repo mein hai, apne mein nahi).

---

## 9. Naming rules (components / pages / folders) - ZAROORI

- Naam **easy aur seedhe** rakhta hoon - jo cheez hai wahi naam.
- Page ka naam uske kaam se: home page hai to `Home` (Store naam mat do),
  products page hai to `Products`.
- **Note:** Abhi `Store.jsx` page `Home` hona chahiye tha (yeh baad mein rename
  karna hai - abhi sirf yaad rakhna hai, jaldi se mat badlo).
- Components ke naam bhi simple: `Navbar`, `Layout`, `Card`, `Button`, `Input`.
- Pages ka folder: `src/pages/`, components ka: `src/components/`.
- Admin pages sub-folder mein: `src/pages/admin/` (Dashboard, Orders, etc.).
- File ka naam = component ka naam (jaise `ProductDetails.jsx` = `ProductDetails`).

---

## 10. Firebase ka style (Firebase_backend projects se - important!)

Clothing-store mein Firebase lagega, toh apne purane projects ka pattern:

- Firebase config seedha file mein:
```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "...",
  projectId: "...",
  // ...
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
```
- Import CDN se (vanilla projects mein):
  `import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js"`
  (React project mein `npm install firebase` kar ke `from "firebase/auth"` -
  jaise sir ke repo mein hai.)
- Auth functions:
```js
async function signup() {
  try {
    const userdata = await createUserWithEmailAndPassword(auth, email, password)
    // ...
    alert("user create succesfully")
  } catch (error) {
    let err = error.message
    alert(`error ${err}`)
  }
}
```
- Firestore CRUD:
  - Add: `await addDoc(collection(db, "posts"), { ... })`
  - Ya fixed doc: `await setDoc(doc(db, "users", uid), { ... })`
  - Get: `getDocs(collection(db, "posts"))` → `forEach` → `doc.data()` + `doc.id`
  - Single get: `getDoc(doc(db, "users", uid))` → `.exists()` check
  - Update: `await updateDoc(doc(db, "posts", id), { ... })`
  - Array mein daalna: `arrayUnion(uid)`, nikalna: `arrayRemove(uid)`
- Login state ka pattern (React mein):
```jsx
useEffect(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // logged in - dashboard dikhao
    } else {
      // logged out - login dikhao
    }
  })
}, [])
```
- Button loading state (apna style):
```js
btn.disabled = true
btn.textContent = "posting...."
// ... kaam
btn.disabled = false
btn.textContent = "post"
```
- Toast notification ke liye Toastify use kiya hai (project 2 mein) - chahiye to
  wahi, warna `alert(...)`.
- Users ki list dikhane ke liye `innerHTML += card` (vanilla) - React mein `map`.

---

## 11. Chhoti chhoti aadatein (jo meri hain)

- Semicolons **kahin lagata hoon kahin nahi** (mixed). Zyada tar nahi.
- `==` loose equality use karta hoon, `===` nahi.
- Kabhi file ke shuru mein khali lines chhod deta hoon.
- Unused imports chhod deta hoon (`heroImg`, `reactLogo`, `viteLogo`).
- 2-space indentation.
- `index.css` default Vite wali waise hi rehne deta hoon (Routing walay mein
  custom reset likha tha).
- Comments Roman Urdu/English mix: `{/* Public store pages (Layout ke saath) */}`.

---

## 12. Sir ke repo (lostandfound) se yaad rakhni cheezein

> Yeh SIR ka style hai - apne project mein sab follow NAHI karna. Sirf
> dimagh mein rakhna hai ke industry mein yun bhi hota hai. Apna code
> simple aur beginner-friendly hi rakhna hai.

Sir ke repo mein yeh cheezein thin:

- **Tailwind CSS** - classes seedhe JSX mein (`className="bg-white rounded-2xl..."`).
  Apne project mein apni `App.css` + class names use karta hoon.
- **Firebase npm package** se (`import { auth } from "./utils/firebase"`),
  CDN se nahi. Config alag file `src/utils/firebase.js` mein, aur `auth`, `db`,
  collection refs export karte hain:
```js
export const auth = getAuth(app);
export const db = getFirestore(app);
export const itemsRef = collection(db, "items");
```
- **Custom hook** banaya `useFetch` (data, loading, error, refetch ek saath).
  Apne mein seedha `useEffect` + `fetch` + `.then()` karta hoon.
- **Context API** for theme (`ThemeContext` + `useTheme` hook + dark/light mode).
- **async/await + try/catch/finally** har jagah (mera style bhi Firebase mein
  yahi hai).
- **Handler names**: `handleAddItem`, `handleLogin`, `handleSubmit` (camelCase
  handle*). Mera style: `let addblog = () => {}` - simple.
- **State names normal camelCase**: `setAllItems`, `setLoading`, `setSubmitting`.
- **submitting state** - button disable + "Adding..." text jab tak na ho jaye.
- **Loader component** - size/label/fullPage/inline props se spinner.
- **Layout component** - Navbar + main wrapper, `user` prop pass hota hai.
- **Ternary rendering**: `loading ? <Loader/> : error ? <ErrorUI/> : <List/>`.
- **useMemo** se filter/sort karna (search + status + sort).
- **Optimistic update** comments mein (pehle dikhao, baad mein save).
- **onSnapshot** real-time Firestore listener (comments live update).
- **serverTimestamp()** - createdAt ke liye.
- **Helper functions** same file mein niche: `getInitials`, `formatDate`,
  `DetailRow`, `InfoRow` (chhote components alag nahi, ek file mein).
- **react-hook-form** for forms with validation (sirf signup page mein).
- Form values: `event.target[0].value` (index se) ya naam se.
- Semicolons hamesha, double quotes, PascalCase components (mostly),
  pages lowercase (`items.jsx`, `auth.jsx`) - mixed naming.

**Sir se seekhne wali baatein jo apne project mein bhi aa sakti hain (simple
version):**
1. Firebase config alag file mein (`src/utils/firebase.js`) - apne bhi yahi karenge.
2. Button loading state (disabled + text change) - apne mein hai.
3. Loader dikhana data load hone pe - simple `<h1>Loading...</h1>` se kaam chalega.
4. Layout component - apne mein hai already.
5. `serverTimestamp()` jab Firestore mein date chahiye.

---

## 13. Current project (clothing-store-management) ka haal

- Tech: React 19 + Vite + `react-router-dom` ^7 (installed) + Firebase
  (abhi install nahi).
- Routes `App.jsx` mein already bane: `/` (Store), `/products/:id`,
  `/admin/*` pages.
- Pages sirf placeholder hain (`<h1>Store</h1>` etc.).
- `Navbar.jsx` + `Layout.jsx` bane hain (simple Link wale).
- `memory.md` mein poora project plan hai (Firestore collections, admin
  flow, security rules) - kaam se pehle wahi parhna.
- Next steps (jab kaam karna ho): Firebase install → `utils/firebase.js` →
  products Firestore se → admin login → orders. Rename (`Store` → `Home`)
  bhi tabhi karna hai.
