# Cookies aur Authentication Patterns — Cookies vs Headers

## 1. Cookie Kya Hai?

Simple definition: Cookie ek **chhota sa data (key-value pair)** hai jo **server browser mein store** karta hai — aur uske baad **har request ke saath browser khud-ba-khud** yeh cookie server ko wapas bhej deta hai.

```javascript
res.cookie("uid", token);
```

**Lame analogy:** cookie ek **hand-stamp** jaisa hai jo kisi club mein entry ke waqt lagta hai. Ek baar stamp lag gaya, tumhe baar baar ID dikhane ki zaroorat nahi — jab bhi tum club ke andar kisi counter pe jao, woh tumhare **haath ka stamp dekh leta hai** (browser khud cookie bhej deta hai, tumhe kuch karna nahi padta).

### Cookies Ki Khaasiyat
- Server set karta hai (`res.cookie(...)`)
- Browser **automatically** save kar leta hai
- Har request ke saath browser **khud** bhej deta hai — frontend code ko manually kuch attach nahi karna padta
- Sirf **browsers** mein kaam karta hai achhe se (mobile apps mein utna natural nahi)

---

## 2. Do Authentication Patterns — Cookie-Based vs Header-Based

Login ke baad, server ko **har agli request** pe pehचानना hota hai ki yeh request **kaun bhej raha hai**. Iske liye do common tarike hain:

| | Cookie-Based Auth | Header-Based Auth |
|---|---|---|
| Token kahan store hota hai | Browser cookie mein | Frontend khud manage karta hai (localStorage, memory) |
| Server pe kaise aata hai | Automatically (`req.cookies`) | Manually attach karna padta hai (`Authorization` header) |
| Best for | Traditional websites (SSR, EJS) | APIs, mobile apps, SPAs (React) |
| Security consideration | CSRF ka risk (agar theek se set na ho) | XSS ka risk (agar localStorage mein rakha ho) |

---

## 3. Method 1 — Cookie-Based Authentication

### Login Ke Waqt — Token Ko Cookie Mein Daalna
```javascript
async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({email, password});
    if (!user) return res.render("login", { error: "Invalid username or password" });

    const token = setUser(user);
    res.cookie("uid", token);   // ✅ cookie-based approach
    return res.redirect("/");
}
```

**Simple words:** `res.cookie("uid", token)` browser ko bolta hai — *"is token ko `uid` naam se save kar lo."* Ab jab bhi user is website pe koi request bhejega, browser **khud** yeh cookie attach kar dega.

### Verify Karte Waqt — Cookie Se Token Nikalna
```javascript
async function restrictToLoggedinUserOnly(req, res, next) {
    const userid = req.cookies?.uid;   // cookie se token nikala
    if(!userid) return res.redirect("/login");

    const user = getUser(userid);
    if(!user) return res.redirect("/login");

    req.user = user;
    next();
}
```

**Simple words:** `req.cookies?.uid` — yeh `req.cookies` object se `uid` naam wali cookie nikal raha hai. `?.` (optional chaining) use kiya hai taaki agar `req.cookies` khud hi `undefined` ho (cookie-parser middleware missing ho), toh crash na ho.

⚠️ **Zaroori:** `req.cookies` tabhi milta hai jab `cookie-parser` middleware lagaya ho:
```javascript
const cookieParser = require('cookie-parser');
app.use(cookieParser());
```

**Kab use karte hain?** Jab tumhara app **SSR (EJS jaisa)** hai, matlab browser directly pages request kar raha hai — cookies **natural fit** hain kyunki browser khud handle kar leta hai, koi extra frontend JS code nahi likhna padta.

---

## 4. Method 2 — Header-Based Authentication

### Login Ke Waqt — Token Seedha Response Mein Bhejna
```javascript
async function handleUserLogin(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({email, password});
    if (!user) return res.render("login", { error: "Invalid username or password" });

    const token = setUser(user);
    // res.cookie("uid", token);   ← yeh line comment ho gayi
    return res.json({ token });    // ✅ header-based approach — token seedha JSON mein bheja
}
```

**Simple words:** yahan cookie set nahi kiya — token seedha **response body mein** bhej diya. Ab yeh **frontend ki zimmedari** hai ki woh is token ko kahin store kare (jaise `localStorage`) aur **khud se** har request mein attach kare.

### Frontend Se Token Bhejna (Example)
```javascript
// Frontend code (React/JS) mein — token ko header mein manually daalna
fetch("/api/protected-route", {
    headers: {
        "Authorization": `Bearer ${token}`   // "Bearer" + space + actual token
    }
});
```

**`Bearer` kya hai?** Yeh ek **convention/standard** hai — batata hai ki yeh ek "bearer token" hai (jo bhi isse le jaaye, use "bearer" maana jaata hai — isliye security thoड़ी strict honi chahiye, jaise HTTPS use karna).

### Verify Karte Waqt — Header Se Token Nikalna
```javascript
async function restrictToLoggedinUserOnly(req, res, next) {
    const userid = req.headers["authorization"];   // header se poora string nikala
    if(!userid) return res.redirect("/login");

    const token = userid.split("Bearer ")[1];       // "Bearer" hata ke sirf token nikala
    const user = getUser(token);

    if(!user) return res.redirect("/login");
    req.user = user;
    next();
}
```

**Step by step:**
1. `req.headers["authorization"]` → poora header value milta hai, jaise: `"Bearer eyJhbGciOiJIUzI1NiIs..."`
2. `.split("Bearer ")[1]` → is string ko `"Bearer "` (Bearer + space) se **split** karke, **doosra part** (index `[1]`) liya — jo sirf **actual token** hai

```javascript
"Bearer eyJhbGciOiJIUzI1NiIs...".split("Bearer ")
// Result: ["", "eyJhbGciOiJIUzI1NiIs..."]
//          [0]              [1]
// isliye [1] liya — sirf token wala hissa
```

3. `getUser(token)` → wahi function jo pehle `auth.js` mein dekha tha — token verify karta hai

**Kab use karte hain?** Jab tumhara backend ek **pure REST API** hai jo React/mobile app jaise **alag frontend** ko serve karta hai — kyunki mobile apps mein cookies utni aasani se kaam nahi karti, aur APIs mein explicit control (headers) zyada common hai.

---

## 5. `checkAuth` vs `restrictToLoggedinUserOnly` — Farak Kya Hai?

```javascript
async function checkAuth(req, res, next) {
    const userid = req.headers["authorization"]
    const token = userid.split("Bearer ")[1];
    const user = getUser(token);

    req.user = user;   // agar user null bhi hai, phir bhi aage badha diya
    next();
}
```

**Simple words:** `checkAuth` sirf **check karta hai aur `req.user` set karta hai** — agar user login nahi hai (`user = null`), yeh **route ko block nahi karta**, bas `req.user` ko `null` chhoड़ ke aage badha deta hai. Route khud decide kar sakta hai ki `req.user` null hai toh kya karna hai.

```javascript
async function restrictToLoggedinUserOnly(req, res, next) {
    ...
    if(!user) return res.redirect("/login");   // yahan route BLOCK ho jaata hai
    req.user = user;
    next();
}
```

`restrictToLoggedinUserOnly` **strict middleware** hai — agar user login nahi hai, toh **turant redirect** kar deta hai, route tak pahुंचने ही नहीं देता।

**Lame analogy:**
- `restrictToLoggedinUserOnly` = ek **bouncer** jo bina wristband wale ko **andar hi nahi ghusने deta**
- `checkAuth` = ek **greeter** jo sabko andar jaane deta hai, lekin note kar leta hai kaun member hai aur kaun guest — aage ka decision counter pe hoga

**Use case:** `checkAuth` un routes ke liye useful hai jo **dono** (logged-in aur guest) users ko dikh sakte hain, lekin content thoda alag ho sakta hai (jaise "Welcome Kushal" vs "Welcome Guest"). `restrictToLoggedinUserOnly` un routes ke liye jahan **login zaroori** hai (jaise profile page, dashboard).

---

## 6. Poora Comparison — Tumhare Code Mein

| | Cookie-Based (Commented Out) | Header-Based (Active) |
|---|---|---|
| Login response | `res.cookie("uid", token)` + redirect | `res.json({ token })` |
| Token kaha jaata hai | Browser cookie (auto) | Frontend ko manually rakhna padta hai |
| Verify karne ka tarika | `req.cookies?.uid` | `req.headers["authorization"]` |
| Extraction | Seedha milta hai | `"Bearer "` se split karna padta hai |

Tumhare current code mein **header-based** approach active hai (`res.json({ token })` use ho raha hai), aur cookie wala part comment kiya hua hai — dono tarike ek hi codebase mein dikh rahe hain, jo comparison samajhne ke liye perfect example hai.

---

## 7. Real World Mein Kaunsa Use Karein?

| Situation | Recommended Approach |
|---|---|
| Traditional website (SSR, EJS, server-rendered pages) | Cookie-based (aasan, automatic) |
| REST API jo React/Mobile app serve karti hai | Header-based (explicit control) |
| Bahut secure application (banking, etc.) | Cookie with `httpOnly`, `secure` flags — JS se access nahi ho sakti, XSS se safe |
| Multiple domains/services access karni ho | Header-based — cookies cross-domain mein tricky hoti hain |

### Bonus — Secure Cookie Options (Aage Ke Liye)
```javascript
res.cookie("uid", token, {
    httpOnly: true,   // JavaScript se access nahi ho sakti (XSS se protection)
    secure: true,     // sirf HTTPS pe bhejी jayegi
    maxAge: 3600000,  // expiry time (ms mein)
});
```

---

## 8. One-Line Summary

**Cookies** = server browser mein data store karta hai, aur browser **khud** har request ke saath wapas bhejता hai — SSR apps ke liye natural fit. **Header-based auth (`Authorization: Bearer token`)** = token frontend khud manage karta hai aur **manually** har request mein attach karta hai — REST APIs/SPAs ke liye better. Dono ka goal same hai — server ko batana **"yeh request kis logged-in user ki hai"** — bas tareeka alag hai.

## 9. Mental Model

Socho ek **club** hai jo do tarike se entry allow karta hai:

- **Cookie-Based** = **hand-stamp** — ek baar lag gaya, andar jahan bhi jao counter automatically dekh leta hai, tumhe kuch nahi karna
- **Header-Based** = **membership card** jo tumhe **khud jeb mein rakhni** padti hai, aur har counter pe **khud dikhani** padti hai — thoda zyada manual, lekin zyada flexible (kisi bhi branch mein use kar sakte ho, sirf ek club tak limited nahi)

`restrictToLoggedinUserOnly` = bouncer jo card na hone pe entry hi nahi deta.
`checkAuth` = greeter jo sabko andar jaane deta hai, bas note kar leta hai member hai ya guest.