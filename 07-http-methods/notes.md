# HTTP Methods — Short Notes

## 1. HTTP Method Kya Hai?

Simple definition: HTTP method batata hai ki client (browser/user) server se **kya karna chahta hai** — data maangna hai, bhejna hai, update karna hai, ya delete karna hai.

**Lame analogy:** socho dukaan mein jaane ke alag alag "intentions" hote hain — dekhne aaye ho (GET), kuch khareedne aaye ho (POST), exchange karne aaye ho (PUT), ya return karne aaye ho (DELETE). HTTP method wahi intention batata hai.

---

## 2. GET — Data Maangna (Read)

```javascript
// Route example
app.get('/users', (req, res) => {
    res.send("Sabhi users ki list");
});
```

Simple words: server se **data maangte** ho, kuch bhejte nahi. Jaise browser mein koi website kholna — bas data chahiye, dena kuch nahi.

- Data **URL mein** ja sakta hai (query params: `?search=abc`)
- Body nahi bheja jaata (generally)
- Safe hai — bas padhta hai, kuch change nahi karta

**Example:** Instagram feed load karna, Google search karna.

---

## 3. POST — Naya Data Bhejna (Create)

```javascript
app.post('/users', (req, res) => {
    console.log(req.body); // naya user data
    res.send("User create ho gaya");
});
```

Simple words: server ko **naya data bhejte** ho, jisse woh kuch **create** kare.

- Data **request body** mein bheja jaata hai (URL mein nahi)
- Har baar call karne se **naya entry** bin sakti hai

**Example:** signup form submit karna, naya post banana.

---

## 4. PUT — Poora Data Update Karna (Replace)

```javascript
app.put('/users/1', (req, res) => {
    // poora user object replace ho jayega
    res.send("User poora update ho gaya");
});
```

Simple words: existing data ko **poora ka poora replace** kar dete ho naye data se.

- Agar kisi field ko chhoda, toh woh **khaali/undefined** ho sakta hai (kyunki poora object replace hota hai)

**Example:** profile ka poora form dubara submit karna.

---

## 5. PATCH — Thoda Sa Data Update Karna (Partial Update)

```javascript
app.patch('/users/1', (req, res) => {
    // sirf specific field update hoga, baaki waise hi rahega
    res.send("User ka ek field update ho gaya");
});
```

Simple words: sirf **jo field bheja hai wahi update** hota hai, baaki data waisa hi rehta hai.

**Example:** sirf username change karna, baaki profile details same rehne dena.

---

## 6. DELETE — Data Hatana (Remove)

```javascript
app.delete('/users/1', (req, res) => {
    res.send("User delete ho gaya");
});
```

Simple words: server se koi cheez **permanently hata** dete ho.

**Example:** account delete karna, post delete karna.

---

## 7. Quick Comparison Table

| Method | Kaam | Data Kahan Jaata Hai | Example |
|---|---|---|---|
| **GET** | Data maangna (read) | URL (query params) | Feed load karna |
| **POST** | Naya data bhejna (create) | Request body | Signup, naya post |
| **PUT** | Poora data replace karna | Request body | Poora profile update |
| **PATCH** | Thoda data update karna | Request body | Sirf ek field update |
| **DELETE** | Data hatana | URL (id ke through) | Account delete |

---

## 8. PUT vs PATCH — Bada Confusion Yahin Hota Hai

```javascript
// PUT — poora object bhejna padta hai
PUT /users/1
{ "name": "Kushal", "age": 20, "city": "Nagpur" }
// agar "city" nahi bheja, toh woh missing/undefined ho jayega

// PATCH — sirf jo change karna hai woh bhejo
PATCH /users/1
{ "age": 21 }
// baaki fields (name, city) waise hi rahenge, sirf age update hoga
```

**Lame analogy:** PUT = poora form dubara bharke jama karna (jo blank chhoda woh mit jayega). PATCH = sirf ek line kaat ke naya likhna, baaki form waisa hi rehta hai.

---

## 9. One-Line Summary

- **GET** → data lo (read)
- **POST** → naya data do (create)
- **PUT** → poora replace karo (full update)
- **PATCH** → thoda update karo (partial update)
- **DELETE** → data hatao (remove)

## 10. Mental Model

Socho ek **library** hai:
- **GET** = kitaab padhna (kuch change nahi hota)
- **POST** = nayi kitaab add karna
- **PUT** = poori kitaab ka naya edition rakh dena (purana poora hata ke)
- **PATCH** = kitaab ke sirf ek page ko correct karna
- **DELETE** = kitaab ko library se hata dena