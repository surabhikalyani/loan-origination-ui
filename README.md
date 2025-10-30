# Loan Origination Frontend

A lightweight Frontend Web App that allows borrowers to apply for loans and instantly view approval decisions and loan offers.  
It connects to a Spring Boot backend through REST APIs and demonstrates clean full-stack design with simple validation and API integration.

---

## What It Does
- Collects borrower details (name, address, email, SSN, income, debt, etc.)
- Validates inputs on the client side
- Sends data to the backend for decisioning
- Displays a clear result: **APPROVED** or **DENIED**, with loan offer details

---

## How to Run

## Run Instructions

### 1️⃣ Install dependencies
```
bash

npm install
```

### 2️⃣ Start the frontend
```
bash

npm run dev
```
The app will run at 👉 http://localhost:5173

### 3️⃣ Run tests
```
bash

npx vitest
```

### 🔗 API Configuration

Create a .env file in the project root:
```
bash

VITE_API_BASE=http://localhost:8080
VITE_LOAN_ENDPOINT=api/loan-applications/apply
```
#### This lets the frontend connect to your backend running on port 8080.