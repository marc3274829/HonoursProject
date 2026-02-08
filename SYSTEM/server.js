const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const pool = require("./db");
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

app.post("/register", async (req, res) => {

  try {
    const { email, password, repeatPassword } = req.body;

    if (password !== repeatPassword) {
      return res.send("Passwords do not match");
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.send("Email already registered");
    }

    await pool.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, password]
    );

    res.send("Registration successful");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


