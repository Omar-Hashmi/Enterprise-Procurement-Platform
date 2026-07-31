const express = require("express");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Enterprise Procurement Platform API is Running...");
});

app.use("/api/auth", authRoutes);

module.exports = app;