# Mongoose — Connecting Node.js and MongoDB (Notes)

## 1. Mongoose Kya Hai?

Simple definition: Mongoose ek **library (ODM — Object Data Modeling)** hai jo Node.js aur MongoDB ke beech **pul (bridge)** ka kaam karti hai — MongoDB ke saath kaam karna **easy aur structured** bana deta hai.

**Lame analogy:** MongoDB seedha use karna aisa hai jaise **bina rules ke** diary likhna — kuch bhi likh sakte ho, koi checking nahi. Mongoose ek **translator + checker** hai — pehle batata hai kaunse fields honi chahiye (Schema), phir usi structure ke hisaab se data manage karta hai.

```javascript
const mongoose = require('mongoose');
```

**Do Core Concepts:**
1. **Schema** — data ka structure define karna
2. **Model** — us schema ka use karke actual CRUD operations karna

---

## 2. MongoDB Se Connect Karna

```javascript
mongoose.connect('mongodb://127.0.0.1:27017/youtube-app-1')
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log("Mongo Error", err));
```

**Simple words, breakdown:**
- `mongodb://127.0.0.1:27017` → yeh **local MongoDB server** ka address hai (`127.0.0.1` = apna computer, `27017` = MongoDB ka default port)
- `/youtube-app-1` → database ka naam — agar exist nahi karta, MongoDB **khud bana degi** jab pehla data insert hoga
- `mongoose.connect(...)` ek **Promise return karta hai** — isliye `.then()`/`.catch()` se success/failure handle kiya

**Lame analogy:** yeh line ek **phone call lagana** hai MongoDB ko — `.then()` matlab "call connect ho gayi", `.catch()` matlab "call fail ho gayi, yeh reason hai."

---

## 3. Schema — Data Ka Structure Define Karna

```javascript
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    jobTitle: {
        type: String,
    }
},
{ timestamps: true }
)
```

**Simple words:** Schema batata hai — *"is collection ke har document mein kaunse fields honge, unka type kya hoga, aur kaunse zaroori hain."*

### Har Field Ke Options:

| Option | Matlab |
|---|---|
| `type: String` | Field ka data type (String, Number, Boolean, Date, etc.) |
| `required: true` | Yeh field **bhare bina document save nahi hoga** |
| `unique: true` | Iska value **duplicate nahi ho sakta** (jaise do users same email se nahi bann sakte) |

**Lame analogy:** Schema ek **form template** jaisa hai — jaise college admission form mein "Naam (zaroori)", "Middle Name (optional)", "Email (zaroori, unique)" — schema wahi cheez MongoDB ko batati hai.

### `{ timestamps: true }` — Extra Option
**Simple words:** yeh Mongoose ko bolta hai — *"har document mein khud se `createdAt` aur `updatedAt` fields add kar do"* — batayega document kab bana tha, aur kab last update hua.

```javascript
// Mongoose khud add kar deta hai:
{
  firstName: "Kushal",
  ...
  createdAt: "2026-07-08T10:00:00Z",   // auto
  updatedAt: "2026-07-08T10:05:00Z"    // auto
}
```

---

## 4. Model — Schema Ko "Actionable" Banana

```javascript
const User = mongoose.model('user', userSchema);
```

**Simple words:** Model ek aisi cheez hai jisse hum **actual database operations** (Create, Read, Update, Delete) kar sakte hain — Schema sirf structure batata hai, **Model us structure pe kaam karta hai**.

`mongoose.model('user', userSchema)` ka matlab: *"'user' naam se ek Model banao jo `userSchema` follow karega."* (MongoDB mein yeh khud collection ka naam automatically **plural** kar deta hai — `"user"` diya toh collection ban jaayegi `"users"`.)

**Lame analogy:** Schema = form ka **design/template**. Model = woh **counter/officer** jo us form ke basis pe actual kaam karta hai — naya form bharwana (Create), purane forms dhoondhna (Read), edit karna (Update), phaadna (Delete).

---

## 5. CRUD Operations — Model Se Actual Kaam

### CREATE — `User.create()`
```javascript
const result = await User.create({
    firstName: body.first_name,
    lastName: body.last_name,
    email: body.email,
    gender: body.gender,
    jobTitle: body.job_title
});
```
**Simple words:** naya document (user) database mein banata hai. `await` isliye lagaya kyunki database operations **asynchronous** hote hain (time lagta hai) — jab tak save na ho jaaye, code wait karta hai.

### READ (All) — `User.find({})`
```javascript
const allDbUsers = await User.find({});
```
**Simple words:** `{}` matlab **koi filter nahi** — isliye saare documents mil jaate hain us collection ke.

```javascript
User.find({ firstName: "Kushal" });   // sirf matching documents
```

### READ (By ID) — `User.findById()`
```javascript
const user = await User.findById(req.params.id)
```
**Simple words:** MongoDB ka har document ek unique `_id` leke aata hai (khud se generate hota hai). `findById()` seedha us ID se ek specific document dhoondh leta hai.

### UPDATE — `User.findByIdAndUpdate()`
```javascript
await User.findByIdAndUpdate(req.params.id, { lastName: "Changed" });
```
**Simple words:** ID se document dhoondh ke, diye gaye fields **update** kar deta hai — baaki fields waise hi rehte hain (yeh PATCH jaisa partial update hai).

### DELETE — `User.findByIdAndDelete()`
```javascript
await User.findByIdAndDelete(req.params.id);
```
**Simple words:** ID se document dhoondh ke usse **permanently delete** kar deta hai.

---

## 6. `async`/`await` Har Jagah Kyun?

```javascript
app.get('/api/users', async (req, res) => {
    const allDbUsers = await User.find({});
    return res.json(allDbUsers);
})
```

**Simple words:** database se data padhna/likhna **turant nahi hota** — thoda time lagta hai (network, disk I/O). Isliye Mongoose ke saare methods (`find`, `create`, `findById`, etc.) **Promise return karte hain**, aur unhe `await` ke saath use karte hain taaki result aane tak wait ho, phir aage badhein.

Route function khud bhi `async` banaya gaya hai (`async (req, res) => {...}`) — kyunki `await` sirf `async` function ke andar hi use ho sakta hai.

---

## 7. Poore Code Ka Flow — Ek Example (POST Request)

```
1. User form submit karta hai (first_name, last_name, email, gender, job_title)
2. body validation check hoti hai — sab fields hain ya nahi
3. Agar missing → 400 Bad Request
4. Agar sab theek → User.create({...}) chalta hai
5. Mongoose Schema check karta hai — required fields hain? email unique hai?
6. Sab sahi → naya document MongoDB mein save ho jaata hai
7. Response: 201 Created + { msg: "Success" }
```

---

## 8. Bug Jo Fix Karna Hai (Pichle Code Ki Tarah)

```javascript
if(!user) return req.status(404).json({error : 'User Not found'});
//              ^^^ galat — 'req' pe .status() hota hi nahi

// Sahi:
if(!user) return res.status(404).json({error : 'User Not found'});
```

Yeh wahi bug hai jo pehle bhi dekha tha — `req` (request) ki jagah `res` (response) hona chahiye.

---

## 9. Quick Reference Table

| Kaam | Mongoose Method | SQL Equivalent |
|---|---|---|
| Connect karna | `mongoose.connect(url)` | Database connection string |
| Structure define karna | `new mongoose.Schema({...})` | `CREATE TABLE ... (columns)` |
| Model banana | `mongoose.model(name, schema)` | Table ka reference |
| Naya data | `Model.create({...})` | `INSERT INTO` |
| Saara data | `Model.find({})` | `SELECT * FROM` |
| ID se ek document | `Model.findById(id)` | `SELECT * WHERE id = ?` |
| Update karna | `Model.findByIdAndUpdate(id, {...})` | `UPDATE ... WHERE id = ?` |
| Delete karna | `Model.findByIdAndDelete(id)` | `DELETE FROM ... WHERE id = ?` |

---

## 10. One-Line Summary

Mongoose Node.js aur MongoDB ke beech ek layer hai — pehle **Schema** se data ka structure define karte hain (kaunse fields, types, required/unique), phir **Model** banate hain jo us Schema ke basis pe actual CRUD operations (`create`, `find`, `findByIdAndUpdate`, `findByIdAndDelete`) karta hai — sab kuch async hone ki wajah se `await` ke saath use hota hai.

## 11. Mental Model

Socho Mongoose ek **college admission office** hai:

- **Schema** = admission form ka **design** — "Naam zaroori hai, Email zaroori aur unique hai, Middle Name optional hai"
- **Model** = us form ko process karne wala **officer/counter** — naye students admit karta hai (`create`), purane students dhoondhta hai (`find`), details update karta hai (`findByIdAndUpdate`), ya admission cancel karta hai (`findByIdAndDelete`)
- **`_id`** = har student ka apna **unique roll number**
- **`await`** = officer se result milne tak line mein khade rehna — turant nahi milta, thoda wait karna padta hai
- **`timestamps: true`** = har form pe automatically "Submitted on" aur "Last edited on" ki stamp lag jaana