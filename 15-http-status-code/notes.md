# HTTP Status Codes — Notes

## 1. Status Code Kya Hai?

Simple definition: Status code ek **3-digit number** hai jo server response ke saath bhejta hai — batata hai ki request ka **kya result** hua (success, error, ya kuch aur).

```javascript
res.status(404).json({ error: 'User Not found' });
```

**Lame analogy:** status code ek **traffic signal** jaisa hai — green (success), yellow (kuch aur karna padega), red (error/problem). Sirf number dekh ke hi pata chal jaata hai kya hua, poora message padhne ki zaroorat nahi.

---

## 2. Status Codes Ke 5 Categories (Overview)

| Range | Naam | Matlab |
|---|---|---|
| **1xx** | Informational | Request mil gayi, process ho rahi hai (rarely use hota hai) |
| **2xx** | Success | Sab theek, kaam ho gaya |
| **3xx** | Redirection | Kahin aur jao, yeh yahan nahi hai |
| **4xx** | Client Error | Client ne galti ki (galat data, permission nahi, etc.) |
| **5xx** | Server Error | Server mein hi kuch toot gaya |

---

## 3. 2xx — Success (Is Code Mein Use Hue)

### `200 OK` (Default)
```javascript
app.get('/api/users', (req, res) => {
    return res.json(users);   // status code automatically 200 hota hai
});
```
**Simple words:** agar tum `res.status()` explicitly nahi likhte, Express **khud hi `200`** laga deta hai — matlab *"sab theek hai, yeh lo response."*

### `201 Created`
```javascript
return res.status(201).json({status: "sucess", id:users.length});
```
**Simple words:** jab **naya resource successfully bana** ho (jaise naya user create hua), `200` ki jagah `201` bhejna sahi practice hai — yeh specifically bolta hai *"kuch NAYA bana hai."*

**Lame analogy:** `200` = "haan mil gaya", `201` = "haan bana diya gaya" (dono success hain, lekin `201` zyada specific hai — batata hai kuch naya add hua).

---

## 4. 4xx — Client Errors (Is Code Mein Use Hue)

Yeh errors tab aate hain jab **client (jo request bhej raha hai)** ne kuch galat kiya ho — galat data, missing fields, wrong ID, etc.

### `400 Bad Request`
```javascript
if(!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title){
    return res.status(400).json({msg: 'ALl fields are required'});
}
```
**Simple words:** client ne request bheji, lekin **zaroori data missing/galat** hai. Server bol raha hai — *"jo tumne bheja hai, woh incomplete/galat hai, main process nahi kar sakta."*

**Lame analogy:** jaise koi form submit kiya jisme naam wala box khaali chhoda — form wapas mil jaata hai "yeh field bharo" ke saath.

### `404 Not Found`
```javascript
if(!user) return res.status(404).json({error : 'User Not found'});
```
**Simple words:** jo resource client maang raha hai, woh **exist hi nahi karta** (jaise galat `id` diya). Server bol raha hai — *"jo tum dhoond rahe ho, woh yahan hai hi nahi."*

⚠️ **Chhota bug is code mein:**
```javascript
if(!user) return req.status(404).json({error : 'User Not found'});
//              ^^^ galat — yeh 'req' hai, 'res' hona chahiye
```
`req` (request object) pe `.status()` method hota hi nahi — yeh **crash** karega. Sahi tarika:
```javascript
if(!user) return res.status(404).json({error : 'User Not found'});
//              ^^^ res — sahi
```

---

## 5. 5xx — Server Errors (Code Mein Comment Ke Roop Mein Mention)

```javascript
// 500 server error
// const user = users.find(user => user[0].id === id);
```

### `500 Internal Server Error`
**Simple words:** jab **server ke andar hi kuch galat ho jaaye** — bug, crash, unexpected error — client ki koi galti nahi hoti, phir bhi request fail ho jaati hai.

Is comment mein example diya hai: `user[0].id` — yeh galat code hai (`user` already ek single object hai `.find()` se, uspe `[0]` lagana error dega) — agar yeh chal jaata, toh server crash karke `500` jaisa error deta.

**Lame analogy:** `400`/`404` = customer ne galat order diya ya jo maanga woh menu mein nahi hai (customer ki galti). `500` = kitchen mein hi aag lag gayi (dukaan ki galti, customer ka isme koi role nahi).

```javascript
// Example — 500 ka proper handling
app.get('/api/users/:id', (req, res) => {
    try {
        const id = Number(req.params.id);
        const user = users.find(user => user.id === id);
        if (!user) return res.status(404).json({ error: 'User Not found' });
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong on server' });
    }
});
```

---

## 6. 3xx — Redirection (Is Code Mein MISSING Hai — Yahan Add Kar Raha Hoon)

Simple definition: 3xx codes bolte hain — *"jo tum maang rahe ho woh yahan nahi hai, kisi **aur URL** pe jao."*

### `301 Moved Permanently`
```javascript
app.get('/old-page', (req, res) => {
    res.redirect(301, '/new-page');
});
```
**Simple words:** page **permanently** kahin aur move ho gaya hai. Browser aur search engines yaad rakh lete hain ki ab hamesha naye URL pe jaana hai.

### `302 Found` (Temporary Redirect)
```javascript
app.get('/api/users/old-route', (req, res) => {
    res.redirect(302, '/api/users');
});
```
**Simple words:** **temporary** redirect — abhi ke liye naye URL pe bhej rahe hain, lekin future mein purana URL phir se kaam kar sakta hai. `res.redirect()` Express mein default `302` use karta hai agar status number na do.

### `304 Not Modified`
**Simple words:** browser ne pehle se yeh data **cache** kiya hua hai, aur data change nahi hua — server bolta hai *"tumhare paas jo already hai, wahi use karo, dobara bhejne ki zaroorat nahi."* (Performance ke liye useful — bandwidth bachta hai.)

**Lame analogy:** 3xx codes aise hain jaise dukaan shift ho gayi ho — purane address pe ek note chipka hai: *"Hum yahan se shift ho gaye, naya address yeh hai"* (redirect). Agar tumhe pehle se pata hai dukaan wahi hai jaisa tumne last baar dekha tha, dukaandaar bolta hai *"kuch naya nahi, jo already jaante ho wahi sahi hai"* (304).

---

## 7. Quick Reference Table — Sab Status Codes Ek Nazar Mein

| Code | Naam | Kab Use Karo |
|---|---|---|
| `200` | OK | Normal success (default) |
| `201` | Created | Naya resource bana (POST ke baad) |
| `301` | Moved Permanently | URL hamesha ke liye badal gaya |
| `302` | Found (Temporary Redirect) | URL abhi ke liye kahin aur bhej rahe hain |
| `304` | Not Modified | Cached data use karo, kuch naya nahi hai |
| `400` | Bad Request | Client ne galat/incomplete data bheja |
| `401` | Unauthorized | Login/token zaroori hai |
| `403` | Forbidden | Login toh hai, lekin permission nahi hai |
| `404` | Not Found | Resource exist nahi karta |
| `500` | Internal Server Error | Server ke andar kuch toot gaya |

---

## 8. Is Code Mein Kya Missing Tha (Summary)

1. **Bug fix:** `req.status(404)` → `res.status(404)` hona chahiye (`req` pe `.status()` hota hi nahi)
2. **500 ka actual handling missing tha** — sirf comment mein tha, `try/catch` se properly handle karna chahiye
3. **3xx codes bilkul use hi nahi hue the** — agar kabhi purana route deprecate karna ho ya naye URL pe bhejna ho, `res.redirect(301/302, newUrl)` use karo

---

## 9. One-Line Summary

Status codes 3-digit numbers hain jo batate hain request ka result kya hua — `2xx` = success, `3xx` = kahin aur jao (redirect), `4xx` = client ne galti ki, `5xx` = server mein hi problem hai. `res.status(code)` se explicitly set karte hain, warna Express default `200` laga deta hai.

## 10. Mental Model

Socho status codes ek **dukaan ka response** hain:
- **`200`** = "Yeh lo, mil gaya" ✅
- **`201`** = "Naya bana diya, yeh lo" ✅
- **`301`/`302`** = "Yeh dukaan yahan se shift ho gayi, naye address pe jao" ↪️
- **`304`** = "Jo pehle diya tha wahi abhi bhi sahi hai, kuch naya nahi" 🔄
- **`400`** = "Tumne order hi galat diya" ❌ (customer ki galti)
- **`404`** = "Yeh cheez humare paas hai hi nahi" ❌ (exist nahi karta)
- **`500`** = "Hamari dukaan mein hi kuch kharab ho gaya" 🔥 (server ki galti)