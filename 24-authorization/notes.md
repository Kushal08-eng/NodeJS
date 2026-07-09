# Authorization in Node.js — Notes (Roles + Ownership)

## 1. Recap — Authentication vs Authorization

- **Authentication** = "Tum kaun ho?" (identity verify karna — login, token check)
- **Authorization** = "Tumhe kya karne ki permission hai?" (role/ownership check)

Yeh notes **Authorization** pe focus karte hain — tumhare `restrictTo()` aur `createdBy` wale code se.

---

## 2. Role-Based Authorization — `role` Field

### `models/user.js`
```javascript
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
        type: String,
        required: true,
        default: "NORMAL",
    },
    password: { type: String, required: true },
}, {timestamps: true});
```

**Simple words:** har user ke paas ab ek **`role`** field hai — batata hai woh **kaunsi category** ka user hai. Default `"NORMAL"` hai — matlab jab tak explicitly kuch aur na diya jaaye, naya user **normal user** maana jaayega.

**Lame analogy:** yeh ek **membership card ka type** hai — "Silver Member" (NORMAL) ya "Gold Member" (ADMIN). Card sabko milta hai, lekin type ke hisaab se **alag privileges** milte hain.

---

## 3. Token Mein Role Bhi Daalna

```javascript
// service/auth.js
function setUser(user) {
    return jwt.sign({
        _id: user._id,
        email: user.email,
        role: user.role,   // ← role bhi token ke payload mein daala
    }, secret);
}
```

**Simple words:** yeh important step hai — jab login hota hai, JWT token ke **payload mein `role` bhi save** kar diya jaata hai. Isse har request pe, token verify karte hi **role bhi turant mil jaata hai** — dobara database check karne ki zaroorat nahi.

**Lame analogy:** membership card pe hi "Gold" ya "Silver" print ho gaya — counter pe dobara register check nahi karna padta, card dekhते hi pata chal jaata hai.

---

## 4. `restrictTo()` — Role-Based Access Control (RBAC)

```javascript
// middleware/auth.js
function restrictTo(roles = []) {
    return function (req, res, next) {
        if(!req.user) return res.redirect("/login");

        if(!roles.includes(req.user.role)) return res.end("UnAuthorized");

        return next();
    }
}
```

**Simple words, step by step:**

1. `restrictTo(roles = [])` — yeh ek **function jo function return karta hai** (higher-order function). `roles` ek **array** leta hai — jo roles **allowed** hain us route ke liye.

2. **Step 1 check — Authentication:**
   ```javascript
   if(!req.user) return res.redirect("/login");
   ```
   Pehle dekha ki user **login hai bhi ya nahi** — agar `req.user` hi `null` hai (matlab `checkForAuthentication` ne koi user nahi milaya), toh seedha login page pe bhej do. **Yeh authentication check hai.**

3. **Step 2 check — Authorization:**
   ```javascript
   if(!roles.includes(req.user.role)) return res.end("UnAuthorized");
   ```
   Ab yeh check karta hai — user **login toh hai**, lekin uska `role` un allowed roles ki list mein hai ya nahi. Agar nahi hai, **"UnAuthorized"** bolke rok deta hai. **Yeh asli Authorization hai.**

4. Sab sahi hai toh `next()` — route tak jaane do.

### Use Kaise Hota Hai
```javascript
// index.js
app.use("/url", restrictTo(["NORMAL", "ADMIN"]), router);
```
```javascript
// staticRouter.js
router.get("/admin/urls", restrictTo(["ADMIN"]), async (req, res) => { ... });
router.get('/', restrictTo(["NORMAL", "ADMIN"]), async (req, res) => { ... });
```

**Simple words:**
- `/url` routes → dono `NORMAL` aur `ADMIN` access kar sakte hain (URL banana sabko allowed hai)
- `/admin/urls` → **sirf `ADMIN`** access kar sakta hai (poore system ke saare URLs dekhna — sirf admin ka kaam)
- `/` (home) → `NORMAL` aur `ADMIN` dono, lekin **alag data dikhega** (aage dekhते hain kaise)

**Lame analogy:** `restrictTo(["ADMIN"])` ek **VIP lounge ka darwaza** hai jahan sirf **gold membership** wale andar ja sakte hain — silver wale wahi bahar general area mein rukenge (`"UnAuthorized"`).

---

## 5. Ownership-Based Authorization — `createdBy` Field

Sirf **role** check karna kaafi nahi hota — real apps mein yeh bhi zaroori hota hai ki **user sirf apna hi data access kare**, doosre ka nahi.

### `models/url.js`
```javascript
const urlSchema = new mongoose.Schema({
    shortId: { type: String, required: true, unique: true },
    redirectURL: { type: String, required: true },
    visitHistory: [{timestamp : { type: Number }}],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }
}, { timestamps: true });
```

**Simple words:** `createdBy` field batata hai — yeh URL **kis user ne banaya tha**. `mongoose.Schema.Types.ObjectId` matlab isme **kisi User document ka `_id`** store hoga — aur `ref: "users"` batata hai ki yeh ID **users collection ko refer** karti hai (ek tarike ka "link" doosri collection ki taraf).

**Lame analogy:** yeh diary ke har page pe likha hua **"Likha gaya by: Kushal"** jaisa hai — batata hai yeh entry kiski hai.

### URL Banate Waqt `createdBy` Save Karna
```javascript
// controllers/url.js
async function handleGenerateNewShortURL(req, res) {
    const body = req.body;
    if(!body.url) return res.status(400).json({error : 'url is required'});
    const shortId = shortid();
    await URL.create({
        shortId: shortId,
        redirectURL: body.url,
        visitHistory: [],
        createdBy: req.user._id,   // ← logged-in user ki ID save ki
    });
    return res.render("home", { id: shortId });
}
```

**Simple words:** naya URL banate waqt, `req.user._id` (jo authentication middleware ne pehle set kiya tha) use karke **batate hain yeh URL kisne banaya**. Isse aage jaake filter kar sakte hain.

### Sirf Apna Data Dikhana
```javascript
// staticRouter.js
router.get('/', restrictTo(["NORMAL", "ADMIN"]), async (req, res) => {
    const allurls = await URL.find({ createdBy: req.user._id });   // ← sirf apne URLs
    return res.render('home', { urls: allurls });
});
```

**Simple words:** yeh **query mein filter laga diya** — `{ createdBy: req.user._id }` matlab sirf **wahi URLs** laao jo **current logged-in user ne banaye hain**, kisi aur ke URLs nahi.

Compare karo Admin route se:
```javascript
router.get("/admin/urls", restrictTo(["ADMIN"]), async (req, res) => {
    const allurls = await URL.find({});   // ← koi filter nahi, SAARE URLs
    return res.render('home', { urls: allurls });
});
```
**Simple words:** Admin route mein **`{}` — koi filter nahi** — matlab admin **sabke URLs** dekh sakta hai, kisi ek user tak limited nahi.

**Yehi hai Authorization ka asli matlab:**
- Role check → *"tum ADMIN ho ya NORMAL?"*
- Ownership check → *"yeh data tumhara hai ya kisi aur ka?"*

**Lame analogy:** ek **library** mein — NORMAL member sirf **apni issued books ki list** dekh sakta hai. ADMIN (librarian) **poore library ka record** dekh sakta hai, sabke books.

---

## 6. Poora Middleware Chain — Order Se Samjho

```javascript
app.use(checkForAuthentication);   // Step 1: pehchano user kaun hai (ya guest hai)
app.use("/url", restrictTo(["NORMAL", "ADMIN"]), router);   // Step 2: role check
```

```
Request aati hai
   ↓
checkForAuthentication → req.user set hota hai (ya null agar login nahi hai)
   ↓
restrictTo(["NORMAL", "ADMIN"]) → check: req.user exist karta hai? uska role allowed hai?
   ↓
Route (handleGenerateNewShortURL, etc.) → yahan andar createdBy: req.user._id use hota hai
```

**Lame analogy:** yeh do checkpoints wali security hai:
1. **Pehla checkpoint (Authentication)** — "Tum kaun ho? ID dikhao" (agar ID nahi hai, guest maan liya)
2. **Doosra checkpoint (Authorization)** — "Tumhari ID ke type ke hisaab se, kya tumhe is area mein aane ki permission hai?"

---

## 7. Quick Reference Table

| Concept | Code | Kaam |
|---|---|---|
| Role field | `role: { type: String, default: "NORMAL" }` | User ka type/category define karta hai |
| Role in token | `jwt.sign({..., role: user.role})` | Har request pe role turant available |
| Role check | `restrictTo(["ADMIN"])` | Sirf specific roles ko route access karne do |
| Ownership field | `createdBy: { type: ObjectId, ref: "users" }` | Batata hai resource kisne banaya |
| Ownership filter | `URL.find({ createdBy: req.user._id })` | Sirf apna data dikhana |
| Admin override | `URL.find({})` | Sabka data dikhana (role permission ke hisaab se) |

---

## 8. One-Line Summary

Authorization do tarah se implement hota hai — **Role-Based** (`restrictTo(["ADMIN"])` — user ka role check karke route access dena/rokna) aur **Ownership-Based** (`createdBy: req.user._id` — user sirf **apna** data access kar sake, doosron ka nahi). Dono milke decide karte hain ki authenticated user **kya kar sakta hai** aur **kiska data dekh sakta hai**.

## 9. Mental Model

Socho ek **library system** hai:

- **`role` field** = membership card ka type — "Student" (NORMAL) ya "Librarian" (ADMIN)
- **`restrictTo(["ADMIN"])`** = "Staff Only" waala darwaza — sirf librarian card wale andar ja sakte hain
- **`createdBy`** = har issued book pe likha "Issued to: Kushal" — record batata hai kiski hai
- **`URL.find({ createdBy: req.user._id })`** = Student apni **khud ki issued books ki list** hi dekh sakta hai
- **`URL.find({})`** = Librarian **poori library ka record** dekh sakta hai — kisi ek student tak limited nahi

**Authentication** ne bataya *"tum Kushal ho"*. **Authorization** ne bataya *"Kushal hone ki wajah se, tum sirf apni books dekh sakte ho, poori library ka record nahi — jab tak tum librarian na ho."*