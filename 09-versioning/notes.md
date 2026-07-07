# npm Versioning (Semantic Versioning) — Notes

## 1. Version Number Kya Hota Hai?

Simple definition: Har npm package ka ek version number hota hai jo **teen numbers** mein bata hai — ismein kya-kya badla hai.

```
4.18.2
```

Isse **teen parts** mein todte hain:

| Part | Value | Naam |
|---|---|---|
| 1st Part | `4` | **Major** |
| 2nd Part | `18` | **Minor** |
| 3rd Part | `2` | **Patch** |

**Format:** `MAJOR.MINOR.PATCH`

---

## 2. Teeno Parts Ka Matlab

### 3rd Part (Patch) — Minor Fixes / Bug Fixes
```
4.18.2  →  4.18.3
              ↑
        Chota bug fix hua, koi feature nahi badla
```

**Simple words:** yeh sabse **chhote, safe changes** hote hain — bas koi bug fix hua hai. Koi naya feature nahi aaya, kuch tootega bhi nahi. Isliye "optional" bola gaya — update karo ya na karo, farak nahi padta zyada.

---

### 2nd Part (Minor) — Recommended Bug Fix (Security)
```
4.18.2  →  4.19.1
             ↑
     Naya feature ya security fix aaya, purana code tootega nahi
```

**Simple words:** yeh update **thoda bada** hai — shayad koi naya feature add hua ho, ya **security wali important fix** ho. Isliye "recommended" bola gaya — update karna chahiye, kyunki security issues serious ho sakte hain. Lekin yeh **backward-compatible** hota hai — matlab purana code bina badle chalta rahega.

---

### 1st Part (Major) — Major Release / Breaking Update
```
4.18.2  →  5.0.1
    ↑
Bahut bada change, purana code TOOT sakta hai
```

**Simple words:** yeh sabse **bada aur risky** update hai — kuch cheezein **completely badal** sakti hain, purane functions hata sakte hain, ya naye tarike se kaam karte hain. Isliye "breaking update" bola gaya — agar seedha update kar diya, tumhara **purana code kaam karna band kar sakta hai**.

**Lame analogy:** socho ek **school ka grade system**:
- **Patch** = ek chapter mein spelling mistake fix hui (koi farak nahi padta padhne mein)
- **Minor** = ek naya chapter add hua, purane chapters same hain (kuch naya seekhne ko mila, purana waisa hi hai)
- **Major** = poora syllabus badal diya gaya (purani kitaab se ab match nahi karega)

---

## 3. `package.json` Mein Version Kaise Likha Jaata Hai

```json
"express": "^4.18.3"
```

Yahan `^` (caret) symbol hai — yeh batata hai ki npm install/update karte waqt **kaunse versions allowed hain**.

---

## 4. `^` (Caret) Symbol — Minor + Patch Updates Allowed

```
^4.18.3
```

**Simple words:** `^` bolta hai — *"Major number (4) same rakho, lekin Minor aur Patch mein jo bhi naya version aaye, woh le lo."*

```
^4.18.3  →  ye allowed hain:
  ✅ 4.17.9   (chhota tha, but same major)
  ✅ 4.18.1
  ✅ 4.18.2
  ✅ 4.18.3
  ✅ 4.19.1
  ✅ 4.99.99  (jab tak 4.x hai)

  ❌ 5.0.0    (Major number badal gaya — NOT allowed)
  ❌ 5.1.1    (yeh bhi NOT allowed)
```

**Lame analogy:** `^` ek **flexible dost** jaisa hai — bolta hai *"same family (major version) mein jo bhi update aaye, koi problem nahi, le lo. Lekin family hi badal gayi (major version change) toh NAHI."*

**Kyun safe hai?** Kyunki Minor aur Patch updates **backward-compatible** hone ka promise karte hain (semver ka rule) — isliye `^` unhe automatically le leta hai, bina darr ke ki code toot jaayega.

---

## 5. `~` (Tilde) Symbol — Sirf Patch Updates Allowed

```
~4.18.1
```

**Simple words:** `~` bolta hai — *"Major aur Minor dono same rakho (4.18), sirf Patch (3rd number) mein jo naya aaye, woh le lo."*

```
~4.18.1  →  ye allowed hain:
  ✅ 4.18.1
  ✅ 4.18.2
  ✅ 4.18.3
  ✅ 4.18.4

  ❌ 4.19.1   (Minor number badal gaya — NOT allowed)
  ❌ 5.0.0    (Major bhi NOT allowed)
```

**Lame analogy:** `~` ek **strict dost** hai — bolta hai *"sirf chhote bug fixes lo (patch), naya feature bhi mat lo (minor), kuch bada mat lo (major)."*

---

## 6. `^` vs `~` — Side by Side

| Symbol | Kya Allow Karta Hai | Kitna Flexible |
|---|---|---|
| `^4.18.3` | Minor + Patch updates (4.x.x tak) | Zyada flexible |
| `~4.18.3` | Sirf Patch updates (4.18.x tak) | Kam flexible, zyada strict |
| (kuch nahi, exact) `4.18.3` | Bas yehi exact version | Sabse strict |

```json
"express": "^4.18.3"   // 4.18.3 se 4.x.x tak kuch bhi (5.0.0 tak nahi)
"express": "~4.18.3"   // sirf 4.18.x range mein
"express": "4.18.3"    // exactly yehi version, kuch nahi aur
```

---

## 7. Kyun Yeh System Zaroori Hai?

Agar har package **bina kisi rule ke** apne aap update ho jaaye, toh:
- Kabhi kabhi **bada breaking change** aake tumhara poora project tod sakta hai (agar Major version bhi automatically update ho jaaye)
- Isliye `^` aur `~` jaise symbols use karke tum **control** karte ho ki kitna "risk" lene ko ready ho

**Common practice:** zyada tar projects `^` use karte hain (default bhi yehi hota hai `npm install` karne pe) — kyunki minor/patch updates safe maane jaate hain, aur security fixes bhi mil jaate hain automatically.

---

## 8. Quick Reference Table

| Version Change | Symbol Example | Matlab |
|---|---|---|
| Patch (3rd part) | `4.18.2 → 4.18.3` | Minor bug fix, safe, optional |
| Minor (2nd part) | `4.18.2 → 4.19.1` | Naya feature / security fix, recommended, backward-compatible |
| Major (1st part) | `4.18.2 → 5.0.1` | Breaking change, purana code toot sakta hai |
| `^` | `^4.18.3` | Minor + Patch allowed (same Major) |
| `~` | `~4.18.3` | Sirf Patch allowed (same Major.Minor) |

---

## 9. One-Line Summary

Version = `MAJOR.MINOR.PATCH` — Patch chhote bug fixes hote hain (safe), Minor naye features/security fixes hote hain (recommended, safe), aur Major breaking changes hote hain (risky). `^` sirf Major ko lock karta hai (Minor+Patch free), `~` Major aur Minor dono ko lock karta hai (sirf Patch free).

## 10. Mental Model

Socho version number ek **ghar ka address** hai: `Major.Minor.Patch` = `City.Colony.House Number`

- **Patch badalna** = ghar ke andar ek chhota sa repair hua (address same hai)
- **Minor badalna** = colony mein naya park bana (city same hai, colony thodi update hui)
- **Major badalna** = poori city hi badal gayi (kuch bhi purana guarantee nahi)

`^` bolta hai: *"city same rahe, colony/house kuch bhi ho, chalega."*
`~` bolta hai: *"city aur colony dono same rahein, sirf house number mein chhota fark chalega."*