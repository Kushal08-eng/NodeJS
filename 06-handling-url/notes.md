# Node.js URL Handling — Notes (Query Parameters)

## 1. `url` Module Kya Hai?

Simple definition: `url` ek **built-in Node.js module** hai jo `req.url` jaisi **raw string** ko todke ek **organized object** mein badal deta hai — taaki uske andar se path, query parameters, etc. easily nikaal sakein.

```javascript
const url = require("url");
```

**Kyun zaroori hai?** Kyunki `req.url` sirf ek plain string hoti hai:
```
req.url = "/about?myname=Kushal&age=20"
```
Isse manually todna (split karna) mushkil aur error-prone hota — `url` module yeh kaam khud kar deta hai.

---

## 2. Favicon Request Ko Ignore Karna

```javascript
if(req.url === '/favicon.ico') return res.end();
```

**Simple words:** Jab bhi tum browser mein koi site kholte ho, browser **automatically** ek extra request bhejta hai `/favicon.ico` ke liye — yeh woh chota icon hota hai jo browser tab mein dikhta hai.

Agar iske liye alag se koi handling na ho, toh yeh bhi tumhare switch statement mein chala jaayega aur "404 Not Found" jaisa response degа, aur galti se **log file mein bhi entry ban jayegi** (extra, useless log).

Isliye yeh line sabse pehle check kar leti hai — agar request `/favicon.ico` ke liye hai, toh **turant khaali response bhej ke ruk jao** (`return res.end()`), aage ka code (logging, switch, etc.) chalega hi nahi.

**Lame analogy:** yeh ek **bouncer** jaisa hai jo entry gate pe hi bol deta hai "tu andar mat aa" — bina baaki system ko disturb kiye.

---

## 3. URL Ko Parse Karna — `url.parse()`

```javascript
const myUrl = url.parse(req.url, true);
console.log(myUrl);
```

**Simple words:** `url.parse()` raw URL string ko **todke ek object** mein convert kar deta hai, jisme alag alag pieces already separate ho chuke hote hain.

Agar user ne yeh URL khola:
```
/about?myname=Kushal&age=20
```

Toh `myUrl` object kuch aisa dikhega:
```javascript
{
  pathname: '/about',
  query: { myname: 'Kushal', age: '20' },
  // aur bhi kaafi properties (search, href, etc.)
}
```

### Doosra argument `true` kyun diya?

```javascript
url.parse(req.url, true)
//                 ^^^^ yeh important hai!
```

Agar `true` na do, toh `query` ek **plain string** milegi:
```javascript
query: "myname=Kushal&age=20"   // ❌ manually parse karna padega
```

`true` dene se `query` seedha ek **object** ban jaata hai:
```javascript
query: { myname: "Kushal", age: "20" }   // ✅ seedha use kar sakte ho
```

**Lame analogy:** `true` bolna aisa hai jaise tum kisi se bologe *"is chitthi ko sirf padh ke mat de do, usme jo alag alag points hain unhe list bana ke do."*

---

## 4. `pathname` vs Poora URL

```javascript
switch(myUrl.pathname){
```

**Simple words:** pehle hum `req.url` seedha switch mein use kar rahe the — lekin agar URL mein query parameters ho (`/about?myname=Kushal`), toh `req.url` poora **`/about?myname=Kushal`** hoga, na ki sirf `/about`. Isse switch case match hi nahi karega!

Isliye `myUrl.pathname` use karte hain — yeh **sirf path wala hissa** deta hai, query parameters ke bina:
```
req.url        = "/about?myname=Kushal"
myUrl.pathname = "/about"                  ✅ isse switch match karega
myUrl.query    = { myname: "Kushal" }      ✅ yeh alag se milega
```

---

## 5. Query Parameters Nikaalna — `myUrl.query`

### Example 1 — `/about` route
```javascript
case '/about' : 
    const username = myUrl.query.myname;
    console.log(username);
    res.end(`Hii,  ${username}`);
break;
```

**Simple words:** agar user ne URL kholi:
```
http://localhost:8000/about?myname=Kushal
```
Toh:
- `myUrl.pathname` = `/about` → switch case match hua
- `myUrl.query.myname` = `"Kushal"` → yeh query object se nikala
- Response: `"Hii, Kushal"`

### Example 2 — `/search` route
```javascript
case "/search":
    const search = myUrl.query.search_query;
    console.log(search);
    res.end("Here are your result for "+search);
    break;
```

Agar URL ho:
```
http://localhost:8000/search?search_query=javascript
```
Toh:
- `myUrl.query.search_query` = `"javascript"`
- Response: `"Here are your result for javascript"`

**Lame analogy:** query parameters aise hain jaise ek **form** jo URL ke saath attach ho — `?myname=Kushal&age=20` matlab do fields fill ki gayi hain: `myname` aur `age`. `myUrl.query` seedha woh fill ki hui form ka object de deta hai.

---

## 6. Poora Flow — Ek Example Ke Saath

Maan lo user yeh URL kholta hai:
```
http://localhost:8000/search?search_query=nodejs
```

```
1. Request server tak pahुंचती hai
2. req.url = "/search?search_query=nodejs"
3. favicon check → nahi hai, aage badho
4. Log line banti hai, log.txt mein likha jaata hai
5. myUrl = url.parse(req.url, true)
   → myUrl.pathname = "/search"
   → myUrl.query = { search_query: "nodejs" }
6. switch(myUrl.pathname) → "/search" case match hua
7. search = myUrl.query.search_query = "nodejs"
8. res.end("Here are your result for nodejs")
```

---

## 7. Quick Reference Table

| Cheez | Kaam | Example |
|---|---|---|
| `url.parse(req.url, true)` | Raw URL string ko object mein todta hai | `{ pathname, query, ... }` |
| `myUrl.pathname` | Sirf path (query ke bina) | `/about` |
| `myUrl.query` | Query parameters ka object | `{ myname: "Kushal" }` |
| `myUrl.query.paramName` | Ek specific query value nikalna | `myUrl.query.myname` → `"Kushal"` |

---

## 8. One-Line Summary

`url.parse(req.url, true)` raw URL string ko todke ek object banata hai jisme `pathname` (sirf path) aur `query` (URL ke `?key=value` wale parameters, object ke form mein) alag alag mil jaate hain — isse routing (`switch`) aur query data dono easily handle ho jaate hain.

## 9. Mental Model

Socho URL ek **address chitthi** hai:
```
/about?myname=Kushal&age=20
```
- **`pathname`** (`/about`) = chitthi ka **address** — kis dukaan pe jaana hai
- **`query`** (`{myname: "Kushal", age: "20"}`) = chitthi ke andar likha **message/form** — extra details jo tumne bheji hain

`url.parse(..., true)` dono cheezein alag-alag nikaal ke deta hai, taaki tum address ke hisaab se route decide karo, aur message (query) ke data ko response mein use karo.