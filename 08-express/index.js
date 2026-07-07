const express = require("express");
const app = express()
const port = 8000

app.get('/', (req, res) => {
    return res.send(`hello, welcome to port: ${port}`)
});

app.get('/about', (req, res) => {
    return res.send(`hello ${req.query.name}`)
});

app.listen(port, () => {
    console.log(`server has started on port: ${port}`)
})