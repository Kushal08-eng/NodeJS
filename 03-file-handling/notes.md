# Node.js `fs` Module — File System Notes

## 1. `fs` Module Kya Hai?

Simple definition: `fs` ek **built-in Node.js module** hai jo files ke saath kaam karne ke liye use hota hai — banana, padhna, likhna, delete karna, sab kuch.

```javascript
const fs = require('fs')
```

Yeh isliye kaam karta hai kyunki Node.js **server/machine pe** chalta hai, browser JS ki tarah nahi — isliye usse file system tak access milta hai (yaad hai? browser mein `fs` jaisa kuch nahi hota, security ki wajah se).

---

## 2. Sync vs Async — Sabse Important Concept

`fs` module mein har operation ke **do versions** milte hain:

| Type | Naam mein kya hota hai | Kaam kaise karta hai |
|---|---|---|
| **Synchronous** | Function ke end mein `Sync` word | Line ruk jaati hai jab tak kaam poora na ho jaaye (blocking) |
| **Asynchronous** | Bina `Sync` word ke | Background mein chalta hai, callback function se result milta hai (non-blocking) |

**Lame analogy:** Sync = tum khud line mein khade ho, jab tak kaam na ho jaaye wahi rukoge. Async = tum kaam de ke chale jaate ho, jab kaam poora hoga tumhe bula liya jayega (callback).

---

## 3. File Banana (Create) — `writeFile`

### Synchronous version
```javascript
fs.writeFileSync("./test.txt", "Hey There");
```
Simple words: yeh line turant file bana degi aur likh degi. Jab tak yeh poora na ho jaaye, agli line chalegi hi nahi.

### Asynchronous version
```javascript
fs.writeFile("./test.txt", "Hello World", (err) => {});
```
Simple words: yeh kaam background mein hoga. Jab file likhna khatam ho jayega, callback `(err) => {}` chalega. Agar kuch galat hua toh `err` mein error milega.

---

## 4. File Padhna (Read) — `readFile`

### Synchronous version — result seedha return hota hai
```javascript
const result = fs.readFileSync("./contacts.txt", "utf-8");
console.log(result);
```
Simple words: yeh line ruk jaayegi jab tak file poori padh na li jaaye, phir seedha result variable mein aa jayega.

`"utf-8"` kya hai? Yeh **encoding** batata hai — bina ye likhe, tumhe result **raw buffer** (binary data) milega, readable text nahi. `"utf-8"` bolne se seedha readable string milta hai.

### Asynchronous version — result callback se milta hai
```javascript
fs.readFile("./contacts.txt", "utf-8", (err, result) => {
    if (err) {
        console.log("Error", err);
    } else {
        console.log(result);
    }
});
```
Simple words: is line ka **koi return value nahi hota** — result seedha nahi milta. Iske bajaye ek **callback function** pass karte hain jisme:
- `err` → agar kuch galat hua toh error yahan aayega
- `result` → agar sab sahi hua toh file ka content yahan aayega

**Important pattern:** Node.js ke async functions mein hamesha yeh style dikhega — **error-first callback**: `(err, result) => {...}`. Pehle error check karo, phir result use karo.

---

## 5. File Mein Text Add Karna (Append) — `appendFileSync`

```javascript
fs.appendFileSync("./test.txt", "\nHey there I am appended");
```
Simple words: `writeFileSync` purana content **mita ke naya likh deta** hai, lekin `appendFileSync` purane content ke **end mein naya text jod** deta hai — kuch delete nahi hota.

`\n` = new line — taaki naya text agli line pe jaaye, wahi line pe chipak na jaaye.

---

## 6. File Copy Karna — `cpSync`

```javascript
fs.cpSync("./test.txt", "./copy.txt");
```
Simple words: `test.txt` ka poora content copy karke `copy.txt` naam ki nayi file bana deta hai. (`cp` = copy, jaise Linux/terminal ka `cp` command).

---

## 7. File Delete Karna — `unlinkSync`

```javascript
fs.unlinkSync("./copy.txt");
```
Simple words: file ko permanently delete kar deta hai. `unlink` naam isliye hai kyunki technically yeh file system se uska "link" (reference) hata deta hai.

⚠️ Dhyaan rakhna — yeh **permanent** hai, koi "recycle bin" nahi hai yahan.

---

## 8. File Ka Status Check Karna — `statSync`

```javascript
console.log(fs.statSync("./test.txt"));
```
Simple words: file ke baare mein **saari details** deta hai — jaise:
- File size kitni hai
- Kab bani thi (creation time)
- Kab last modify hui thi
- Yeh file hai ya folder hai

Output kuch aisa dikhta hai:
```javascript
Stats {
  size: 24,
  birthtime: 2026-07-01T10:00:00.000Z,
  mtime: 2026-07-01T10:05:00.000Z,
  ...
}
```

---

## 9. Directory (Folder) Banana — `mkdirSync`

### Simple folder
```javascript
fs.mkdirSync("my-docs");
```
Simple words: `my-docs` naam ka ek folder bana deta hai.

### Nested folders (ek andar ek)
```javascript
fs.mkdirSync("my-docs/a/b", { recursive: true });
```
Simple words: yeh `my-docs` folder ke andar `a` folder, aur uske andar `b` folder — teeno ek saath bana deta hai.

**`{ recursive: true }` kyun zaroori hai?**

Agar yeh option nahi doge, aur `my-docs` ya `a` pehle se exist nahi karte, toh Node **error de dega** — kyunki normally `mkdirSync` sirf ek level ka folder banata hai, aur assume karta hai ki upar wale sab folders already maujood hain.

`recursive: true` bolne ka matlab: *"agar beech ke folders (my-docs, a) exist nahi karte, unhe bhi khud bana do, phir andar wala bhi bana do."*

**Lame analogy:** bina `recursive: true` ke, yeh aisa hai jaise tumse bola jaaye *"teesri manzil pe jao"* lekin building mein pehli aur doosri manzil hi nahi bani. `recursive: true` bolne se pehle building banegi (saari manzilein), phir tum teesri pe pahुंच paoge.

---

## 10. Sab Functions — Ek Table Mein

| Kaam | Sync Version | Async Version |
|---|---|---|
| File banana/likhna | `fs.writeFileSync(path, data)` | `fs.writeFile(path, data, callback)` |
| File padhna | `fs.readFileSync(path, encoding)` | `fs.readFile(path, encoding, callback)` |
| Text add karna (end mein) | `fs.appendFileSync(path, data)` | `fs.appendFile(...)` (async version bhi hai) |
| File copy karna | `fs.cpSync(source, dest)` | `fs.cp(...)` |
| File delete karna | `fs.unlinkSync(path)` | `fs.unlink(...)` |
| File ki details dekhna | `fs.statSync(path)` | `fs.stat(...)` |
| Folder banana | `fs.mkdirSync(path)` | `fs.mkdir(...)` |

---

## 11. One-Line Summary

`fs` module = Node.js ka tool jo files/folders ke saath kaam karta hai — har operation ke **Sync** (ruk ke wait karo) aur **Async** (callback se result lo) dono versions available hain. Async wale mein hamesha `(err, result)` pattern follow hota hai — pehle error check, phir result use.

## 12. Mental Model (Backpack Wali Analogy)

- **Sync functions** = tum khud jaake kaam karke wapas aate ho, result seedha haath mein leke.
- **Async functions** = tum kisi ko kaam de dete ho aur apna kaam karte raho; jab unka kaam poora hoga, woh tumhe **callback** ke through bulayenge, aur result ya error dono mein se ek denge.
- **`recursive: true`** = "beech ke saare missing folders khud bana lo, phir final wala banao" — chaahe kitne bhi levels deep ho.