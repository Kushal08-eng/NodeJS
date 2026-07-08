# Server-Side Rendering (SSR) aur EJS — Notes

## 1. Server-Side Rendering (SSR) Kya Hai?

Simple definition: SSR ka matlab hai — **HTML page server pe hi tayaar hoke** browser ko bhej di jaati hai, poori bani banai — browser ko khud se JS chala ke content build nahi karna padta.

**Lame analogy:** socho ek **dukaan** hai jo do tarah se khana serve kar sakti hai:
- **SSR (Server-Side Rendering)** = dukaan mein hi **poori thali taiyaar** karke deti hai — tumhe ghar jaake kuch banane ki zaroorat nahi
- **CSR (Client-Side Rendering — React jaisa)** = dukaan sirf **raw ingredients** (JSON data) deti hai, tumhe (browser ko) khud khana banake plate mein sajana padta hai (JS se DOM banana)

```
SSR:  Server → poora HTML (ready) → Browser (bas dikhata hai)
CSR:  Server → sirf JSON data → Browser (JS chala ke HTML khud banata hai)
```

**Kyun use karte hain SSR?**
- Pehli baar page load fast lagta hai (poora HTML already ready hai)
- SEO ke liye better (search engines ko poora content mil jaata hai, JS chalane ki zaroorat nahi)
- Simple apps (jahan bahut zyada interactivity nahi chahiye) ke liye easy hai

---

## 2. EJS Kya Hai?

Simple definition: EJS (**Embedded JavaScript**) ek **templating engine** hai — isse HTML ke andar **JavaScript ka code mix** kar sakte ho, taaki dynamic data (jaise database se aaya data) HTML mein dikha sako.

```javascript
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"))
```

**Simple words, step by step:**
- `app.set("view engine", "ejs")` → Express ko batao ki **EJS use karna hai** templates render karne ke liye
- `app.set("views", path.resolve("./views"))` → batao ki **`.ejs` files kis folder mein hain** (yahan `views/` folder)

**Lame analogy:** normal HTML ek **fixed printed poster** hai — jo likha hai wahi dikhega, hamesha. EJS ek **fill-in-the-blanks form** hai — template mein jagah jagah blanks (`<%= %>`) hain, jinme server **actual data bharke** final HTML banata hai.

---

## 3. EJS Ke Tags — 3 Important Types

### `<%= %>` — Value Print Karna (Escaped)
```ejs
<p>URL Generated: http://localhost:8001/<%= id %></p>
```
**Simple words:** yeh JS variable ki **value ko HTML mein print** karta hai. `=` sign hai matlab — *"yahan is variable ki value dikhao."*

### `<% %>` — Sirf JS Logic Chalana (Kuch Print Nahi Hota)
```ejs
<% if (locals.id) { %>
   ...
<% } %>
```
**Simple words:** yeh sirf **JavaScript logic run** karta hai (if/else, loops) — khud se kuch print nahi karta. `if`, `for`, `forEach` jaisi cheezein yahan likhi jaati hain.

### `<%- %>` — Raw HTML Insert Karna (Unescaped)
*(is code mein use nahi hua, lekin important hai jaanna)*
```ejs
<%- someHtmlString %>
```
**Simple words:** `<%= %>` HTML characters ko **escape** kar deta hai (jaise `<b>` ko text ki tarah dikha dega, bold nahi karega — security ke liye safe). `<%- %>` **raw HTML** insert karta hai, bina escape kiye — sirf tabhi use karo jab data trusted ho (varna XSS attack ka risk).

---

## 4. Tumhare `home.ejs` Ka Breakdown

```ejs
<% if (locals.id) { %>
  <p>URL Generated: http://localhost:8001/<%= id %></p>
<% } %>
```

**Simple words:** yeh check kar raha hai — *"agar `id` naam ka variable server se bheja gaya hai, tabhi yeh paragraph dikhao."*

`locals.id` kyun likha, seedha `id` kyun nahi?
```ejs
<% if (locals.id) { %>   // ✅ safe — agar 'id' bheja hi nahi gaya, error nahi aayega
<% if (id) { %>          // ❌ agar 'id' bheja nahi gaya, ReferenceError aa sakta hai
```
**Simple words:** `locals` EJS ka ek **built-in object** hai jisme saare variables hote hain jo `res.render()` se bheje gaye. `locals.id` likhne se agar `id` exist nahi karta, toh bas `undefined` milega (safe), crash nahi hoga.

---

## 5. Form Se Data Bhejna

```ejs
<form method="POST" action="/url">
    <input type="text" name="url" placeholder="https://example.com" />
    <button type="submit">Generate</button>
</form>
```

**Simple words:** yeh normal HTML form hai — `method="POST"` aur `action="/url"` batate hain ki submit hone pe **`/url` route pe POST request** jaayegi, browser khud se page reload karke bhejta hai (koi JS/fetch nahi lagta — yeh purana, simple, SSR-style tarika hai).

`name="url"` input field ka naam hai — yeh backend mein `req.body.url` se milega:
```javascript
// controllers/url.js mein
const body = req.body;
if(!body.url) return res.status(400).json({error : 'url is required'});
```

⚠️ **Important:** iske kaam karne ke liye `express.urlencoded()` middleware hona zaroori hai (jo `index.js` mein already hai) — yeh HTML form ka data `req.body` mein convert karta hai.

---

## 6. Loop Chalana — `forEach` in EJS

```ejs
<% if (locals.urls) { %>
 <table>
    <tbody>
        <% urls.forEach((url, index) => { %>
        <tr>
         <td><%= index + 1 %></td>
         <td><%= url.shortId %></td>
         <td><%= url.redirectURL %></td>
         <td><%= url.visitHistory.length %></td>
        </tr>
        <% }) %>
    </tbody>
 </table>
<% } %>
```

**Simple words:** yeh bilkul normal JS `forEach` hai, bas HTML ke **beech mein** likha gaya hai. Har `url` object ke liye ek **naya table row (`<tr>`)** banta hai — data (`shortId`, `redirectURL`, clicks count) dynamically bhar diya jaata hai.

**Lame analogy:** yeh ek **printer** jaisa hai jo ek template (`<tr>...</tr>`) leta hai, aur database ke har record (`url`) ke liye **usi template ko baar baar print** karta hai, bas har baar data alag hota hai.

---

## 7. Server Se Data `res.render()` Ke Through Bhejna

### Example 1 — `staticRouter.js`
```javascript
router.get('/', async (req, res) => {
    const allurls = await URL.find({});
    return res.render('home', {
        urls: allurls,
    });
});
```

**Simple words:** `res.render(templateName, dataObject)` — yeh do kaam karta hai:
1. `home.ejs` file ko dhoondता hai `views/` folder mein
2. `{ urls: allurls }` jo data diya hai, usse template ke andar available kar deta hai — isliye `.ejs` file ke andar seedha `urls` variable use ho paaya

```
res.render('home', { urls: allurls })
                        ↓
home.ejs ke andar:  urls  (seedha access hota hai)
```

### Example 2 — `controllers/url.js`
```javascript
return res.render("home", {
    id: shortId,
});
```

**Simple words:** yahan `id` naam ka data bheja — isliye `home.ejs` mein `<%= id %>` use ho paaya us naye short URL ko dikhane ke liye.

**Important observation:** dono jagah **same template (`home`) use ho raha hai**, lekin **different data** ke saath — isliye `home.ejs` mein `locals.id` aur `locals.urls` dono ko `if` se check kiya gaya hai (kyunki kabhi `id` milega, kabhi `urls`, kabhi dono nahi).

---

## 8. Poora Flow — Ek Example (URL Shorten Karna)

```
1. User form fill karta hai (home.ejs) aur "Generate" click karta hai
2. Browser POST request bhejta hai /url pe (body: { url: "https://example.com" })
3. Express route (routes/url.js) → handleGenerateNewShortURL controller chalta hai
4. Controller ek shortId banata hai (shortid library se)
5. URL.create({...}) se MongoDB mein naya document save hota hai
6. res.render("home", { id: shortId }) → home.ejs ko naye id ke saath render kiya
7. Browser ko poora, ready-made HTML milta hai jisme naya short URL dikh raha hai
```

---

## 9. Redirect Route — Short URL Se Original URL Tak

```javascript
app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        { shortId },
        { $push: { visitHistory: { timestamp: Date.now() } } }
    );
    res.redirect(entry.redirectURL);
});
```

**Simple words:**
- `req.params.shortId` → URL se `shortId` nikala (jaise `localhost:8001/abc123` → `shortId = "abc123"`)
- `findOneAndUpdate` → us document ko dhoondha, aur **saath hi saath** `visitHistory` array mein ek naya click record `$push` kar diya (analytics ke liye)
- `res.redirect(entry.redirectURL)` → user ko **asli URL pe bhej diya** (jaise `https://google.com`)

**Isme SSR/EJS ka role nahi hai** — yeh sirf redirect hai, koi HTML render nahi ho rahi.

---

## 10. Quick Reference Table

| EJS Tag | Kaam |
|---|---|
| `<%= value %>` | Value print karo (escaped, safe) |
| `<%- value %>` | Raw HTML print karo (unescaped, risky agar untrusted data ho) |
| `<% code %>` | Sirf JS logic chalao (if, forEach) — kuch print nahi hota |
| `locals.varName` | Safe way to check agar variable diya gaya hai ya nahi |

| Express Setup | Kaam |
|---|---|
| `app.set("view engine", "ejs")` | EJS ko default templating engine banaya |
| `app.set("views", path)` | Batata hai `.ejs` files kahan hain |
| `res.render(name, data)` | Template ko data ke saath render karke HTML bhejta hai |

---

## 11. One-Line Summary

SSR ka matlab hai server hi poora HTML bana ke bhejta hai — EJS ek templating engine hai jisse HTML ke andar `<%= %>` (value print), `<% %>` (JS logic), aur `<%- %>` (raw HTML) tags use karke **dynamic data** (database se aaya) HTML mein dikhaya ja sakta hai. `res.render(template, data)` se server data ke saath template ko "fill" karke final HTML client ko bhejता hai.

## 12. Mental Model

Socho EJS ek **fill-in-the-blanks certificate** hai:

```
"Congratulations <%= name %>, you scored <%= marks %>!"
```

- **Template (`home.ejs`)** = certificate ka **printed design**, blanks ke saath
- **`res.render("home", { name, marks })`** = printer ko bolna — *"is design mein yeh values bharke print karo"*
- **Final HTML jo browser ko milta hai** = **poora bana banaya certificate**, blanks bhare hue

Browser ko sirf **final printed certificate** dikhta hai — usse yeh pata hi nahi chalता ki peeche EJS/template kaise kaam kar raha tha, use bas **ready HTML** mil jaata hai.