<img width="600" alt="Screenshot (466)" src="https://github.com/user-attachments/assets/3d5fced0-7821-4adf-9993-a0f58ff42523" />
<img width="600" alt="Screenshot (463)" src="https://github.com/user-attachments/assets/e19038f8-517c-4217-bcce-5a5daa050c14" />
<img width="600" alt="Screenshot (462)" src="https://github.com/user-attachments/assets/073e28ce-2802-45fc-8e40-86c2c3d20571" />
<img width="600" alt="Screenshot (464)" src="https://github.com/user-attachments/assets/e35722f7-67da-499d-99ab-e31917b3de05" />
<img width="600" alt="Screenshot (465)" src="https://github.com/user-attachments/assets/c9fe9ad0-891a-4436-8a05-069dcec8cc2b" />

# AI Kata: Sweet Shop Management System

This is a full-stack application for managing a sweet shop's inventory, built as a technical assessment for Incubyte. It features a complete backend API built with Node.js and PostgreSQL, and a modern, interactive frontend built with Next.js. The entire project was developed following a strict Test-Driven Development (TDD) workflow.

---

## Features

### Backend (Node.js & Express)
* **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens).
* **RESTful API**: A complete CRUD API for managing sweets.
* **Role-Based Access Control**: Admin-only endpoints for deleting, updating, and restocking sweets.
* **Inventory Management**: Endpoints for purchasing and restocking items.
* **Database**: Uses a robust PostgreSQL database for persistent data storage.
* **TDD**: Fully tested with Jest and Supertest, following a "Red-Green-Refactor" workflow.

### Frontend (Next.js & React)
* **User Auth Pages**: Functional, client-side pages for user login and registration.
* **Interactive Dashboard**: Displays all sweets and allows for real-time searching.
* **Client-Side Protected Routes**: The main dashboard is protected and redirects unauthenticated users.
* **Admin Panels**: Admins see additional UI controls to add, edit, and delete sweets.
* **Dynamic Pages**: The "Edit Sweet" page is a dynamic route that fetches data based on the URL.

---

## Tech Stack

* **Backend**: Node.js, Express.js, PostgreSQL (`pg`), JWT, bcryptjs, Jest, Supertest
* **Database**: PostgreSQL
* **Frontend**: Next.js, React, Tailwind CSS, Axios, jwt-decode

---

## Setup and Installation

### 1. Backend Server
```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# IMPORTANT: Create a .env file in this folder and add your
# DATABASE_URL and JWT_SECRET
# Example:
# DATABASE_URL="postgresql://postgres:your_password@localhost:5432/sweet_shop"
# JWT_SECRET="your_random_secret_key"

# Set up the database tables
node database/setup.js

# Start the server (on http://localhost:3001)
npm start

### 2. Frontend Application

# From the root, open a NEW terminal and navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server (on http://localhost:3000)
npm run dev


# My AI Usage
AI Tools Used: Gemini (by Google)

How I Used It: I used Gemini as an interactive, conversational pair-programming partner for the entire project lifecycle.

Project Scaffolding: It provided the initial step-by-step roadmap for the project structure, TDD workflow, and database migration.

TDD Cycle: For each feature, Gemini first provided the failing test ("Red" phase) and then the code to make it pass ("Green" phase), including all the necessary backend and frontend logic.

Debugging: When tests failed or the application crashed (due to CORS, database race conditions, typos, or state management issues), I provided the error messages, and Gemini diagnosed the root cause and provided the corrected code.

Best Practices: It introduced and provided code for best practices like using .env files for secrets, creating an admin middleware for role-based security, and managing test database states.

My Reflection: Working with an AI partner was incredibly efficient. It allowed me to focus on understanding the flow and logic of TDD and full-stack development without getting stuck on minor syntax errors. It was like having a senior developer guiding me brick-by-brick, providing code snippets and explaining complex concepts in real-time.

