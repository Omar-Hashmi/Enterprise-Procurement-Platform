const express = require("express");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const purchaseRequestRoutes = require("./routes/purchase-request.routes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Enterprise Procurement Platform API is Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/purchase-requests", purchaseRequestRoutes);

module.exports = app;