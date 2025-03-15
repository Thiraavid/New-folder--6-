const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const jobRoutes = require("./routes/jobs");
require("dotenv").config();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/jobs", jobRoutes);

app.get("/", (req, res) => {
    res.redirect("/jobs");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
