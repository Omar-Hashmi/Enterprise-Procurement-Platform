const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Enterprise Procurement Platform API is Running...");
});

module.exports = app;