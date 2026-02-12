const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const session = require("express-session");
const pool = require("./db");
const transporter = require("./email");
const otpStore = {};
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false
  }
}));

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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!])[A-Za-z\d@#!]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).send(
        "Password must contain uppercase, lowercase, number, @#! and be at least 8 characters"
      );
    }

    const required = ["k", "e", "y", "w", "o", "r", "d"];
    const lowerPassword = password.toLowerCase();

    const hasAllLetters = required.every(letter =>
      lowerPassword.includes(letter)
    );

    if (!hasAllLetters) {
      return res.status(400).send(
        "Password must contain all letters from 'KEYWORD'"
     );
    }

    if (password !== repeatPassword) {
      return res.send("Passwords do not match");
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

    const link = `${process.env.BASE_URL}/login-ML.html?token=${token}`;


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

app.get("/magic-login", async (req, res) => {
  try {

    const { token } = req.query;

    if (!token) {
      return res.send("No token provided");
    }

    const [rows] = await pool.query(
      `
      SELECT *
      FROM magic_links
      WHERE token = ?
      AND used = 0
      AND expires_at > NOW()
      `,
      [token]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "Invalid or expired link"
      });
    }

    const magic = rows[0];

    await pool.query(
      "UPDATE magic_links SET used = 1 WHERE id = ?",
      [magic.id]
    );

    req.session.user = magic.email;

    res.json({
      success: true,
      message: "Login successful",
      email: magic.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Login failed");
  }
});


app.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.json({ success: false, message: "Email required" });

  if (email !== "authenticationtestemail123@gmail.com") {
    return res.json({ success: false, message: "Invalid email" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is: <b>${otp}</b></p><p>Expires in 5 minutes</p>`
    });

    setTimeout(() => { delete otpStore[email]; }, 5*60*1000);

    res.json({ success: true, message: "OTP sent! Check your email." });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error sending OTP" });
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.json({ success: false, message: "Email and OTP required" });

  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    req.session.user = email;
    return res.json({ success: true, message: "OTP verified! Login successful." });
  } else {
    return res.json({ success: false, message: "Invalid OTP." });
  }
});






