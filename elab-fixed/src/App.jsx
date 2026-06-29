import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Home Page
import HomePage from './pages/HomePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Layout
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import BranchesPage from './pages/admin/BranchesPage';
import StaffPage from './pages/admin/StaffPage';
import TestCatalogsPage from './pages/admin/TestCatalogsPage';
import ReportTemplatesPage from './pages/admin/ReportTemplatesPage';
import ReferenceRangesPage from './pages/admin/ReferenceRangesPage';
import OffersAdminPage from './pages/admin/OffersPage';
import PricesPage from './pages/admin/PricesPage';
import BookingsAdminPage from './pages/admin/BookingsAdminPage';
import PatientsPage from './pages/admin/PatientsPage';
import PatientRecordsPage from './pages/admin/PatientRecordsPage';
import ResultsAdminPage from './pages/admin/ResultsAdminPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import PendingResultsPage from './pages/staff/PendingResultsPage';
import AllResultsPage from './pages/staff/AllResultsPage'; // ← NEW
import UploadResultPage from './pages/staff/UploadResultPage';
import StaffBookingsPage from './pages/staff/StaffBookingsPage';
import StaffChatsPage from './pages/staff/StaffChatsPage';
import StaffNotificationsPage from './pages/staff/StaffNotificationsPage';
import PatientProfilesStaffPage from './pages/staff/PatientProfilesStaffPage';
import StaffProfilePage from './pages/staff/ProfilePage';
import CartForPatient from './pages/staff/CartForPatient';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import TestsPage from './pages/patient/TestsPage';
import CartPage from './pages/patient/CartPage';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import MyBookingsPage from './pages/patient/MyBookingsPage';
import MyResultsPage from './pages/patient/MyResultsPage';
import AIChatPage from './pages/patient/AIChatPage';
import PatientChatsPage from './pages/patient/PatientChatsPage';
import NotificationsPage from './pages/patient/NotificationsPage';
import OffersPatientPage from './pages/patient/OffersPage';
import PatientProfilePage from './pages/patient/ProfilePage';

// ─── Page title map ───────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: ['Dashboard', 'Welcome back'],
  bookings: ['Bookings', 'Manage appointments'],
  'test-catalogs': ['Test Catalog', 'Manage available tests'],
  'report-templates': ['Report Templates', 'Define report structures'],
  'reference-ranges': ['Reference Ranges', 'Normal value ranges'],
  offers: ['Offers', 'Promotions and discounts'],
  prices: ['Prices', 'Test pricing per branch'],
  branches: ['Branches', 'Manage lab locations'],
  staff: ['Staff', 'Team management'],
  patients: ['Patients', 'Patient directory'],
  'patient-records': ['Patient Records', 'Medical records'],
  results: ['Results', 'Laboratory results'],
  'pending-results': ['Pending Results', 'Awaiting your review'],
  'all-results': ['All Results', 'Full history of patient test results'], // ← NEW
  'upload-result': ['Upload Result', 'Submit test results'],
  'patient-profiles': ['Patient Profiles', 'View patient details'],
  chats: ['Messages', 'Chat sessions'],
  notifications: ['Notifications', 'Your alerts'],
  tests: ['Test Catalog', 'Browse lab tests'],
  cart: ['My Cart', 'Selected tests'],
  book: ['Book Appointment', 'Schedule a visit'],
  'ai-chat': ['AI Analysis', 'AI-powered result analysis'],
  profile: ['My Profile', 'Your personal information'],
};

// ─── Admin Router ─────────────────────────────────────────────
function AdminApp({ page, onNavigate }) {
  const pageMap = {
    dashboard: <AdminDashboard onNavigate={onNavigate} />,
    bookings: <BookingsAdminPage />,
    'test-catalogs': <TestCatalogsPage />,
    'report-templates': <ReportTemplatesPage />,
    'reference-ranges': <ReferenceRangesPage />,
    offers: <OffersAdminPage />,
    prices: <PricesPage />,
    branches: <BranchesPage />,
    staff: <StaffPage />,
    patients: <PatientsPage />,
    'patient-records': <PatientRecordsPage />,
    results: <ResultsAdminPage />,
  };

  return pageMap[page] || pageMap.dashboard;
}

// ─── Staff Router ─────────────────────────────────────────────
function StaffApp({ page, onNavigate }) {
  const pageMap = {
    dashboard: <StaffDashboard onNavigate={onNavigate} />,
    'pending-results': <PendingResultsPage />,
    'all-results': <AllResultsPage />,          // ← NEW
    'upload-result': <UploadResultPage />,
    bookings: <StaffBookingsPage />,
    'patient-profiles': <PatientProfilesStaffPage />,
    chats: <StaffChatsPage />,
    notifications: <StaffNotificationsPage />,
    profile: <StaffProfilePage />,
    'cart-for-patient': <CartForPatient />,
    
    
  };

  return pageMap[page] || pageMap.dashboard;
}

// ─── Patient Router ───────────────────────────────────────────
function PatientApp({ page, onNavigate }) {
  const pageMap = {
    dashboard: <PatientDashboard onNavigate={onNavigate} />,
    tests: <TestsPage onNavigate={onNavigate} />,
    offers: <OffersPatientPage onNavigate={onNavigate} />,
    cart: <CartPage onNavigate={onNavigate} />,
    book: <BookAppointmentPage onNavigate={onNavigate} />,
    bookings: <MyBookingsPage onNavigate={onNavigate} />,
    results: <MyResultsPage onNavigate={onNavigate} />,
    'ai-chat': <AIChatPage />,
    chats: <PatientChatsPage />,
    notifications: <NotificationsPage />,
    profile: <PatientProfilePage />,
  };

  return pageMap[page] || pageMap.dashboard;
}

// ─── Authenticated Shell ──────────────────────────────────────
function AuthenticatedApp() {
  const { isAdmin, isStaff } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [unread] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [title, subtitle] = PAGE_TITLES[page] || ['eLab', ''];

  const handleNavigate = (p) => setPage(p);

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={page}
        onNavigate={handleNavigate}
        unreadCount={unread}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="main-area">
        <Topbar
          title={title}
          subtitle={subtitle}
          unreadCount={unread}
          onNotifClick={() => handleNavigate('notifications')}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="page-content">
          {isAdmin && <AdminApp page={page} onNavigate={handleNavigate} />}
          {isStaff && <StaffApp page={page} onNavigate={handleNavigate} />}
          {!isAdmin && !isStaff && <PatientApp page={page} onNavigate={handleNavigate} />}
        </main>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────
function AppContent() {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState('home');

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user) {
    if (authPage === 'register') return <RegisterPage onSwitch={setAuthPage} />;
    if (authPage === 'forgot') return <ForgotPasswordPage onSwitch={setAuthPage} />;
    if (authPage === 'login') return <LoginPage onSwitch={setAuthPage} />;
    return <HomePage onLogin={() => setAuthPage('login')} />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontSize: '14px',
            borderRadius: '10px',
          },
        }}
      />
    </AuthProvider>
  );
}