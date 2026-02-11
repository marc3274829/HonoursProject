const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pool = require("./db");
const transporter = require("./email");
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
    console.log("BODY:", req.body);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!])[A-Za-z\d@#!]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).send(
        "Password must contain uppercase, lowercase, number, @#! and be at least 8 characters"
      );
    }

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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("BODY:", req.body);

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.send("Invalid email or password");
    }

    const user = rows[0];

    if (password !== user.password) {
      return res.send("Invalid email or password");
    }

    res.send("Login successful");

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});



app.post("/send-magic-link", async (req, res) => {
  try {
    const { email } = req.body;
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "INSERT INTO magic_links (email, token, expires_at) VALUES (?, ?, ?)",
      [email, token, expires]
    );

    const link = `${process.env.BASE_URL}/magic-login?token=${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Your Magic Login Link",
      html: `
        <h3>Login Link</h3>
        <p>Click below to log in:</p>

        <a href="${link}">
          ${link}
        </a>

        <p>Expires in 15 minutes</p>
      `
    });

    res.send("Magic link sent! Check your email.");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending link");
  }
});




