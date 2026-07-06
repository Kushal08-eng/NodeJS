# Building an HTTP Server in Node.js — Notes

## 1. `http` Module Kya Hai?

Simple definition: `http` ek **built-in Node.js module** hai jo tumhe **web server banane** deta hai — bina kisi external library (Express) ke.

```javascript
const http = require("http");
const fs = require("fs");
```

Yeh dono built-in modules hain — `http` server banane ke liye, `fs` file operations (yahan logging) ke liye.

---

## 2. Server Banana — `http.createServer()`

```javascript
const myServer = http.createServer((req, res) => {
    // yahan har request ka response decide hota hai
});
```

**Simple words:** `http.createServer()` ek server object banata hai. Iske andar jo function diya hai, woh **har baar chalta hai jab bhi koi user request bhejta hai**.

Yeh function do cheezein deta hai:
- **`req` (Request)** → user ne kya bheja hai (URL, headers, method, etc.)
- **`res` (Response)** → tumhe user ko kya wapas bhejna hai

**Lame analogy:** `createServer` ek dukaan khol raha hai. Jab bhi koi customer (`req`) andar aata hai, dukaandaar (yeh callback function) decide karta hai use kya dena hai (`res`).

---

## 3. Request aur Response (`req`, `res`) Ka Matlab

```javascript
(req, res) => { ... }
```

| | Kya hai | Example |
|---|---|---|
| `req` | Request — user ne kya maanga | `req.url`, `req.headers`, `req.method` |
| `res` | Response — tum user ko kya doge | `res.end("Home Page")` |

```javascript
// req.url → user ne kaunsa page/path maanga
// e.g. agar user ne localhost:8000/about khola, toh req.url = "/about"

// res.end(...) → response bhej ke connection close kar do
```

---

## 4. Logging Har Request — `fs.appendFile`

```javascript
const log = `${Date.now().toLocaleString()} : ${req.url} : New Request Recieved \n`;
fs.appendFile('log.txt', log, (err, data) => {
    // yahan response bhejna hai
});
```

**Simple words:** har baar jab koi request aati hai, ek **log line** banate hain (time + kaunsa URL request hua) aur usse `log.txt` file mein **append** kar dete hain (purana content delete nahi hota, naya add hota hai).

`fs.appendFile` ka **async version** use kiya hai (bina Sync ke) — matlab file likhne ka kaam background mein hota hai, aur jab woh complete ho jaaye, callback `(err, data) => {...}` chalta hai.

⚠️ **Important:** actual response (`res.end(...)`) **callback ke andar** likha gaya hai — matlab pehle log file mein likha jaayega, **uske baad hi** user ko response milega. Yeh isliye kyunki `fs.appendFile` async hai — agar response callback ke bahar likhte, toh response pehle chala jaata aur log likhna baad mein hota (order guarantee nahi rehta).

**Chota bug/typo:** `Date.now().toLocaleString()` galat hai — `Date.now()` ek **number** (timestamp) return karta hai, uspe `.toLocaleString()` call karne se number ka locale-formatted version milega (jaise `"1,720,000,000,000"`), date nahi. Agar readable date-time chahiye toh:
```javascript
new Date().toLocaleString()   // ✅ readable date-time string
```

---

## 5. Routing — `switch(req.url)`

```javascript
switch(req.url){
    case '/' : res.end("Home Page");
    break;

    case '/about' : res.end("I am Kushal");
    break;

    default:
        res.end("404 Not Found")
}
```

**Simple words:** yeh basic **routing** hai — matlab, alag alag URL pe alag response dena.

- Agar user `localhost:8000/` pe aaye → `req.url = "/"` → "Home Page" milega
- Agar user `localhost:8000/about` pe aaye → `req.url = "/about"` → "I am Kushal" milega
- Koi bhi aur URL (jaise `/contact`, `/random`) → `default` case chalega → "404 Not Found"

**Lame analogy:** switch statement ek **receptionist** ki tarah hai — puchti hai "kaunsa room jaana hai?" (`req.url`), aur uske hisaab se sahi jagah bhej deti hai. Agar koi aisa room maange jo exist nahi karta, "404 Not Found" bol deti hai.

---

## 6. Server Ko Start Karna — `.listen()`

```javascript
const PORT = 8000;
myServer.listen(8000, () => {
    console.log(`Server started at port no ${PORT}`);
});
```

**Simple words:** server ko banane ke baad, usse **actually chalu (start)** karna padta hai — `.listen(PORT, callback)` se.

- `8000` → yeh **port number** hai. Socho tumhare computer mein bahut saare "darwaze" (ports) hain — port 8000 wale darwaze pe yeh server baitha rahega, requests sunne ke liye.
- Callback function → server start hote hi ek baar chalta hai (confirmation ke liye)

Browser mein test karne ke liye: `http://localhost:8000/` ya `http://localhost:8000/about`

---

## 7. Poora Flow — Step by Step

```
1. User browser mein http://localhost:8000/about khol ta hai
2. Request server tak pahुंचती hai
3. createServer ka callback chalta hai:
   → req.url = "/about"
4. Log line banti hai (time + url)
5. fs.appendFile background mein log.txt file mein likhta hai
6. Jab likhna complete hota hai, callback chalta hai
7. Switch statement check karta hai: req.url === "/about" → match!
8. res.end("I am Kushal") → yeh response user ke browser mein dikh jaata hai
```

---

## 8. `req.headers` aur `req.` (Commented Lines)

```javascript
// console.log(req.headers)
// console.log(req)
```

**Simple words:**
- `req.headers` → browser jo extra info bhejta hai request ke saath (jaise browser ka naam, accepted languages, cookies, etc.) — object ke form mein
- `console.log(req)` → poora request object print karega — bahut bada aur detailed output milega (isliye normally sirf specific cheezein log karte hain jaise `req.url`, `req.method`, na ki poora object)

---

## 9. Quick Reference Table

| Cheez | Kaam |
|---|---|
| `http.createServer(callback)` | Server banata hai, har request pe callback chalata hai |
| `req` | Request object — user ne kya bheja (`req.url`, `req.headers`, `req.method`) |
| `res` | Response object — user ko kya wapas bhejna hai (`res.end(...)`) |
| `req.url` | User ne kaunsa path/page maanga |
| `res.end(data)` | Response bhejo aur connection close karo |
| `myServer.listen(port, callback)` | Server ko actual start karo, us port pe sunna shuru karo |

---

## 10. One-Line Summary

`http.createServer()` se ek server banta hai jo har request pe ek callback chalata hai — us callback mein `req` se pata chalta hai user ne kya maanga (`req.url`), aur `res.end()` se usse response bhejte hain. `.listen(port)` server ko ek specific "darwaze" (port) pe chalu karta hai taaki requests receive kar sake.

## 11. Mental Model

Socho server ek **dukaan** hai:
- **Port (8000)** = dukaan ka address
- **`req`** = customer jo andar aake bata raha hai use kya chahiye (`req.url`)
- **`res`** = dukaandaar jo customer ko cheez de raha hai (`res.end(...)`)
- **Switch statement** = dukaandaar ka mann mein decision — "yeh maanga hai toh yeh dunga, woh maanga hai toh woh dunga, kuch samajh nahi aaya toh 404 bol dunga"
- **Log file** = dukaan ka register jisme har customer ki entry likhi jaati hai (kab aaya, kya maanga)