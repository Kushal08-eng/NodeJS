# Getting Started With Express.js — Notes

## 1. Express Kya Hai?

Simple definition: Express ek **framework** hai jo Node.js ke raw `http` module ke upar bana hai — server banane, routing karne, aur request/response handle karne ka kaam **bahut aasan** bana deta hai.

**Lame analogy:** raw `http` module se server banana aisa hai jaise khud gaadi ka poora engine banana. Express use karna aisa hai jaise **ready-made gaadi** mil gayi — bas steering ghumao (routes likho), baaki sab already set hai.

Yaad karo raw `http` mein kya karna padta tha:
```javascript
// Raw http — manually check karna padta tha
if (req.url === '/' && req.method === 'GET') {
    res.end("Home Page");
}
```
Express isse aur simple bana deta hai:
```javascript
app.get('/', (req, res) => {
    res.send("Home Page");
});
```

---

## 2. Express Install Karna (Missing Step)

Code mein `require("express")` seedha use ho gaya hai, lekin usse pehle **install** karna padta hai:

```bash
npm init -y            # package.json banata hai (project ka config file)
npm install express    # express ko install karta hai
```

`npm init -y` ke baad ek `package.json` file bnti hai jisme project ki info aur dependencies list hoti hain. `npm install express` ke baad `node_modules` folder aur `package.json` mein `express` add ho jaata hai.

---

## 3. Express App Banana

```javascript
const express = require("express");
const app = express()
```

**Simple words:**
- `require("express")` → Express library ko load karo
- `express()` → ek **app object** banao — yeh tumhara poora server hai, isi pe routes, middleware, sab kuch lagta hai

`app` basically woh cheez hai jo pehle `http.createServer()` se banti thi — bas ab bahut zyada features ke saath.

---

## 4. Port Set Karna

```javascript
const port = 8000
```

Simple words: port number bata rahe hain ki server kis "darwaze" pe chalega — same concept jo raw `http` mein tha.

---

## 5. Routes Banana — `app.get()`

```javascript
app.get('/', (req, res) => {
    return res.send(`hello, welcome to port: ${port}`)
});
```

**Simple words:** `app.get(path, callback)` — jab bhi koi user is `path` (`/`) pe **GET** request bheje, yeh callback chalega.

Compare karo raw `http` se:
```javascript
// Raw http mein
switch(req.url) {
    case '/': res.end("Home Page"); break;
}

// Express mein
app.get('/', (req, res) => res.send("Home Page"));
```
Express mein har route ke liye **alag se function** likhte ho — koi manual `if`/`switch` nahi lagana padta. Express khud check karta hai ki URL match hua ya nahi.

---

## 6. `res.send()` vs `res.end()` (Important Difference)

Raw `http` mein hum `res.end()` use karte the. Express mein `res.send()` zyada use hota hai.

| | `res.end()` (raw http) | `res.send()` (Express) |
|---|---|---|
| Kya bhej sakte ho | Sirf string/buffer | String, object, array, HTML — sab kuch |
| Content-Type set karta hai | ❌ Nahi, khud set karna padta hai | ✅ Khud samajh ke set kar deta hai |
| JSON bhejna | Manually `JSON.stringify()` karna padta | Object diya toh khud JSON bana deta hai |

```javascript
res.send("Hello");              // plain text
res.send({ name: "Kushal" });   // Express khud JSON bana ke bhej deta hai
```

**Lame analogy:** `res.end()` ek waiter hai jo sirf bola gaya cheez seedha de deta hai (chahe woh galat format mein ho). `res.send()` ek smart waiter hai jo khud samajh jaata hai ki tumne kya diya hai (text ho ya object) aur usi hisaab se sahi tareeke se serve karta hai.

---

## 7. Query Parameters — `req.query` (Bina `url.parse` Ke!)

```javascript
app.get('/about', (req, res) => {
    return res.send(`hello ${req.query.name}`)
});
```

**Simple words:** yaad karo raw `http` mein query params nikalne ke liye `url.parse(req.url, true)` likhna padta tha. Express mein yeh kaam **already ho chuka hota hai** — seedha `req.query` se access kar sakte ho.

```
URL: http://localhost:8000/about?name=Kushal

req.query = { name: "Kushal" }
req.query.name = "Kushal"
```

Response: `"hello Kushal"`

**Comparison:**
```javascript
// Raw http mein
const myUrl = url.parse(req.url, true);
const name = myUrl.query.name;

// Express mein
const name = req.query.name;   // ✅ seedha milta hai, koi parsing nahi
```

---

## 8. Server Start Karna — `app.listen()`

```javascript
app.listen(port, () => {
    console.log(`server has started on port: ${port}`)
})
```

Simple words: bilkul same concept jo raw `http.createServer().listen()` mein tha — server ko diye gaye port pe chalu karna, aur ek callback jo start hote hi chalta hai.

---

## 9. Kya Missing Tha Is Code Mein (Short Mein)

1. **Express install karna** — `npm install express` (code chalane se pehle zaroori)
2. **`req.method` manually check nahi karna padta** — `app.get()` khud sirf GET requests handle karta hai, POST ke liye `app.post()` alag likhna padega
3. **404 handling** — agar koi aisa route maange jo define hi nahi hai, Express khud ek default "Cannot GET /xyz" message bhej deta hai, lekin custom 404 page ke liye alag se likhna padta hai:
   ```javascript
   app.use((req, res) => {
       res.status(404).send("404 Not Found");
   });
   ```
4. **`nodemon`** — development mein har baar file change karne pe server ko manually restart karna padta hai. `nodemon` install karke yeh automatic ho jaata hai:
   ```bash
   npm install -D nodemon
   npx nodemon index.js
   ```

---

## 10. Quick Comparison — Raw `http` vs Express

| Kaam | Raw `http` Module | Express |
|---|---|---|
| Server banana | `http.createServer(callback)` | `express()` |
| Routing | `switch`/`if` on `req.url` | `app.get()`, `app.post()`, etc. |
| Response bhejna | `res.end(data)` (string/buffer only) | `res.send(data)` (kuch bhi, JSON khud handle) |
| Query params | `url.parse(req.url, true)` | Seedha `req.query` |
| Method check | `req.method === 'GET'` manually | `app.get()` khud handle karta hai |

---

## 11. One-Line Summary

Express, Node.js ke `http` module ke upar ek **layer** hai jo routing (`app.get`, `app.post`), response bhejna (`res.send`), aur query parameters (`req.query`) sab kuch **bina manual parsing/checking ke** aasan bana deta hai.

## 12. Mental Model

Raw `http` module = **cycle** — khud chalao, khud balance banao, khud direction dekho (sab manual).
Express = **automatic gear waali gaadi** — same manzil (server banana, requests handle karna) tak pahुंचate ho, lekin bahut kam manual mehnat mein.