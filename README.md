# Authentication Methods Evaluation System

## Overview
The Authentication Methods Evaluation System is a full-stack web application designed to implement and compare multiple authentication approaches, including both traditional password-based and modern passwordless methods.

The project focuses on analysing the trade-offs between **security and usability**, providing a framework to evaluate how different authentication mechanisms perform in real-world scenarios.

---

## Features

- Implementation of multiple authentication methods:
  - Password-based authentication
  - Passwordless authentication
- User authentication flows and validation
- Comparative evaluation of authentication methods
- Usability study integration
- Security analysis of each method
- Data storage and management using a relational database

---

## Project Goals

- Explore the balance between **user experience and system security**
- Evaluate how different authentication methods impact usability
- Identify strengths and weaknesses of modern authentication approaches
- Provide recommendations based on empirical findings

---

## Tech Stack

**Frontend:**
- HTML
- CSS
- JavaScript

**Backend:**
- Node.js
- Express.js

**Database:**
- MySQL

---

## Evaluation Approach

The system was used to:
- Conduct usability testing across different authentication methods
- Analyse user interaction and efficiency
- Compare security characteristics of each method
- Identify trade-offs between convenience and protection

---

## Project Structure

SYSTEM/ <br>
└── (Node.js application) <br>
  ├── routes/ # Application routes <br>
  ├── controllers/ # Business logic <br>
  ├── models/ # Database interaction <br>
  ├── public/ # Static frontend files (HTML, CSS, JS) <br>
  ├── config/ # Configuration files <br>
  └── app.js # Entry point <br>
