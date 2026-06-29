# eLab Frontend

A complete React frontend for the eLab Medical Laboratory System.

## Project Structure

```
src/
├── api/
│   ├── client.js          # Axios instance with JWT interceptor
│   ├── auth.js            # Auth endpoints (login, register, forgot/reset password)
│   ├── patient.js         # All patient-role API calls
│   ├── staff.js           # All staff-role API calls
│   └── admin.js           # All admin-role API calls
├── components/
│   ├── Sidebar.jsx        # Role-aware navigation sidebar
│   ├── Topbar.jsx         # Top header with notifications
│   ├── Modal.jsx          # Reusable modal dialog
│   ├── Table.jsx          # Reusable data table with loading skeletons
│   ├── Badge.jsx          # Status badge
│   ├── StatCard.jsx       # Dashboard stat card
│   ├── PageHeader.jsx     # Page title + actions bar
│   └── ConfirmDialog.jsx  # Confirmation dialog
├── context/
│   └── AuthContext.js     # Auth state, login/logout, role detection
├── hooks/
│   └── useApi.js          # useApi (fetch) + useSubmit (mutation) hooks
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx    # 2-step registration
│   │   └── ForgotPasswordPage.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── BranchesPage.jsx        # CRUD
│   │   ├── StaffPage.jsx           # CRUD + change password
│   │   ├── TestCatalogsPage.jsx    # CRUD + activate/deactivate
│   │   ├── ReportTemplatesPage.jsx # CRUD with dynamic fields
│   │   ├── ReferenceRangesPage.jsx # CRUD
│   │   ├── OffersPage.jsx          # CRUD + activate/deactivate
│   │   ├── PricesPage.jsx          # CRUD
│   │   ├── BookingsAdminPage.jsx   # View + change status
│   │   ├── PatientsPage.jsx        # Read-only with detail view
│   │   ├── PatientRecordsPage.jsx  # CRUD
│   │   └── ResultsAdminPage.jsx    # Read-only
│   ├── staff/
│   │   ├── StaffDashboard.jsx
│   │   ├── PendingResultsPage.jsx  # Review (approve/reject)
│   │   ├── UploadResultPage.jsx    # Dynamic form from template fields
│   │   ├── StaffBookingsPage.jsx
│   │   ├── PatientProfilesStaffPage.jsx
│   │   ├── StaffChatsPage.jsx      # Real-time-style messaging
│   │   └── StaffNotificationsPage.jsx
│   └── patient/
│       ├── PatientDashboard.jsx
│       ├── TestsPage.jsx           # Browse + add to cart
│       ├── CartPage.jsx
│       ├── BookAppointmentPage.jsx # 2-step booking with payment
│       ├── MyBookingsPage.jsx      # View + start chat
│       ├── MyResultsPage.jsx       # Full report + AI analysis trigger
│       ├── AIChatPage.jsx          # Gemini AI chat
│       ├── PatientChatsPage.jsx    # Staff messaging
│       ├── NotificationsPage.jsx   # Mark read/delete
│       ├── OffersPage.jsx
│       └── ProfilePage.jsx         # Edit profile + change password
├── styles/
│   └── globals.css        # Complete design system (CSS variables, components)
├── utils/
│   └── helpers.js         # formatDate, formatCurrency, badges, etc.
└── App.jsx                # Root router + role-based layout
```

## Setup

```bash
cp .env.example .env
# Edit .env and set REACT_APP_API_URL to your backend URL

npm install
npm start
```

## Roles

| Role    | Access |
|---------|--------|
| Admin   | Full system management (branches, staff, tests, prices, offers, bookings, results, patients) |
| Staff   | Upload/review results, view bookings, chat with patients, notifications |
| Patient | Book tests, view results, AI analysis, chat with staff, profile management |

## API Base URL

Set `REACT_APP_API_URL` in your `.env` file. The default is `https://localhost:7000`.

## Auth

JWT token is stored in `localStorage` under `elab_token`. All API requests automatically attach the `Authorization: Bearer <token>` header via Axios interceptors. On 401, the user is automatically logged out and redirected to login.
