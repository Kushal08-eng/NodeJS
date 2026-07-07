# HTTP Headers — Notes

## 1. HTTP Header Kya Hai?

Simple definition: Header ek **extra info** hai jo request/response ke saath **chupke se** jaati hai — actual data (body) ke alawa, "meta information" (jaise: yeh data kis format mein hai, kaun bhej raha hai, permission hai ya nahi).

**Lame analogy:** socho tum ek **courier parcel** bhej rahe ho. Parcel ke andar jo cheez hai woh **body** hai. Lekin parcel ke bahar jo label chipka hai — "Fragile", "Sender: Kushal", "Weight: 2kg", "Address" — yeh sab **headers** hain. Parcel khulne se pehle hi yeh info mil jaati hai.

```
Request/Response
├── Headers  → extra info (meta data)
└── Body     → actual data
```

---

## 2. Headers Kaise Dikhte Hain (Format)

Headers hamesha **key-value pairs** ki tarah hote hain:

```
Content-Type: application/json
Authorization: Bearer abc123token
User-Agent: Mozilla/5.0
```

Express mein access karne ke liye:
```javascript
app.get('/api/users', (req, res) => {
    console.log(req.headers);                    // saare headers (object)
    console.log(req.headers['content-type']);     // ek specific header
});
```

---

## 3. Request Headers — Client Se Server Ko

Yeh headers **client (browser/Postman/app)** bhejta hai server ko, request ke saath.

### `Content-Type`
Batata hai **body kis format mein hai**.
```
Content-Type: application/json
```
**Simple words:** server ko pata chal jaata hai ki jo data aaya hai woh JSON hai, taaki woh sahi tareeke se parse kar sake.

```
Content-Type: application/json         → JSON data
Content-Type: application/x-www-form-urlencoded  → HTML form data
Content-Type: multipart/form-data       → files/images upload
```

### `Authorization`
User ki **identity/permission** batata hai.
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```
**Simple words:** yeh ek "entry pass" jaisa hai — token (jaise JWT) yahan bheja jaata hai taaki server verify kare ki user login hai ya nahi.

**Lame analogy:** jaise club mein entry ke liye wristband dikhana padta hai — `Authorization` header wahi wristband hai.

### `User-Agent`
Batata hai request **kaunse device/browser se** aayi.
```
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0
```

### `Accept`
Client batata hai **kaunsa response format** chahiye.
```
Accept: application/json
```

---

## 4. Response Headers — Server Se Client Ko

Yeh headers **server** bhejta hai response ke saath, client ko.

### `Content-Type` (response mein bhi hota hai)
```
Content-Type: application/json
```
**Simple words:** server bata raha hai ki jo response bhej raha hai woh JSON hai (isliye Express ka `res.json()` yeh automatically set kar deta hai).

### `Content-Length`
```
Content-Length: 348
```
Response body ka size (bytes mein) — client ko pata chal jaata hai kitna data download hone wala hai.

### `Set-Cookie`
```
Set-Cookie: sessionId=abc123; HttpOnly
```
**Simple words:** server client ke browser mein ek **cookie set** karta hai — login session yaad rakhne ke liye common tarika.

### `Cache-Control`
```
Cache-Control: no-cache
```
Batata hai response ko **browser cache mein rakhein ya nahi**, aur kitni der tak.

---

## 5. Custom Headers Banana (Express Mein)

```javascript
app.get('/api/users', (req, res) => {
    res.set('X-My-Custom-Header', 'Hello from server');
    res.json(users);
});
```

**Simple words:** tum apna **khud ka header** bhi bana sakte ho — normally custom headers ke naam `X-` se start karte hain (convention, zaroori nahi), taaki pata chale yeh koi standard header nahi hai.

---

## 6. Express Mein Headers Read Karna

```javascript
app.use((req, res, next) => {
    console.log(req.headers);                  // saare headers
    console.log(req.headers.authorization);     // specific header
    console.log(req.get('Content-Type'));       // alternative tarika
    next();
});
```

**Lame analogy:** yeh middleware wahi checkpoint hai jo pichle notes mein padha tha — yahan hum parcel ke **label** (headers) padh rahe hain, khol ne se pehle hi.

---

## 7. CORS Headers — Ek Common Real-World Example

Jab frontend (React, `localhost:3000`) aur backend (`localhost:8000`) **alag alag ports/domains** pe chal rahe hote hain, browser by default request block kar deta hai security ki wajah se — isko **CORS** (Cross-Origin Resource Sharing) issue kehte hain.

```javascript
res.set('Access-Control-Allow-Origin', '*');
```
**Simple words:** yeh header server se bola jaata hai — *"koi bhi origin (website) mujhse data maang sakti hai"* (`*` = sab allowed). Real projects mein `cors` naam ki library use karte hain isse aasan banane ke liye.

**Lame analogy:** socho ek dukaan sirf apne shehar ke logon ko saaman deti thi (same-origin policy). CORS header lagana matlab dukaan bol rahi hai — *"bahar ke shehar wale bhi aa sakte hain ab"* (`Access-Control-Allow-Origin`).

---

## 8. Quick Reference Table — Common Headers

| Header | Kis Taraf | Matlab |
|---|---|---|
| `Content-Type` | Request + Response | Data kis format mein hai (JSON, form, etc.) |
| `Authorization` | Request | Login token/permission |
| `User-Agent` | Request | Kaunsa browser/device request bhej raha hai |
| `Accept` | Request | Client ko kaunsa response format chahiye |
| `Content-Length` | Response | Response body ka size |
| `Set-Cookie` | Response | Browser mein cookie set karna (session, login) |
| `Cache-Control` | Response | Response cache ho ya nahi |
| `Access-Control-Allow-Origin` | Response | CORS — kaunse domains se request allow hai |

---

## 9. One-Line Summary

Headers = request/response ke saath jaane wali **extra info** (meta data) — jaise data ka format (`Content-Type`), login permission (`Authorization`), ya CORS rules — jo actual body/data se **alag** hote hain, aur server/client ko batate hain ki data ko **kaise handle karna hai**.

## 10. Mental Model

Socho headers ek **courier parcel ka label** hain:

- **`Content-Type`** = "Isme kya hai" (fragile item, liquid, electronics)
- **`Authorization`** = "Kaun bhej raha hai, valid ID ke saath"
- **`Content-Length`** = "Weight kitna hai"
- **`Set-Cookie`** = "Return address label chipka do, agli baar pehchan lena"
- **`Access-Control-Allow-Origin`** = "Kaunse shehar se yeh parcel accept karna hai"

Body = parcel ke **andar ka saaman**. Headers = parcel ke **bahar ka label** — jisse bina khole hi pata chal jaata hai kya karna hai us parcel ke saath.