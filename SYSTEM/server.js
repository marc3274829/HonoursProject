const express = require("express");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/test", (req, res) => {
  res.send("Server working");
});

app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});

app.post("/register", (req, res) => {
  console.log(req.body);
  res.send("Form received");
});
