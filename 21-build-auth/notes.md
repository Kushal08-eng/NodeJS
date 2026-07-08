# Stateful Authentication — Notes (Short URL Project)

## 1. Stateful vs Stateless — Basic Samajh

**Stateful Auth:**
- Server ke paas ek "state" (memory/DB) hoti hai jo track karti hai ki kaun kaun logged in hai.
- Server khud yaad rakhta hai — session ID ko user data se map karke.
- Example: Session-based auth (jo humne implement kiya hai).

**Stateless Auth:**
- Server kuch bhi store nahi karta. Har request apne aap mein complete proof leke aati hai ki user valid hai.
- Example: JWT (JSON Web Token) — token khud mein saari info encode karke rakhta hai, server ko sirf verify karna hota hai.

**Key Difference (ek line mein):**
> Stateful = Server yaad rakhta hai. Stateless = Client apne saath proof carry karta hai.

---

## 2. Humare Project Mein Kya Use Hua Hai

Tumne **Stateful (Session-based) Authentication** implement kiya hai, using:
- `cookie-parser` → cookies read/set karne ke liye
- `uuid` → unique session ID generate karne ke liye
- In-memory `Map` (`service/auth.js`) → session ID ko user se map karne ke liye (production mein isko Redis/DB se replace karte hain)

---

## 3. Poora Workflow — Step by Step

### Step 1: User Signup karta hai
**File: `controllers/user.js` → `handleUserSignup`**

```js
async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;
    await User.create({ name, email, password });
    return res.redirect("/");
}
```

- Form se `name`, `email`, `password` aata hai (`express.urlencoded` middleware ki wajah se `req.body` mein parse hota hai)
- `User.create()` se naya document DB mein save hota hai
- **Note:** Abhi password plain text mein store ho raha hai — production mein `bcrypt` se hash karna zaroori hai (yeh next learning step ho sakta hai)

---

### Step 2: User Login karta hai — Yahan Asli Session Banta Hai
**File: `controllers/user.js` → `handleUserLogin`**

```js
async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user)
        return res.render("login", { error: "Invalid username or password" });

    const sessionId = uuidv4();
    setUser(sessionId, user);
    res.cookie("uid", sessionId);
    return res.redirect("/");
}
```

**Yahan 4 important cheezein ho rahi hain:**

1. **DB check** — email/password match karke user dhoondha jaata hai
2. **`uuidv4()`** — ek random unique ID generate hoti hai (session ID). Ye kisi bhi tarah se predictable nahi honi chahiye
3. **`setUser(sessionId, user)`** — is line mein *state* create ho rahi hai. Server ki memory (Map) mein `sessionId → user` ka mapping store hota hai
4. **`res.cookie("uid", sessionId)`** — ye session ID browser ko cookie ke form mein bhej di jaati hai. Ab browser har future request mein ye cookie automatically bhejega

**Yahi asli "stateful" part hai** — server (Map ke through) yaad rakh raha hai ki `sessionId = xyz` matlab `user = Kushal`.

---

### Step 3: Session Storage — `service/auth.js`

```js
const sessionIdToUserMap = new Map();

function setUser(id, user) {
    sessionIdToUserMap.set(id, user);
}

function getUser(id) {
    return sessionIdToUserMap.get(id);
}
```

- Ye ek simple **in-memory key-value store** hai
- `sessionId` → key, `user object` → value
- Jab bhi server restart hoga, ye Map khali ho jayega (isliye sab log automatically logout ho jaayenge) — production mein isliye Redis ya DB-backed session store use karte hain

---

### Step 4: Har Request Pe Cookie Automatically Jaati Hai

Login ke baad, browser ne `uid` cookie save kar li hai. Ab jab bhi user koi bhi request bhejta hai (`/`, `/url`, etc.), **browser automatically wo cookie attach karke bhejta hai** — tumhe manually kuch nahi karna padta.

Server side pe `cookie-parser` middleware is cookie ko parse karke `req.cookies` mein daal deta hai:

```js
app.use(cookieParser());
```

---

### Step 5: Middleware Jo Check Karta Hai — `middleware/auth.js`

Do middlewares banaye gaye hain, do alag purpose ke liye:

#### a) `restrictToLoggedinUserOnly` — Sirf logged-in users allowed
```js
async function restrictToLoggedinUserOnly(req, res, next) {
    const userid = req.cookies.uid;
    if (!userid) return res.redirect("/login");

    const user = getUser(userid);
    if (!user) return res.redirect("/login");

    req.user = user;
    next();
}
```
- Cookie nahi mili → seedha `/login` bhej do
- Cookie mili but Map mein wo session exist nahi karta (invalid/expired) → phir bhi `/login`
- Sab sahi hai to `req.user` mein user daal do aur `next()` bula do (agla middleware/controller chalega)

**Kahan use ho raha hai:**
```js
app.use("/url", restrictToLoggedinUserOnly, router);
```
Matlab `/url` route pe jaane ke liye login zaroori hai — bina login `/url` access hi nahi ho sakta.

#### b) `checkAuth` — Login optional, bas pata chale user hai ya nahi
```js
async function checkAuth(req, res, next) {
    const userid = req.cookies.uid;
    const user = getUser(userid);
    req.user = user; // undefined bhi ho sakta hai, koi redirect nahi
    next();
}
```
- Ye kabhi redirect nahi karta — bas `req.user` set kar deta hai (ya `undefined` chhod deta hai)
- Isse aage wale route decide kar sakte hain ki logged-in user ke liye kya dikhana hai aur guest ke liye kya

**Kahan use ho raha hai:**
```js
app.use("/", checkAuth, staticRoute);
```

---

### Step 6: `req.user` Ka Use — Static Router
**File: `routes/staticRouter.js`**

```js
router.get('/', async (req, res) => {
    if (!req.user) return res.redirect("/login");
    const allurls = await URL.find({ createdBy: req.user._id });
    return res.render('home', { urls: allurls });
});
```

- `checkAuth` middleware ne pehle hi `req.user` set kar diya tha
- Agar `req.user` nahi hai → login page pe bhej do
- Agar hai → sirf usi user ke URLs dikhao (`createdBy: req.user._id` filter se)

---

### Step 7: URL Creation Mein Bhi `req.user` Use Ho Raha Hai
**File: `controllers/url.js`**

```js
await URL.create({
    shortId: shortId,
    redirectURL: body.url,
    visitHistory: [],
    createdBy: req.user._id,   // <-- yahan
});
```

- Kyunki `restrictToLoggedinUserOnly` middleware ne already guarantee kar diya tha ki `req.user` exist karta hai (nahi to redirect ho jaata), yahan safely `req.user._id` use kar sakte hain

---

## 4. Poora Flow — Ek Diagram Ki Tarah Samjho

```
1. User /signup pe form fill karta hai
        ↓
2. handleUserSignup → User.create() → DB mein save
        ↓
3. User /login pe email+password submit karta hai
        ↓
4. handleUserLogin → DB match → uuidv4() se sessionId banta hai
        ↓
5. setUser(sessionId, user) → server ki Map mein store
        ↓
6. res.cookie("uid", sessionId) → browser ko cookie milti hai
        ↓
7. Ab har request pe browser cookie bhejta hai automatically
        ↓
8. cookieParser middleware → req.cookies.uid mein cookie parse hoti hai
        ↓
9. restrictToLoggedinUserOnly / checkAuth middleware → getUser(sessionId) se
   Map mein lookup karke user nikalta hai → req.user set karta hai
        ↓
10. Controller/Router → req.user use karke logic decide karta hai
```

---

## 5. Important Points / Viva-Ready One-Liners

- **Stateful auth mein server memory/DB mein session store karta hai**; stateless mein token khud proof carry karta hai (JWT jaisa).
- **Cookie sirf ek "session ID carrier" hai** — actual user data server ki Map/DB mein hota hai, cookie mein nahi.
- **`uuidv4()`** random aur unpredictable ID banata hai — security ke liye zaroori (agar ID guess ho sakti to koi bhi kisi ka session hijack kar sakta tha).
- **In-memory `Map` ek limitation hai** — server restart hote hi sab sessions gayab. Real projects mein Redis ya MongoDB session store use hota hai (`connect-mongo`, `connect-redis` jaise packages).
- **Do middlewares ka alag role samajhna important hai:**
  - `restrictToLoggedinUserOnly` = **hard gate** (login zaroori, warna redirect)
  - `checkAuth` = **soft check** (login ho ya na ho, bas pata chalta hai)
- **Password abhi plain text mein store ho raha hai** — agla improvement: `bcrypt.hash()` se hashing karna login/signup dono jagah.

---

## 6. Agla Improvement Steps (Future Learning)

1. Password hashing with `bcrypt`
2. Session expiry (cookie ke `maxAge` set karna)
3. Logout route (Map se session delete karna + cookie clear karna)
4. Persistent session store (Redis/Mongo) instead of in-memory Map
5. JWT-based stateless auth se compare karke dono ke trade-offs samajhna