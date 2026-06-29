import client from './client';

// ================= RESULTS =================
export const resultsStaffApi = {
  upload: (data) =>
    client.post('/api/staff/Result', data),

  getById: (id) =>
    client.get(`/api/staff/Result/${id}`),

  review: (id, data) =>
    client.patch(`/api/staff/Result/${id}/review`, data),

  getPending: () =>
    client.get('/api/staff/Result/pending'),

  getAll: () =>
    client.get('/api/staff/Result/GetAll', {
      params: { pageNumber: 1, pageSize: 1000 }
    }),
};

// ================= CHATS =================
export const chatsStaffApi = {
  getSessions: () =>
    client.get('/api/staff/Chats/sessions'),

  getSession: (id) =>
    client.get(`/api/staff/Chats/sessions/${id}`),

  sendMessage: (id, data) =>
    client.post(`/api/staff/Chats/sessions/${id}/messages`, data),

  markRead: (id) =>
    client.post(`/api/staff/Chats/sessions/${id}/read`),
};

// ================= NOTIFICATIONS =================
export const notificationsStaffApi = {
  getAll: () =>
    client.get('/api/staff/Notifications/GetAll'),

  getUnread: () =>
    client.get('/api/staff/Notifications/unread'),

  markAsRead: (id) =>
    client.patch(`/api/staff/Notifications/${id}/read`),

  markAllRead: () =>
    client.patch('/api/staff/Notifications/read-all'),
};

// ================= REPORT TEMPLATES =================
export const reportTemplatesStaffApi = {
  getAll: (testCatalogId) =>
    client.get('/api/staff/ReportTemplates/GetAll', {
      params: { testCatalogId }
    }),
      getByTestId: (testId) =>
    client.get(`/api/staff/ReportTemplates/GetByTestId/${testId}`),


  getById: (id) =>
    client.get(`/api/staff/ReportTemplates/GetById/${id}`),
};

// ================= REFERENCE RANGES =================
export const referenceRangesStaffApi = {
  getAll: (reportTemplateId) =>
    client.get('/api/staff/ReferenceRanges/GetAll', {
      params: { ReportTemplateId: reportTemplateId }
    }),
};

// ⚠️ FIXED DUPLICATE / BROKEN API (removed api undefined bug)
export const resultsStaffApiV2 = {
  getAll: () =>
    client.get('/api/staff/Result/GetAll'),
};

// ================= PATIENT PROFILES =================
export const patientProfilesStaffApi = {
  getAll: () =>
    client.get('/api/staff/PatientProfiles/GetAll', {
      params: { pageNumber: 1, pageSize: 1000 }
    }),
      getByIdentityNumber: (identityNumber) =>
    client.get(`/api/staff/PatientProfiles/GetById/${identityNumber}`),
  
  getById: (id) =>
    client.get(`/api/staff/PatientProfiles/GetById/${id}`),

  create: (data) =>
    client.post('/api/staff/PatientProfiles/Create', data),

  updateById: (id, data) =>
    client.patch(`/api/staff/PatientProfiles/Update/${id}`, data),
};

// ================= BOOKINGS  =================
export const bookingsStaffApi = {
  getAll: () => client.get('/api/staff/Bookings/GetAll'),

 getWithoutResult: () =>
  client.get('/api/staff/Bookings/without-result'),

  getById: (id) => client.get(`/api/staff/Bookings/GetByBookingId/${id}`),

  getByStatus: (status) =>
    client.get(`/api/staff/Bookings/status/${status}`),

  changeStatus: (bookingId, status, paymentStatus) =>
    client.patch(`/api/staff/Bookings/change-status/${bookingId}`, {
      status,
      paymentStatus,
    }),

  createBooking: (data) =>
    client.post('/api/staff/Bookings/Create', data),
};
// ================= STAFF PROFILE =================
export const staffProfileApi = {
  getById: (id) =>
    client.get(`/api/admin/StaffProfiles/GetById/${id}`),

  getMyProfile: () =>
    client.get('/api/staff/StaffProfiles/GetMyProfile'),

  changePassword: (data) =>
    client.patch('/api/staff/StaffProfiles/ChangePassword', data),
};

// ================= BRANCHES =================
export const branchesStaffApi = {
  getAll: () =>
    client.get('/api/staff/Branchs/GetAll'),
};

// ================= CHECKOUTS =================
export const checkoutsStaffApi = {
  payPatient: (patientId, data) =>
    client.post(
      `/api/staff/CheckOuts/payment/${patientId}`,
      data
    ),
};

// ================= CART =================
export const cartStaffApi = {
  getCart: (identityNumber) =>
    client.get(`/api/staff/Carts/${identityNumber}`),

  addToCart: (identityNumber, data) =>
    client.post(`/api/staff/Carts/${identityNumber}`, data),

  // ⚠️ FIXED (MOST COMMON BACKEND STYLE)
  removeItem: (identityNumber, itemId) =>
    client.delete(`/api/staff/Carts/${identityNumber}`, {
      params: { itemId }
    }),

  clearCart: (identityNumber) =>
    client.delete(`/api/staff/Carts/${identityNumber}`),
};

// ================= TEST CATALOGS =================
export const testCatalogsStaffApi = {
  getAll: () =>
    client.get('/api/staff/TestCatalogs/GetAll'),

  getById: (id) =>
    client.get(`/api/staff/TestCatalogs/GetById/${id}`),
};