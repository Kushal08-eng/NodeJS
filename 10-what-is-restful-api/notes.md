# API aur RESTful API — Short Notes

## 1. API Kya Hai? (Recap, Short Mein)

Simple definition: API ek **waiter** hai — tum (client/frontend) seedha kitchen (server/database) mein nahi jaate, waiter (API) se maangte ho, woh andar se le ke aata hai.

```javascript
fetch("https://api.example.com/users")
  .then(res => res.json())
  .then(data => console.log(data));
```

**API = Application Programming Interface** — ek controlled "darwaza" jisse alag alag apps/programs ek doosre se data maang sakte hain, bina seedha andar ghuse.

---

## 2. RESTful API Kya Hai?

Simple definition: REST ek **set of rules/style** hai jo batata hai ki API kaise **design** karna chahiye — taaki woh clean, predictable, aur samajhne mein aasan ho.

**REST = REpresentational State Transfer**

**Lame analogy:** REST aisa hai jaise dukaan chalane ka ek **standard tareeka** — har dukaan alag naam se chal sakti hai, lekin agar sab REST ke rules follow karein, toh koi bhi customer bina confusion ke samajh jayega kaise order karna hai, kaise return karna hai, etc.

Jo API REST ke rules follow karti hai, use **RESTful API** kehte hain.

---

## 3. REST Ke Rules (Short Mein)

### Rule 1 — Resources Ko URL Se Represent Karo (Nouns, Not Verbs)

**Simple words:** URL mein **cheez (resource) ka naam** hona chahiye, kaam (verb) nahi.

```
✅ GET /users          → sahi (noun: "users")
❌ GET /getAllUsers     → galat (verb: "get")

✅ POST /users          → sahi
❌ POST /createUser     → galat
```

**Lame analogy:** URL ek dukaan ka **section board** hai — "Fruits Section", "Dairy Section" (nouns), na ki "Go Buy Fruits Section" (verb). Kya karna hai (buy, sell, return) yeh **HTTP method** batata hai, URL nahi.

---

### Rule 2 — HTTP Methods Se "Kaam" Batao (GET, POST, PUT, PATCH, DELETE)

**Simple words:** URL sirf batata hai **kis cheez ke baare mein** baat ho rahi hai, aur HTTP method batata hai **kya karna hai** us cheez ke saath.

```
GET    /users        → sab users dekhna (read)
POST   /users        → naya user banana (create)
PUT    /users/1      → user ka poora data update karna
PATCH  /users/1      → user ka thoda data update karna
DELETE /users/1      → user delete karna
```

Same URL (`/users`), lekin method badalte hi kaam badal jaata hai — yehi REST ka core idea hai.

---

### Rule 3 — Stateless Hona Chahiye

**Simple words:** har request **apne aap mein complete** honi chahiye — server ko pichli request yaad nahi rehni chahiye.

```
❌ Galat soch: "Pehli request mein login kiya tha, isliye server ko yaad hai main kaun hoon"
✅ Sahi soch: "Har request mein token/auth info bhejo, server har baar fresh verify karega"
```

**Lame analogy:** ek dukaan mein har baar jaake apna ID dikhana padta hai (jaise token/auth header) — dukaandaar tumhe "yaad" nahi rakhta pichli visit se. Har visit **independent** hai.

**Kyun zaroori hai?** Kyunki server ko lakhon users ki "memory" nahi rakhni padegi — har request khud mein complete info leke aayegi (jaise JWT token). Isse server **scale** karna aasan ho jaata hai.

---

### Rule 4 — Nested Resources Ke Liye Proper Hierarchy

**Simple words:** agar ek resource doosre ke andar hai (jaise ek user ke posts), toh URL mein woh relationship dikhni chahiye.

```
GET /users/1/posts        → user 1 ke saare posts
GET /users/1/posts/5      → user 1 ka specific post (id=5)
```

**Lame analogy:** yeh aisa hai jaise **folder ke andar sub-folder** — `users/1/posts` matlab "user 1" ke folder ke andar "posts" folder.

---

### Rule 5 — Consistent Response Format (Usually JSON)

**Simple words:** response ka format **hamesha same tarah ka** hona chahiye, taaki client ko pata ho kya expect karna hai.

```json
{
  "success": true,
  "data": { "id": 1, "name": "Kushal" },
  "message": "User fetched successfully"
}
```

Agar error aaye, toh bhi similar structure follow karo:
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### Rule 6 — Proper Status Codes Use Karo

**Simple words:** response ke saath sirf data nahi, ek **status code** bhi bhejo jo batata hai kya hua — success, error, ya kuch aur.

| Status Code | Matlab |
|---|---|
| `200` | Sab theek, success |
| `201` | Naya resource create hua (POST ke baad) |
| `400` | Client ne galat data bheja (Bad Request) |
| `401` | Login/auth zaroori hai (Unauthorized) |
| `404` | Resource nahi mila (Not Found) |
| `500` | Server mein kuch galat hua (Internal Server Error) |

```javascript
res.status(404).json({ success: false, message: "User not found" });
```

---

## 4. Quick Reference — REST Rules Ek Nazar Mein

| Rule | Kya Kehta Hai |
|---|---|
| Nouns in URL | `/users` (resource), na ki `/getUsers` (verb/action) |
| HTTP methods | GET/POST/PUT/PATCH/DELETE se "kaam" decide karo |
| Stateless | Har request apne aap mein complete honi chahiye |
| Nested resources | `/users/1/posts` jaisi hierarchy follow karo |
| Consistent format | Response hamesha same structure mein (JSON) |
| Status codes | Sahi HTTP status code bhejo (200, 404, 500, etc.) |

---

## 5. One-Line Summary

API = data maangne/bhejne ka darwaza. RESTful API = us darwaze ko design karne ka **standard style** — URLs mein nouns (resources), HTTP methods se kaam batao, stateless raho, aur consistent response + status codes do — taaki koi bhi developer bina confusion ke tumhari API use kar sake.

## 6. Mental Model

Socho REST rules ek **restaurant menu ka format** hain:
- **URL (noun)** = menu item ka naam (e.g. "Pizza")
- **HTTP method** = kya karna hai us item ke saath — order karna (POST), dekhna (GET), cancel karna (DELETE)
- **Stateless** = har order independent hai, waiter tumhe pichli visit se yaad nahi rakhta
- **Status code** = order confirm hua ya reject hua, uska signal
- **Consistent format** = har bill same tarike se print hota hai, chahe kuch bhi order karo