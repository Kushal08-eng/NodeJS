# 📝 URL Shortener Mini Project — Notes (Hinglish)

> Ye project ek **URL Shortener** hai (bit.ly / tinyurl jaisa). Lambi URL do, chhoti ID milti hai, aur us chhoti ID se original URL pe redirect ho jate ho. Saath mein **analytics** bhi milta hai (kitne clicks hue, kab hue).

---

## 📁 Folder Structure (MVC Pattern)

```
19-short-url/
│
├── index.js            → Entry point (server yahan se start hota hai)
├── connect.js          → MongoDB connection ka logic
├── models/
│   └── url.js          → Database ka schema (data kaisa dikhega)
├── controllers/
│   └── url.js          → Business logic (actual kaam yahan hota hai)
├── routes/
│   └── url.js          → Routes (kaunsi URL pe kaunsa controller chalega)
└── package.json        → Project config + dependencies
```

**MVC ka funda:**
- **Model** → data ka structure (MongoDB schema)
- **Controller** → logic (request aane pe kya karna hai)
- **Routes** → traffic police (request ko sahi controller tak pahunchana)

---

## 📦 Dependencies (package.json)

| Package | Kaam kya hai |
|---------|--------------|
| `express` | Web server banane ke liye (routing, middleware sab) |
| `mongoose` | MongoDB se baat karne ke liye (ODM — Object Data Modeling) |
| `shortid` | Random chhoti unique ID generate karne ke liye (e.g. `ppBqWA9`) |
| `nanoid` | Ye bhi ID generator hai (installed hai but abhi use nahi ho raha, `shortid` use ho raha hai) |
| `nodemon` | Dev tool — file save karte hi server auto-restart |

**Server chalane ke liye:**
```bash
npm start        # ye "nodemon index.js" chalata hai
```

> ⚠️ Note: `shortid` package ab deprecated hai. Future projects mein `nanoid` use karna better hai.

---

## 🔌 connect.js — MongoDB Connection

```js
const mongoose = require("mongoose");

async function connectToMongoDB(url) {
    return mongoose.connect(url);
}

module.exports = { connectToMongoDB };
```

**Samjho:**
- Ek simple **reusable function** banaya jo mongoose se MongoDB connect karta hai.
- `mongoose.connect(url)` ek **Promise** return karta hai, isliye function `async` hai.
- Isko alag file mein rakha taaki `index.js` clean rahe — separation of concerns.

---

## 🗃️ models/url.js — Schema & Model

```js
const urlSchema = new mongoose.Schema({
    shortId: {
        type: String,
        required: true,   // dena zaroori hai
        unique: true,     // duplicate nahi ho sakta
    },
    redirectURL: {
        type: String,
        required: true,   // original lambi URL
    },
    visitHistory: [{ timestamp: { type: Number } }],  // har visit ka time
},
{ timestamps: true }  // createdAt & updatedAt automatic add ho jate hain
);

const URL = mongoose.model("url", urlSchema);
```

**Samjho:**
- **Schema** = data ka blueprint. MongoDB document kaisa dikhega, ye define karta hai.
- `shortId` → chhoti unique ID (e.g. `ppBqWA9`)
- `redirectURL` → asli lambi URL jahan redirect karna hai
- `visitHistory` → **array of objects** — har baar koi link kholega, ek entry push hogi `{ timestamp: 1720000000000 }`
- `{ timestamps: true }` → mongoose khud `createdAt` aur `updatedAt` fields add kar deta hai. Bahut useful!
- `mongoose.model("url", urlSchema)` → collection ka naam MongoDB mein **`urls`** banega (mongoose plural kar deta hai).

**Ek document DB mein aisa dikhega:**
```json
{
  "_id": "...",
  "shortId": "ppBqWA9",
  "redirectURL": "https://www.google.com",
  "visitHistory": [
    { "timestamp": 1720434567890 },
    { "timestamp": 1720434599999 }
  ],
  "createdAt": "2026-07-08T...",
  "updatedAt": "2026-07-08T..."
}
```

---

## 🧠 controllers/url.js — Business Logic

### 1. handleGenerateNewShortURL (naya short URL banana)

```js
async function handleGenerateNewShortURL(req, res) {
    const body = req.body;
    if (!body.url) return res.status(400).json({ error: 'url is required' });

    const shortId = shortid();          // random ID generate
    await URL.create({
        shortId: shortId,
        redirectURL: body.url,
        visitHistory: [],               // shuru mein khali array
    });

    return res.json({ id: shortId });   // user ko short ID wapas bhejo
}
```

**Flow:**
1. Body se `url` nikalo.
2. Agar `url` nahi bheja → **400 Bad Request** (validation).
3. `shortid()` se random unique ID banao.
4. `URL.create()` se DB mein naya document save karo.
5. Response mein generated `id` bhej do.

### 2. handleGetAnalytics (clicks ka data)

```js
async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;           // URL se shortId nikalo
    const result = await URL.findOne({ shortId }); // DB mein dhundo
    return res.json({
        totalClicks: result.visitHistory.length,   // array length = total clicks
        analytics: result.visitHistory,            // pura history
    });
}
```

**Samjho:**
- `req.params.shortId` → route mein jo `:shortId` likha hai, uski value.
- `visitHistory.length` = kitni baar link khola gaya (total clicks).

---

## 🛣️ routes/url.js — Routing

```js
const router = express.Router();

router.post("/", handleGenerateNewShortURL);           // POST /url
router.get("/analytics/:shortId", handleGetAnalytics); // GET /url/analytics/:shortId

module.exports = router;
```

**Samjho:**
- `express.Router()` → mini express app jaisa hai, routes ko group karne ke liye.
- Ye router `index.js` mein `/url` path pe mount hua hai, isliye:
  - `router.post("/")` ka actual path = **`POST /url`**
  - `router.get("/analytics/:shortId")` ka actual path = **`GET /url/analytics/:shortId`**
- `:shortId` → **dynamic parameter** — jo bhi value URL mein aayegi wo `req.params.shortId` mein milegi.

---

## 🚀 index.js — Entry Point

```js
const app = express();
const PORT = 8001;

// 1. MongoDB connect karo
connectToMongoDB('mongodb://localhost:27017/short-url')
    .then(console.log("MongoDB Connected"));

// 2. Middleware — JSON body parse karne ke liye
app.use(express.json());

// 3. /url wale saare routes router handle karega
app.use("/url", router);

// 4. Redirect route — short URL kholne pe
app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        { shortId },                                    // ye document dhundo
        { $push: { visitHistory: { timestamp: Date.now() } } }  // aur visit entry push karo
    );
    res.redirect(entry.redirectURL);                    // original URL pe bhej do
});

app.listen(PORT, () => console.log("Server Started at PORT: ", PORT));
```

**Important points:**
- `express.json()` → middleware jo incoming JSON body ko parse karke `req.body` mein daal deta hai. **Iske bina `req.body` undefined hota!**
- `findOneAndUpdate()` → ek hi query mein **dhundna + update** dono ho jata hai:
  - Pehla argument: filter (`{ shortId }`)
  - Doosra argument: update (`$push` operator se `visitHistory` array mein nayi entry add)
- `$push` → MongoDB ka operator jo array mein naya element add karta hai.
- `res.redirect(url)` → browser ko bolta hai "is URL pe chale jao" (302 redirect).
- Route order matter karta hai — `/url` routes pehle mount hain, `/:shortId` baad mein. Warna `/url` bhi `:shortId` samajh liya jata!

---

## 🔄 Complete Flow (End to End)

### Step 1: Short URL banao
```
POST http://localhost:8001/url
Content-Type: application/json

{ "url": "https://www.google.com" }
```
**Response:**
```json
{ "id": "ppBqWA9" }
```

### Step 2: Short URL kholo (redirect)
```
GET http://localhost:8001/ppBqWA9
```
→ Browser **https://www.google.com** pe redirect ho jayega, aur DB mein `visitHistory` mein ek timestamp entry push ho jayegi.

### Step 3: Analytics dekho
```
GET http://localhost:8001/url/analytics/ppBqWA9
```
**Response:**
```json
{
  "totalClicks": 2,
  "analytics": [
    { "timestamp": 1720434567890, "_id": "..." },
    { "timestamp": 1720434599999, "_id": "..." }
  ]
}
```

---

## 🌐 API Endpoints Summary

| Method | Endpoint | Kaam |
|--------|----------|------|
| `POST` | `/url` | Nayi short URL generate karo (body mein `{ "url": "..." }`) |
| `GET` | `/:shortId` | Original URL pe redirect + visit record karo |
| `GET` | `/url/analytics/:shortId` | Total clicks + visit history dekho |

---

## 🔑 Key Concepts Jo Is Project Se Seekhe

1. **MVC Architecture** — models, controllers, routes alag-alag files mein. Code maintainable rehta hai.
2. **express.Router()** — routes ko modular banana.
3. **Mongoose Schema + Model** — `required`, `unique`, `timestamps: true` options.
4. **`findOneAndUpdate` + `$push`** — atomic operation: ek query mein find + array update.
5. **`res.redirect()`** — server-side redirect karna.
6. **Dynamic route params** — `/:shortId` → `req.params.shortId`.
7. **`express.json()` middleware** — request body parse karna.
8. **Validation** — body mein `url` nahi hai to `400` status ke saath error.
9. **shortid()** — random unique ID generation.

---

## ⚠️ Improvements / Dhyan Rakhne Wali Baatein (Future Ke Liye)

1. **Error handling missing hai** — agar galat `shortId` diya to `entry` null hoga aur `entry.redirectURL` pe server **crash** karega. `if (!entry) return res.status(404).json(...)` add karna chahiye. Same `handleGetAnalytics` mein bhi.
2. **`shortid` deprecated hai** — `nanoid` use karo (already installed hai):
   ```js
   const { nanoid } = require("nanoid");
   const shortId = nanoid(8);   // 8 character ki ID
   ```
3. **URL validation** — abhi koi bhi string accept ho jati hai. Check karna chahiye ki valid URL hai ya nahi.
4. **MongoDB connection ka `.then()` galat hai** — `.then(console.log("MongoDB Connected"))` mein `console.log` turant chal jata hai (connect hone se pehle bhi). Sahi tarika:
   ```js
   connectToMongoDB('mongodb://localhost:27017/short-url')
       .then(() => console.log("MongoDB Connected"))
       .catch((err) => console.log("Mongo Error", err));
   ```
5. **PORT aur DB URL hardcoded hain** — `.env` file + `dotenv` package use karna production ke liye better hai.

---

## 🧪 Testing Kaise Kare (Postman / Thunder Client)

1. Pehle MongoDB local pe chalu hona chahiye (`mongod` service).
2. `npm start` se server start karo → `http://localhost:8001`
3. **POST** request bhejo `/url` pe, body mein raw JSON: `{ "url": "https://youtube.com" }`
4. Response se `id` copy karo.
5. Browser mein `http://localhost:8001/<id>` kholo → redirect hoga.
6. `http://localhost:8001/url/analytics/<id>` pe GET karo → clicks dikhenge.
7. MongoDB Compass mein `short-url` database → `urls` collection mein data verify karo.
