const express = require("express");
const router = require("./routes/url");
const { connectToMongoDB } = require("./connect");
const URL = require("./models/url");
const app = express();
const PORT = 8001;
const path = require("path");
const staticRoute = require("./routes/staticRouter");

connectToMongoDB('mongodb://localhost:27017/short-url').then(console.log("MongoDB Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/test", async (req, res) => {
    const allUrls = await URL.find({});
    return res.render("home");
})

app.use("/url", router);
app.use("/", staticRoute);

app.get("/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId,
    },
    {
        $push: {
            visitHistory: {
                timestamp: Date.now(),
            },
        },
    }
    );
    res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log("Server Started at PORT: ", PORT));