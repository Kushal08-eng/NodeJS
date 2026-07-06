# What is Node.js?

## The Problem Node.js Solved

JavaScript was originally built to run **only inside web browsers**.

It could:
- Make buttons clickable
- Validate forms
- Animate things on a webpage

But it had **no way to run on its own** — on a server, on your computer, independently. It was trapped inside the browser.

**Node.js broke that.**

---

## What Node.js Actually Is

> **Node.js is a runtime environment that lets JavaScript run outside the browser — directly on a computer or server.**

The same way Python or Java can run on a server without a browser — Node.js gives JavaScript that same ability.

```
Before Node.js:
JavaScript → only runs inside Chrome, Firefox, Safari etc.

After Node.js:
JavaScript → runs anywhere — servers, computers, cloud, command line
```

---

## Simple Analogy

Think of JavaScript as a **fish** — it can only survive in water (the browser).

Node.js is like giving that fish **legs** — now it can walk on land (your server/computer) too.

---

## What Node.js is Built On

Node.js is built on **V8** — the same JavaScript engine that powers Google Chrome.

```
Google Chrome  →  uses V8 engine to run JS in the browser
Node.js        →  takes that same V8 engine, puts it on a server
```

V8 compiles JavaScript directly to machine code — which is why Node.js is fast.

---

## How Node.js Works — The Architecture

This is an important interview topic. Node.js has a unique architecture:

### Single Threaded

Node.js runs on a **single thread** — meaning it handles one thing at a time, unlike Java which can create multiple threads.

### Non-Blocking I/O

This is what makes Node.js powerful despite being single threaded.

**Blocking (bad):**
```
Request comes in
→ Node starts reading a file
→ Node WAITS doing nothing until file is read
→ Only then handles the next request
→ Everything else is stuck waiting
```

**Non-Blocking (how Node actually works):**
```
Request comes in
→ Node starts reading a file
→ Node immediately moves on to handle other requests
→ When file is done reading, a CALLBACK runs with the result
→ Nothing was ever blocked waiting
```

### Event Loop

The **Event Loop** is the mechanism that makes non-blocking I/O possible.

```
┌─────────────────────────────┐
│         EVENT LOOP          │
│                             │
│  1. Check for new requests  │
│  2. Start any async tasks   │
│     (file read, DB query)   │
│  3. Move on immediately     │
│  4. When async task done →  │
│     pick up the callback    │
│  5. Repeat forever          │
└─────────────────────────────┘
```

Think of it like a waiter at a restaurant:
- A bad waiter stands at one table until the food arrives (blocking)
- A good waiter takes the order, goes to the next table, comes back when food is ready (non-blocking)

Node.js is the good waiter.

---

## What Node.js Is Used For

Node.js is excellent for:

```
✅ REST APIs and web servers     ← most common use
✅ Real-time apps (chat, live)   ← Socket.io
✅ Microservices                 ← lightweight, fast startup
✅ Command line tools            ← npm itself is built on Node
✅ Streaming applications        ← video, audio
```

Node.js is NOT ideal for:

```
❌ CPU-heavy tasks (image processing, video encoding, complex math)
   → because it's single threaded, CPU-heavy work blocks everything
   → Python or Go are better for this
```

---

## Node.js vs Browser JavaScript — Key Differences

| | Browser JS | Node.js |
|---|---|---|
| Runs where | Inside browser only | Computer, server, anywhere |
| Has access to | DOM, window, document | File system, OS, network |
| Cannot access | File system (security) | DOM (no browser) |
| Used for | Frontend UI | Backend, servers, tools |
| Global object | `window` | `global` |

---

## Built-in Modules

Node.js comes with built-in modules you can use without installing anything:

```javascript
// fs — read and write files
const fs = require('fs')
fs.readFile('notes.txt', 'utf8', (err, data) => {
    console.log(data)
})

// path — work with file paths
const path = require('path')
console.log(path.join(__dirname, 'files', 'notes.txt'))

// http — create a raw web server
const http = require('http')
const server = http.createServer((req, res) => {
    res.end('Hello World')
})
server.listen(3000)

// os — get info about the operating system
const os = require('os')
console.log(os.platform())    // 'win32', 'linux', 'darwin'
console.log(os.freemem())     // free memory in bytes
```

---

## require() — How Node Loads Modules

```javascript
// Built-in module (no installation needed)
const fs = require('fs')

// Your own file
const myModule = require('./myModule')

// Installed package (from npm)
const express = require('express')
```

---

## Running Node.js

```bash
# Check if Node is installed
node --version
# output: v20.11.0

# Run a JavaScript file
node app.js

# Open Node REPL (interactive mode)
node
> console.log("Hello")
> Hello
```

---

## npm — Node Package Manager

npm comes bundled with Node.js. It lets you install packages (libraries) that others have written.

```bash
# Initialize a new project (creates package.json)
npm init -y

# Install a package
npm install express

# Install a dev-only package (not needed in production)
npm install nodemon --save-dev

# Run a script defined in package.json
npm run start
```

### package.json
The `package.json` file is like your project's ID card — it tracks:
- Project name and version
- All installed packages (dependencies)
- Scripts you can run

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
}
```

### node_modules
When you run `npm install`, all packages are downloaded into the `node_modules` folder.

**Important:** Never push `node_modules` to GitHub — it's huge and unnecessary.

```
# .gitignore
node_modules/
.env
```

Anyone who clones your repo can just run `npm install` to reinstall everything from `package.json`.

---

## nodemon — Auto Restart During Development

Normally you have to stop and restart `node app.js` every time you change a file. **nodemon** does this automatically.

```bash
npm install nodemon --save-dev

# Instead of: node app.js
nodemon app.js
# Now restarts automatically on every file change
```

---

## Your First Node.js Server (Without Express)

```javascript
const http = require('http')

const server = http.createServer((req, res) => {
    // req = incoming request
    // res = the response you send back

    if (req.url === '/') {
        res.end('Home Page')
    } else if (req.url === '/about') {
        res.end('About Page')
    } else {
        res.end('404 Not Found')
    }
})

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000')
})
```

This works — but notice how messy the routing already gets with just 2 pages.
This is exactly why Express exists — to make this clean and simple.

---

## Why Express Exists (Natural Next Step)

Raw Node.js gives you everything, but it's low-level and repetitive:

```javascript
// With raw Node — manual, messy
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/users') {
        // manually parse body, manually set headers, manually handle errors...
    }
})
```

```javascript
// With Express — clean, simple
app.get('/users', (req, res) => {
    res.json({ users: [] })
})
```

Express is just a framework built on top of Node's http module that removes all the repetitive boilerplate.

---

## Summary

```
Node.js = JavaScript runtime outside the browser
Built on = V8 engine (same as Chrome)
Architecture = Single threaded + Non-blocking I/O + Event Loop
Good for = REST APIs, real-time apps, microservices
Not good for = CPU-heavy tasks

Key concepts:
  - require()         → load modules
  - Built-in modules  → fs, path, http, os
  - npm               → package manager
  - package.json      → project config + dependency tracker
  - node_modules      → installed packages (never push to GitHub)
  - nodemon           → auto-restart during development

Next step → Express.js (builds on top of Node to make servers easy)
```

---

## Interview Questions on This Topic

**Q: What is Node.js?**
> Node.js is a JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run outside the browser — on a server or any computer. It uses a single-threaded, non-blocking, event-driven architecture which makes it efficient for handling many concurrent connections without creating multiple threads.

**Q: What is the Event Loop?**
> The Event Loop is what allows Node.js to perform non-blocking I/O despite being single-threaded. When an async operation (like reading a file or querying a database) is triggered, Node doesn't wait — it moves on and handles other work. When the async operation finishes, its callback is placed in the event queue, and the Event Loop picks it up and executes it.

**Q: What is Node.js good and bad at?**
> Good at: I/O-heavy tasks like REST APIs, real-time applications, and microservices — because non-blocking I/O handles many concurrent requests efficiently. Bad at: CPU-intensive tasks like video encoding or complex calculations — because the single thread gets blocked during heavy computation, preventing it from handling other requests.

**Q: What is npm?**
> npm (Node Package Manager) is the default package manager for Node.js. It lets you install, share, and manage third-party packages/libraries in your project. It also manages your project's metadata and scripts through package.json.