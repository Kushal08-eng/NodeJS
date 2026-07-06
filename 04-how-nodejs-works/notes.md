# Node.js Kaise Kaam Karta Hai — Blocking, Non-Blocking, Event Loop, Thread Pool

## 1. `os` Module — Computer Ki Info

```javascript
const os = require('os')
console.log(os.cpus().length);
```

Simple words: `os` module tumhare **computer ke baare mein info** deta hai — jaise kitne CPU cores hain, kaunsa platform hai, kitni memory hai, etc.

`os.cpus().length` → tumhare machine mein kitne **CPU cores** hain, woh count deta hai. Yeh important hai kyunki Node.js ka **thread pool** size isi se juda hota hai (aage samjhayenge).

---

## 2. Blocking (Synchronous) Code — Pehla Example

```javascript
console.log("1");

const result = fs.readFileSync('contacts.txt', 'utf-8');
console.log(result);

console.log("2");
```

**Output order:**
```
1
(file ka content)
2
```

**Simple words:** yeh code **top se bottom, line by line** chalta hai, aur **ruk jaata hai** jab tak file poori padh na li jaaye.

- `"1"` print hota hai
- Phir JS **wahi ruk jaata hai** — file read hone ka wait karta hai (chahe file 1 second lagaye ya 10 second)
- Jab file mil jaati hai, result print hota hai
- Tabhi jaake `"2"` print hota hai

**Lame analogy:** ek akela cashier hai jo pehle customer ki poori billing khatam karta hai, tabhi doosre customer ki taraf dekhta hai. Jab tak file na padh li jaaye, baaki sab (yahan `"2"`) **line mein ruka rehta hai**.

**Yehi "Blocking" kehlata hai** — ek slow kaam (file read) poore program ko **rok** deta hai.

---

## 3. Non-Blocking (Asynchronous) Code — Doosra Example

```javascript
console.log("1");

fs.readFile('contacts.txt', 'utf-8', (err, result) => {
    console.log(result);
})

console.log("2");
console.log("3");
console.log("4");
```

**Output order:**
```
1
2
3
4
(file ka content)   ← sabse last mein aata hai!
```

**Simple words:** is baar JS file read hone ka **wait nahi karta**. Woh file read karne ka kaam **side mein bhej deta hai** (background), aur turant agli lines chalata rehta hai.

- `"1"` print hota hai
- `fs.readFile(...)` call hota hai, lekin JS iska result turant nahi le sakta — isliye woh isse **background mein bhej deta hai** aur aage badh jaata hai
- `"2"`, `"3"`, `"4"` turant print ho jaate hain (bina wait kiye)
- Jab file read poora ho jaata hai background mein, **tabhi** callback function chalta hai aur file ka content print hota hai — **sabse last mein**

**Lame analogy:** ye waise hai jaise tum order de ke apne token le lo (`fs.readFile`), aur peeche mudke apna kaam karte raho (`"2"`, `"3"`, `"4"`). Jab tumhara order (file content) taiyaar hoga, tumhe **bulaya** jayega (callback chalega) — chahe woh baaki sab kaam ke baad hi kyun na ho.

**Yehi "Non-Blocking" kehlata hai** — slow kaam background mein chalta hai, baaki program **ruknta nahi**.

---

## 4. Ab Samjho — Node.js Ke Andar Kya Ho Raha Hai

Node.js single-threaded hai (matlab **main thread ek hi hai** jo tumhara code chalata hai) — lekin fir bhi woh file reading, network calls jaisi slow cheezein **background mein** kaise chala leta hai?

Iska jawab hai: **libuv** (Node.js ke andar ka ek C++ library) jo do cheezein deta hai:

1. **Thread Pool**
2. **Event Loop**

---

## 5. Thread Pool Kya Hai?

Simple definition: Node.js ke paas **extra background workers (threads)** hote hain jo slow, heavy kaam (jaise file read/write) ko handle karte hain — taaki main thread free rahe aur baaki code chalata rahe.

```javascript
console.log(os.cpus().length); // jitne CPU cores, thread pool utna bada ho sakta hai
```

**Default thread pool size = 4 threads** (Node.js mein), lekin tumhara CPU cores count bhi matter karta hai for performance.

**Lame analogy:** socho ek restaurant hai jisme **1 waiter (main thread)** hai jo orders leta hai aur customers se baat karta hai. Lekin kitchen mein **4 cooks (thread pool)** hain jo actual khana banate hain. Waiter khud khana nahi banata — woh order kitchen (thread pool) ko de deta hai, aur jab tak khana ban raha hai, woh doosre customers ko serve karta rehta hai.

`fs.readFile()` jaisa async, file-related kaam **thread pool** ko diya jaata hai — kisi ek background thread ko.

---

## 6. Event Loop Kya Hai?

Simple definition: Event Loop ek **continuous checker/loop** hai jo baar baar check karta rehta hai — *"kya koi background kaam (thread pool ya kuch aur) complete ho gaya hai? Agar haan, toh uska callback chalao."*

**Lame analogy:** Event Loop ek waiter jaisa hai jo baar baar kitchen mein jhaank raha hai — *"order ready hua kya? Ready hua kya?"* — jaise hi kitchen se signal aata hai ki order (file content) ready hai, waiter (event loop) woh order customer tak (callback function) pahुंचा deta hai.

### Poora Flow (Step by Step)

```
1. Main thread par code chalta hai (console.log, variable declarations, etc.)
2. Jaise hi async function milta hai (fs.readFile) →
   → uska kaam Thread Pool ko de diya jaata hai (background mein)
   → Main thread turant agli line pe chala jaata hai (ruknta nahi)
3. Baaki saara sync code chal jaata hai (console.log("2"), "3", "4")
4. Thread Pool mein background kaam complete hota hai
5. Event Loop check karta hai — "koi kaam complete hua?"
   → haan, file read ho gayi
6. Event Loop uska callback function ko Call Stack mein bhej deta hai
7. Callback chalta hai → result print hota hai (SABSE LAST)
```

---

## 7. Request-Response Ka Connection

Yeh sab concept isliye important hai kyunki jab Node.js **server** banata hai (jaise Express se), toh:

- Ek user **request** bhejta hai (jaise "mujhe data chahiye DB se")
- Agar Node.js woh request **synchronously** (blocking) handle kare, toh jab tak ek user ka DB call poora na ho, **baaki saare users wait** karenge — bahut slow!
- Isliye Node.js **asynchronous/non-blocking** style use karta hai — DB call ko background (thread pool ya external system) bhej do, aur turant **doosre users ki requests** handle karna shuru kar do
- Jab DB se **response** mil jaata hai, event loop us specific user ko uska response bhej deta hai

**Yehi wajah hai ki Node.js real-time apps, APIs, aur high-traffic servers ke liye popular hai** — kyunki woh ek waqt mein hazaaron requests ko efficiently handle kar sakta hai, bina kisi ek slow request ke wajah se sabko rokte hue.

---

## 8. Quick Comparison Table

| | Blocking (Sync) | Non-Blocking (Async) |
|---|---|---|
| Kaam kaise hota hai | Line ruk jaati hai jab tak kaam poora na ho | Kaam background mein jaata hai, code aage badhta hai |
| Result kab milta hai | Turant, seedha return | Baad mein, callback ke through |
| Example | `fs.readFileSync()` | `fs.readFile()` |
| Server ke liye theek? | ❌ Ek slow request sabko rok degi | ✅ Kai requests ek saath handle ho sakti hain |

---

## 9. Poore Concept Ka Ek-Line Summary

- **Blocking (Sync)** = ek kaam khatam, tabhi agla shuru — sab kuch line mein wait karta hai.
- **Non-Blocking (Async)** = slow kaam side mein bhej do, baaki code chalta rahe, jab kaam poora ho jaaye tab callback chale.
- **Thread Pool** = background workers jo heavy/slow kaam (file, crypto, compression) actually karte hain.
- **Event Loop** = continuous checker jo dekhta rehta hai ki background kaam complete hua ya nahi, aur uska result wapas main thread tak pahुंचाता hai.
- Isi wajah se Node.js **ek hi thread** hote hue bhi **bahut saari requests** ek saath efficiently handle kar leta hai.

---

## 10. Mental Model (Restaurant Analogy — Poora Package)

- **Main Thread** = restaurant ka waiter (order leta hai, customer se baat karta hai)
- **Thread Pool** = kitchen ke cooks (actual heavy kaam karte hain — file read, crypto, etc.)
- **Event Loop** = waiter jo baar baar kitchen mein jhaank ke check karta hai "order ready hua kya?"
- **Callback** = jab order ready hota hai, waiter woh order customer tak pahुंचाता hai
- **Blocking code** = waiter khud kitchen mein ghus ke khana banane lagta hai, aur tab tak baaki customers ignore kar deta hai
- **Non-blocking code** = waiter order kitchen ko de deta hai aur turant doosre customers ko attend karta hai