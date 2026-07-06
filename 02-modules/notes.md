# Node.js Modules — module.exports vs exports (Simple Notes)

## 1. Modules Kya Hote Hain?

Simple definition: Ek file ka code doosri file mein use karne ka tarika — bina copy-paste kiye.

Node.js mein har file **apne aap mein ek module** hoti hai. Jo bhi tum export karoge, wahi doosri file mein `require()` se use kar sakte ho.

```
math.js  → yahan se functions bana rahe hain (export)
index.js → yahan pe woh functions use kar rahe hain (import)
```

---

## 2. Purana Tarika — `module.exports`

```javascript
function add(a, b) {
    return a + b
}

function sub(a, b) {
    return b - a
}

module.exports = {
    add,
    sub,
}
```

**Simple words mein:** `module.exports` ek **khaali dabba** hai jisme tum jo bhi daaloge, wahi doosri file ko milega.

```javascript
module.exports = { ... }
```
Iska matlab: *"jo bhi is object ke andar hai, sirf wahi export ho raha hai."*

⚠️ **Important:** `module.exports = {...}` poora **overwrite** kar deta hai — jo pehle se `module.exports` mein tha, sab hat jaata hai, sirf yeh naya object rahega.

---

## 3. Modern Tarika — `exports.functionName`

```javascript
exports.add = (a, b) => a + b;
exports.sub = (a, b) => b - a;
```

**Simple words mein:** yeh same kaam karta hai, bas thoda alag style mein. Har function ko **ek ek karke** `exports` object pe chipka rahe ho — poora object replace nahi kar rahe.

```javascript
exports.add = ...   // ek naya property add ho raha hai exports object mein
exports.sub = ...   // ek aur property add ho raha hai
```

Yeh basically arrow functions hain — koi naam nahi diya (no-name / anonymous), seedhe `exports` ke andar assign kar diya.

---

## 4. `exports` vs `module.exports` — Bada Fark

Yeh confusing part hai, isliye dhyaan se:

```javascript
exports === module.exports   // shuru mein yeh dono SAME cheez ko point karte hain
```

Lame analogy: socho **`module.exports`** ek ghar hai, aur **`exports`** us ghar ka **address label** hai jo tumhare haath mein hai.

### ✅ Yeh chalega — properties add karna
```javascript
exports.add = (a, b) => a + b;
// yeh matlab: ghar (module.exports) ke andar "add" naam ka ek room bana diya
```

### ❌ Yeh nahi chalega — pura reassign karna
```javascript
exports = {
    add: (a, b) => a + b
};
// yeh matlab: tumne apna address label phaad ke naya address likh diya
// lekin asli ghar (module.exports) wahi ka wahi hai, khaali!
```

**Rule of thumb:**
- `exports.abc = ...` → ✅ theek hai, kaam karega
- `exports = {...}` → ❌ galat, kuch export nahi hoga (kyunki tumne sirf label badla, ghar nahi)
- `module.exports = {...}` → ✅ theek hai, poora naya object export hoga (overwrite)

---

## 5. index.js — Import Karna (`require`)

```javascript
const { add, sub } = require("./math");

console.log("math value is ", add(2, 4));  // 6
console.log("math value is ", sub(2, 4));  // 2
```

**Simple words mein:**
- `require("./math")` → math.js file ko load karo, jo bhi usne export kiya hai woh poora object mil jayega
- `const { add, sub } = ...` → yeh **destructuring** hai — object mein se `add` aur `sub` nikaal ke seedha variable bana liya

Agar destructure nahi karte:
```javascript
const math = require("./math");
math.add(2, 4);   // poore object se access karna padta
math.sub(2, 4);
```

---

## 6. Poora Flow — Ek Nazar Mein

```
math.js:
  exports.add = ...   →  module.exports = { add: fn, sub: fn }
  exports.sub = ...

index.js:
  require("./math")   →  { add: fn, sub: fn } wapas milta hai
  { add, sub }         →  destructure karke direct use
```

---

## 7. Quick Comparison Table

| Tarika | Kaise likhte hain | Overwrite karta hai? |
|---|---|---|
| `module.exports = {...}` | Poora object ek saath bana ke assign karo | ✅ Haan, sab kuch replace ho jata hai |
| `exports.name = ...` | Ek ek property add karo | ❌ Nahi, purane properties safe rehte hain |
| `exports = {...}` | Galat tarika | ⚠️ Kaam nahi karega — kuch export hi nahi hoga |

---

## 8. One-Line Summary

`module.exports` = asli ghar jo export hota hai. `exports` = uska shortcut/label — usme properties add kar sakte ho (`exports.x = ...`), lekin use poora reassign (`exports = {...}`) nahi kar sakte, warna asli ghar (module.exports) khaali ka khaali rah jayega.

## 9. Mental Model (Backpack Wali Analogy)

Socho `module.exports` ek **backpack** hai jo doosri file ko milega jab woh `require()` karegi.

- `exports.add = fn` → backpack ke andar ek item daal diya ✅
- `exports = {...}` → tumne apna khud ka naya backpack bana liya, lekin woh kabhi kisi ko diya hi nahi jayega (sirf original wala jata hai) ❌
- `module.exports = {...}` → tumne poora original backpack khaali karke naya saaman bhar diya ✅ (overwrite)