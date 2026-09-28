const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");

// =======================
// MongoDB Connection
// =======================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:");
        console.log(error);
    });


// =======================
// Visitor Schema
// =======================

const visitorSchema = new mongoose.Schema({
    ip: String,

    userAgent: String,

    time: {
        type: Date,
        default: Date.now
    }
});


// Delete visitors after 24 hours
visitorSchema.index(
    { time: 1 },
    { expireAfterSeconds: 86400 }
);


const Visitor = mongoose.model("Visitor", visitorSchema);


// =======================
// Home Page
// =======================

app.get("/", async (req, res) => {

    const visitor = new Visitor({
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    });

    await visitor.save();

    console.log("New visitor:", visitor);

    res.render("index");
});


// =======================
// Visitors Page
// =======================

app.get("/visitors", async (req, res) => {

    const visitors = await Visitor.find()
        .sort({ time: -1 });

    res.json(visitors);
});


// =======================
// Start Server
// =======================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});