# JSON Web Token (JWT) — Notes

## 1. Problem Kya Thi? (JWT Se Pehle)

Yaad hai REST API rules mein padha tha — **"Stateless hona chahiye"**? Matlab server ko yaad nahi rehna chahiye ki tum kaun ho, har request apne aap mein complete honi chahiye.

Toh sawaal: agar user **login** kar le, toh **agli request pe server ko kaise pata chalega ki yeh wahi user hai**?

**Purana tarika (Sessions):** server apni memory/database mein har logged-in user ka record rakhta tha. Lakhon users ho, toh server ko sabki memory rakhni padegi — **heavy, non-scalable**.

---

## 2. JWT Kya Hai?

**JWT = JSON Web Token**

Simple definition: JWT ek **digital ID card** hai jo server login hone pe user ko de deta hai. Uske baad, har request mein user yeh card **dikhata** hai, aur server bina apni memory check kiye **verify** kar leta hai ki card asli hai ya nakli.

```
Login → Server: "yeh lo tumhara JWT token"
Har agli request → User: "yeh mera token hai" → Server: "verify kiya, sahi hai, tum Kushal ho"
```

**Lame analogy:** socho ek **concert** hai. Entry pe ek **wristband** milta hai (JWT). Poore concert mein jahan bhi jao, security bas wristband dekh leti hai — dobara ID check nahi karti, na kisi list mein naam dhoondती hai. Wristband hi kaafi hai, kyunki woh **fake-proof** hai (uspe security ka hologram/signature hai).

---

## 3. JWT Ke 3 Parts

Ek JWT token dikhta kuch aisa hai:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsIm5hbWUiOiJLdXNoYWwifQ.4f8s9d8f7s6d5f4s3d2f1s
```
3 parts, `.` se separate: **HEADER . PAYLOAD . SIGNATURE**

### Header — Algorithm Ka Naam
```json
{ "alg": "HS256", "typ": "JWT" }
```

### Payload — Actual Data
```json
{ "_id": "123", "email": "kushal@x.com" }
```
**Simple words:** yeh user ki info hai jo tum token mein daalte ho.

⚠️ **Important:** Payload sirf **encode** hota hai, **encrypt nahi** — koi bhi decode karke padh sakta hai (secret nahi hai). Isliye **password jaisa sensitive data payload mein kabhi mat daalna**.

### Signature — Fake-Proof Karne Wala Hissa
```
HMACSHA256(header + payload, SECRET_KEY)
```
**Simple words:** server ek **secret key** (sirf server jaanta hai) use karke header+payload ka signature banata hai. Agar token ke andar ka data chhed-chhad kiya gaya, toh signature match nahi karega — server turant pakड़ लेगा *"yeh fake/tampered token hai."*

---

## 4. Hum JWT Kyun Use Karte Hain? (Core Reasons)

1. **Stateless** — server ko har user ka session yaad nahi rakhna padta, scaling aasan
2. **Fast Verification** — database check nahi karna, sirf signature match karna
3. **Cross-service use** — alag alag services mein token verify ho sakta hai jab tak secret key same hai
4. **Frontend/Mobile friendly** — headers/cookies mein easily bhej sakte ho

---

## 5. Ab Dekhte Hain — Tumhare Real Code Mein JWT Kaise Kaam Kar Raha Hai

### `auth.js` — Token Banane Aur Verify Karne Ka Logic

```javascript
const jwt = require("jsonwebtoken");
const secret = "Kushal@123456"
```

**Simple words:** `secret` ek **private key** hai — sirf server ko pata hai. Isi se token sign (banaya) aur verify hota hai. Yeh wahi "hologram banane wali machine" hai jo pehle analogy mein bataya tha.

⚠️ **Real project mein yeh hardcode nahi karte** — `.env` file mein rakhna chahiye:
```javascript
const secret = process.env.JWT_SECRET;
```

---

### `setUser()` — Naya Token Banana (`jwt.sign()`)

```javascript
function setUser(user) {
    return jwt.sign({
        _id: user._id,
        email: user.email,
    }, secret);
}
```

**Simple words:** yeh function **naya wristband (token) banata** hai. `jwt.sign(payload, secret)`:
- **Payload** = `{ _id, email }` — user ki basic info jo token ke andar store hogi
- **Secret** = signature banane ke liye

**Kya return hota hai?** Ek **string token** (jaise upar dikhaya gaya `eyJhbG...` wala format).

⚠️ **Chhota improvement possible hai:** abhi token **kabhi expire nahi hoga** — real projects mein `expiresIn` add karna best practice hai:
```javascript
jwt.sign({ _id: user._id, email: user.email }, secret, { expiresIn: "1h" });
```
Isse token 1 ghante baad **khud invalid** ho jayega — security ke liye achha hai (agar token chori ho jaaye, toh hamesha ke liye valid nahi rahega).

---

### `getUser()` — Token Verify Karna (`jwt.verify()`)

```javascript
function getUser(token) {
    if(!token) return null;
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
}
```

**Simple words:**
- Agar `token` hi nahi diya gaya → seedha `null` return
- `jwt.verify(token, secret)` → token ko secret key se verify karta hai
  - Agar token **valid hai** (tamper nahi hua, expire nahi hua) → payload wapas milta hai (`{ _id, email }`)
  - Agar token **invalid/tampered/expired hai** → error throw hota hai, isliye `try/catch` mein wrap kiya gaya hai, aur error aane pe `null` return kar diya

**Lame analogy:** yeh security guard ka kaam hai — wristband dikhaya, guard check karta hai hologram sahi hai ya nahi. Sahi hai toh andar jaane do (payload return), nakli hai toh mana kar do (`null`).

---

## 6. `controllers/user.js` — Login/Signup Mein Use Hona

### Signup — Naya User Banana
```javascript
async function handleUserSignup(req, res) {
    const { name, email, password } = req.body;
    await User.create({ name, email, password });
    return res.redirect("/");
}
```
**Simple words:** yeh sirf naya user database mein bana raha hai — abhi **JWT ka koi role nahi** hai signup mein (kyunki naya user hai, login nahi kiya).

⚠️ **Security note (samajhne ke liye important):** password yahan **plain text** mein directly save ho raha hai — real projects mein password ko **hash** karna chahiye (bcrypt library se) pehle save karne se pehle. Abhi ke liye seekhne ka stage hai, toh theek hai, lekin production mein yeh **bada security risk** hoga.

---

### Login — JWT Yahan Use Hota Hai
```javascript
async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({email, password});
    if (!user)
        return res.render("login", {
            error: "Invalid username or password",
        });
    const token = setUser(user);
    res.cookie("uid", token);
    return res.redirect("/");
}
```

**Step by step:**

1. `User.findOne({email, password})` → database mein check kiya ki yeh email-password combination match karta hai koi user se
2. Agar **user nahi mila** → login form pe wapas bhej diya, error message ke saath
3. Agar **user mil gaya** → `setUser(user)` call kiya — yeh **naya JWT token banata hai** us user ke `_id` aur `email` ke saath (yehi upar `auth.js` mein dekha tha)
4. `res.cookie("uid", token)` → **token ko browser ke cookie mein store** kar diya, naam diya `"uid"`
5. `res.redirect("/")` → user ko home page pe bhej diya

**Lame analogy:** yeh poora login process concert ke entry gate jaisa hai — ID (email/password) dikhayi, security ne verify kiya, sahi nikla toh **wristband (JWT token) haath pe bandh diya** (cookie mein daal diya), ab tum concert (website) ke andar ghoom sakte ho.

---

## 7. `res.cookie()` — Token Ko Browser Mein Store Karna

```javascript
res.cookie("uid", token);
```

**Simple words:** yeh Express ka method hai jo **browser ko bolta hai** — *"yeh cookie apne paas save kar lo, naam `uid`, value yeh token."* Ab **har agli request** mein browser **khud-ba-khud** yeh cookie server ko bhej dega — bina manually kuch likhe.

```
Browser → Server: Cookie: uid=eyJhbGciOiJIUzI1NiIs...
```

**Aage kaise use hoga (agla step, abhi code mein nahi hai):**
```javascript
// Middleware jo aane wali cookie se user nikalega
const { getUser } = require("../service/auth");

function checkAuth(req, res, next) {
    const token = req.cookies.uid;
    const user = getUser(token);
    req.user = user;   // req object mein user daal diya, aage sab jagah accessible
    next();
}
```

*(Iske liye `cookie-parser` middleware install karna padega taaki `req.cookies` mil sake — abhi tumhare code mein yeh middleware add nahi hai.)*

---

## 8. Poora Flow — Ek Nazar Mein (Tumhare Code Ke Hisaab Se)

```
1. User signup form bharta hai → handleUserSignup → naya user DB mein save
2. User login form bharta hai (email, password)
3. handleUserLogin → DB mein user dhoondha
4. Agar mila → setUser(user) → JWT token banaya (auth.js se)
5. res.cookie("uid", token) → token browser mein save ho gaya
6. Agli har request mein browser yeh cookie automatically bhejega
7. Server getUser(token) se verify karke pata laga sakta hai yeh request kis user ki hai
   (bina dobara database check kiye, sirf token verify karke)
```

---

## 9. Quick Reference Table

| Function/Method | Kaam |
|---|---|
| `jwt.sign(payload, secret)` | Naya token banata hai |
| `jwt.verify(token, secret)` | Token verify karta hai, payload return karta hai ya error deta hai |
| `res.cookie(name, value)` | Browser mein cookie set karta hai (token store karne ke liye) |
| `req.cookies` | Aane wali cookies padhne ke liye (cookie-parser middleware chahiye) |

---

## 10. Improvements Jo Aage Add Kar Sakte Ho

1. `expiresIn` add karna `jwt.sign()` mein — token hamesha ke liye valid nahi rehna chahiye
2. Password ko **hash** karna (bcrypt se) — abhi plain text mein save ho raha hai
3. `cookie-parser` middleware add karna — taaki `req.cookies` se token padh sako
4. Ek **auth middleware** banana jo har protected route pe check kare ki user logged in hai ya nahi (`getUser()` use karke)

---

## 11. One-Line Summary

JWT ek self-contained digital ID card hai — `jwt.sign()` se banta hai (payload + secret se signature), aur `jwt.verify()` se check hota hai ki token asli hai ya tampered. Login hone pe token **cookie mein store** ho jaata hai (`res.cookie`), aur agli har request mein yeh token server ko batata hai **kaun request bhej raha hai** — bina server ko har user ka record apni memory mein rakhne ki zaroorat ke.

## 12. Mental Model

- **`setUser()`** = naya wristband banana (login ke waqt)
- **`getUser()`** = wristband check karna (security guard ka kaam)
- **`secret`** = wristband ka hologram banane wali secret machine (sirf server ke paas)
- **`res.cookie("uid", token)`** = wristband user ke haath pe bandh dena
- **Har agli request** = user apna wristband dikhata hai, security verify karti hai, andar jaane deti hai