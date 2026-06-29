# eLab Frontend-Graduation project

> A modern medical laboratory management platform built with React — enabling patients to book tests, view results, and get AI-powered health insights, while giving staff and admins full control over lab operations.

---

## 🖥️ Live Preview

![Home Page](<img width="1918" height="1078" alt="Screenshot 2026-06-20 135833" src="https://github.com/user-attachments/assets/6ef1bb33-8507-4d57-8379-845ca2ca5c09" />
)

---

## ✨ Features

### 🔐 Authentication
- Sign in with email or identity number
- Two-step registration with medical information (blood type, allergies, chronic diseases, emergency contact, insurance)
- Forgot password flow

![Sign In](screenshots/patient/Screenshot%202026-06-20%20135838.png)
![Register - Medical Info](screenshots/patient/Screenshot%202026-06-20%20135903.png)

---

### 🧑‍⚕️ Patient Portal

**Dashboard** — Overview of bookings, pending tests, results, and unread alerts.

![Patient Dashboard](screenshots/patient/Screenshot%202026-06-20%20135957.png)

**Test Catalog** — Browse and search all available lab tests by category, with discount badges and cart functionality.

![Test Catalog](screenshots/patient/Screenshot%202026-06-20%20140001.png)

**Special Offers** — View active discounts and promotions across all branches.

![Offers](screenshots/patient/Screenshot%202026-06-20%20140009.png)

**Book Appointment** — Select a branch, date, and time. Choose between cash payment at branch or secure online payment via Stripe.

![Book Appointment - Payment](screenshots/patient/Screenshot%202026-06-20%20140035.png)

**Stripe Payment** — Integrated Stripe checkout with multi-currency support (USD / ILS).

![Stripe Checkout](screenshots/patient/Screenshot%202026-06-20%20140043.png)

**My Bookings** — View all appointments with status (Confirmed / Pending) and payment tracking.

![My Bookings](screenshots/patient/Screenshot%202026-06-20%20140057.png)

**AI Analysis** — AI-powered explanations of lab results. Patients can ask questions like "Are my values within normal range?" or "What symptoms should I watch for?"

![AI Analysis](screenshots/ai/Screenshot%202026-06-20%20141321.png)
![AI Chat](screenshots/ai/Screenshot%202026-06-20%20141400.png)
![AI Chat Response](screenshots/ai/Screenshot%202026-06-20%20141407.png)

---

### 🛠️ Admin Panel

**Admin Dashboard** — System-wide overview of bookings, revenue, staff count, patient count, and active branches.

![Admin Dashboard](screenshots/admin/Screenshot%202026-06-20%20140602.png)

**Bookings Management** — View and manage all appointments across all branches with status and payment filters.

![Admin Bookings](screenshots/admin/Screenshot%202026-06-20%20140607.png)

**Test Catalog Management** — Add, edit, and activate/deactivate lab tests.

![Test Catalog](screenshots/admin/Screenshot%202026-06-20%20140619.png)

**And more:** Templates, Reference Ranges, Pricing, Offers, Staff Management, Patient Records, Branches, and Results.

![Admin More 1](screenshots/admin/Screenshot%202026-06-20%20140631.png)
![Admin More 2](screenshots/admin/Screenshot%202026-06-20%20140649.png)
![Admin More 3](screenshots/admin/Screenshot%202026-06-20%20140703.png)
![Admin More 4](screenshots/admin/Screenshot%202026-06-20%20140719.png)
![Admin More 5](screenshots/admin/Screenshot%202026-06-20%20140735.png)

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| React | UI framework |
| JavaScript (JSX) | Language |
| Tailwind CSS | Styling |
| Axios | API communication |
| Stripe | Payment processing |
| React Router | Navigation |
| Context API | State management |
| CRACO | Build configuration |

---

## 🗂️ Project Structure

```
src/
├── api/              # Axios API calls
├── components/       # Reusable UI components
├── context/          # Auth context
├── hooks/            # Custom React hooks
├── pages/
│   ├── admin/        # Admin portal pages
│   ├── auth/         # Login, Register, Forgot Password
│   ├── patient/      # Patient portal pages
│   └── staff/        # Staff portal pages
├── styles/           # Global CSS
└── utils/            # Helper functions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/mohz7/elab-frontend.git
cd elab-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your API base URL and Stripe public key in .env

# Start the development server
npm start
```

The app will run at `http://localhost:3000`

---

## 🔑 Environment Variables

```env
REACT_APP_API_BASE_URL=https://your-backend-url/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

---

## 👤 User Roles

| Role | Access |
|---|---|
| Patient | Dashboard, Tests, Offers, Bookings, Results, AI Analysis, Cart, Profile |
| Staff | Patient Profiles, Bookings, Upload Results, Chats |
| Admin | Full system management — all of the above plus Branches, Staff, Pricing, Templates, Ranges |

---

## 🔗 Related

- [eLab Backend](https://github.com/mohz7/elab-backend) — ASP.NET Core REST API
