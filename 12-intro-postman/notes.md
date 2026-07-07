# Building a RESTful API with Express — Notes

## 1. Mock Data Use Karna

```javascript
const users = require("./MOCK_DATA.json")
```

**Simple words:** real database use karne se pehle, practice ke liye ek **JSON file** ko hi "fake database" jaisa use kar rahe hain. `require()` seedha JSON file ko JS array/object ki tarah load kar deta hai.

```json
// MOCK_DATA.json (example)
[
  { "id": 1, "first_name": "Kushal", "email": "kushal@x.com" },
  { "id": 2, "first_name": "Chai", "email": "chai@x.com" }
]
```

---

## 2. Middleware — `express.urlencoded()`

```javascript
app.use(express.urlencoded({extended:false}));
```

**Simple words:** Middleware ek **beech ka layer** hai jo request server tak pahunchne se pehle usse "process/prepare" karta hai.

`express.urlencoded()` ka kaam: jab koi **HTML form** submit hoti hai (form data), yeh usse **parse karke `req.body` mein daal deta hai**, taaki tum seedha `req.body` se data nikaal sako.

**Lame analogy:** middleware ek **security check/reception counter** jaisa hai — request andar aane se pehle wahan se guzarti hai, aur wahan usse "readable form" mein convert kiya jaata hai.

⚠️ **Chhoti si kami:** yeh middleware sirf **form-encoded data** (HTML forms) ke liye hai. Agar Postman se ya frontend se **JSON body** bhej rahe ho (jaise `{"first_name": "Kushal"}`), toh iske liye alag middleware chahiye:
```javascript
app.use(express.json());   // JSON body parse karne ke liye
```
Is code mein yeh missing hai — agar JSON bhejoge, `req.body` khaali ya `undefined` aa sakta hai.

---

## 3. HTML Response Wala Route

```javascript
app.get('/users', (req, res)=>{
    const html = `
    <ul>
    ${users.map(user => `<li>${user.first_name}</li>`).join("")}
    <ul>
    `
    res.send(html)
})
```

**Simple words:** yeh route JSON nahi, seedha **HTML** bana ke bhej raha hai. `users.map(...)` se har user ka naam `<li>` tag mein daal ke, `.join("")` se sab ek saath jod diya — final HTML string ban gayi.

**Chhota typo:** closing tag `<ul>` hona chahiye tha `</ul>` (bina slash ke galat hai) — HTML thoda invalid ban jayega, lekin browser generally tolerate kar leta hai.

---

## 4. REST API Route — Sab Users — `GET /api/users`

```javascript
app.get('/api/users', (req, res)=>{
    return res.json(users);
})
```

**Simple words:** yeh **actual REST API** route hai (`/api/` prefix se naam diya, taaki HTML wale route se alag pehchana jaaye). `res.json(users)` poora users array **JSON format mein** bhej deta hai — Express khud `Content-Type: application/json` set kar deta hai.

---

## 5. Dynamic Route Parameter — `:id`

```javascript
app.route('/api/users/:id').get((req, res)=>{
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);
    return res.json(user);
})
```

**Simple words:** `:id` ek **placeholder** hai URL mein — jo bhi value wahan aayegi, woh `req.params.id` mein mil jaayegi.

```
URL: /api/users/3
req.params.id = "3"    (yeh STRING hoti hai, number nahi!)
```

Isliye `Number(req.params.id)` use kiya gaya — kyunki `req.params.id` hamesha **string** hoti hai, aur `users` array mein `id` **number** ho sakta hai. String aur number compare karne se `.find()` galat result de sakta hai agar convert na karo.

```javascript
"3" === 3   // false ❌ (string vs number)
3 === 3     // true  ✅ (dono number)
```

---

## 6. `app.route()` — Chaining Multiple Methods

```javascript
app.route('/api/users/:id')
    .get((req, res) => { ... })
    .patch((req, res) => { ... })
    .delete((req, res) => { ... })
```

**Simple words:** `app.route(path)` tumhe ek **hi path** ke liye multiple HTTP methods **chain** karne deta hai, bina baar baar path likhe.

```javascript
// Bina app.route() ke (repetitive)
app.get('/api/users/:id', ...)
app.patch('/api/users/:id', ...)
app.delete('/api/users/:id', ...)

// app.route() se (clean, DRY)
app.route('/api/users/:id')
   .get(...)
   .patch(...)
   .delete(...)
```

**Lame analogy:** `app.route()` ek hi **darwaze** pe teen alag "boards" laga rahe ho — "GET wale idhar", "PATCH wale idhar", "DELETE wale idhar" — bina teen alag darwaze banaye.

### `PATCH` aur `DELETE` — Abhi Sirf Placeholder
```javascript
.patch((req, res) =>{
    // TODO : edit the user with id
    return res.json({status : 'Pending'})
})
.delete((req , res)=>{
    // TODO : delete the user with id
    res.json({status : 'Pending'})
})
```
Simple words: yeh routes abhi **bane hue hain, lekin kaam nahi karte** — sirf "Pending" bol rahe hain. Actual logic (user ko update karna ya delete karna) abhi **TODO** hai, baad mein likhna hai.

---

## 7. Naya User Banana — `POST /api/users`

```javascript
app.post('/api/users' , (req , res)=>{
    const  body = req.body;
    users.push({...body , id:users.length+1});
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err , data)=>{
        return res.json({status:"pending"});
    })
    console.log(body);
    return res.json({status: "sucess", id:users.length});
});
```

**Step by step:**
1. `req.body` → POST request ke saath aaya naya data (jaise `{ first_name: "Naya User" }`)
2. `users.push({...body, id: users.length+1})` → naye user object mein purana `body` data spread kar diya, aur ek naya `id` add kar diya, phir `users` array mein daal diya
3. `fs.writeFile(...)` → updated `users` array ko **file mein permanently save** kar diya (taaki server restart hone pe data na khoye)
4. `console.log(body)` → debug ke liye print

**⚠️ Important Bug — Do Baar Response Bhejna:**
```javascript
fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err , data)=>{
    return res.json({status:"pending"});   // Response #1 (async callback ke andar)
})
console.log(body);
return res.json({status: "sucess", id:users.length});   // Response #2 (turant, bahar)
```

Yahan **do jagah response bhejne ki koshish ho rahi hai**:
- Ek response `fs.writeFile` ke callback ke **andar** (jo file likhne ke BAAD chalega — async hai)
- Ek response uske **turant baad, bahar** (jo synchronously turant chal jaayega)

Kyunki `fs.writeFile` **asynchronous** hai, `res.json({status: "sucess", ...})` wali line **pehle** chal jaayegi (file abhi likhi nahi gayi hoti), aur user ko turant "sucess" wala response mil jaayega. Jab file likhna baad mein complete hoga, tab `fs.writeFile` ka callback response bhejne ki koshish karega — lekin **response toh pehle hi bhej diya gaya tha**! Isse error aata hai: *"Cannot set headers after they are sent"*.

**Fix:**
```javascript
app.post('/api/users', (req, res) => {
    const body = req.body;
    users.push({ ...body, id: users.length + 1 });

    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err) => {
        if (err) {
            return res.json({ status: "error", message: err.message });
        }
        return res.json({ status: "success", id: users.length });  // ✅ sirf ek response, andar
    });
    // bahar koi res.json() nahi likhna
});
```

**Lame analogy:** yeh aisa hai jaise waiter customer ko **do baar bill de rahi hai** — pehle turant ek bill thama diya (galat hisaab se, kyunki khana abhi bana hi nahi), aur baad mein jab khana ban gaya, dubara bill dene ki koshish ki — lekin customer toh pehla bill leke ja chuka! Server confuse ho jaata hai.

**Chhota spelling bug bhi hai:** `"sucess"` likha hai, sahi spelling `"success"` hai — kaam karega, lekin consistency ke liye theek kar lena chahiye.

---

## 8. Commented-Out Routes — PATCH aur DELETE (Duplicate)

```javascript
// app.patch('/api/users/:id' , (req , res)=>{
//     // TODO : Edit the user with id
//     return res.json({status: "pending"});
// })

// app.delete('/api/users/:id' , (req , res)=>{
//     // TODO : delete the user with id
//     return res.json({status: "pending"});
// })
```

**Simple words:** yeh routes **comment kiye hue hain** (`//` se) — matlab yeh code chalega hi nahi. Yeh isliye hain kyunki upar `app.route()` ke through **already** PATCH aur DELETE define ho chuke hain — yeh commented lines shayad purana attempt tha jo baad mein `app.route()` mein convert kar diya gaya. Yeh safely delete kiye ja sakte hain, duplicate hain.

---

## 9. Poora Flow — Ek Baar Mein

| Route | Method | Kaam |
|---|---|---|
| `/users` | GET | HTML list dikhata hai (names) |
| `/api/users` | GET | Saare users JSON mein |
| `/api/users` | POST | Naya user add karta hai + file mein save |
| `/api/users/:id` | GET | Specific user ID se dhoondta hai |
| `/api/users/:id` | PATCH | (Abhi pending) — user update karna |
| `/api/users/:id` | DELETE | (Abhi pending) — user delete karna |

---

## 10. Quick Fixes Needed (Summary)

1. `express.json()` middleware add karo (agar JSON body bhejna hai)
2. POST route mein **double response** ka bug fix karo — sirf `fs.writeFile` callback ke andar response bhejo
3. `"sucess"` → `"success"` spelling fix
4. Commented-out duplicate PATCH/DELETE routes hata do (already `app.route()` mein hain)
5. HTML wale route mein `<ul>` closing tag `</ul>` karo

---

## 11. One-Line Summary

Yeh code Express se ek basic REST API bana raha hai jo mock JSON data pe CRUD operations (Create, Read abhi ready hain; Update, Delete abhi TODO/pending hain) karta hai — `app.route()` se same path pe multiple methods chain kiye gaye hain, aur `fs.writeFile` se changes ek JSON file mein permanently save kiye ja rahe hain.

## 12. Mental Model

Socho yeh API ek **register wali dukaan** hai:
- `MOCK_DATA.json` = purana register jisme sab customers (users) ki entry hai
- `GET /api/users` = poora register padhna
- `GET /api/users/:id` = register mein specific customer dhoondhna (page number se — id)
- `POST /api/users` = register mein nayi entry likhna, aur register (file) ko save karna
- `PATCH`/`DELETE` = purani entry edit karna ya mitana — abhi sirf "coming soon" board laga hai (TODO)