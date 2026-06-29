import client from './client';

// Branches
export const branchesApi = {
  getAll: () => client.get('/api/patient/Branchs/GetAll'),
  getById: (id) => client.get(`/api/patient/Branchs/GetById/${id}`),
};

// Test Catalogs
export const testCatalogsApi = {
  getAll: () => client.get('/api/patient/TestCatalogs/GetAll'),
  getById: (id) => client.get(`/api/patient/TestCatalogs/GetById/${id}`, { params: { id } }),
};

// Offers
export const offersApi = {
  getAll: (branchId) => client.get('/api/patient/Offers/GetALl', { params: { branchId } }),
  getById: (id) => client.get(`/api/patient/Offers/GetById/${id}`),
};

// Prices
export const pricesApi = {
  getAll: (branchId) => client.get('/api/patient/Prices/GetALl', { params: { branchId } }),
  getById: (id) => client.get(`/api/patient/Prices/GetById/${id}`),
};

// Cart
export const cartApi = {
  // Get cart
  getCart: () =>
    client.get('/api/patient/Carts'),

  // Add item
  addToCart: (data) =>
    client.post('/api/patient/Carts', data),

  // Remove one item
  removeItem: (itemId) =>
    client.delete(`/api/patient/Carts/${itemId}`),

  // Clear cart
  clearCart: () =>
    client.delete('/api/patient/Carts'),
};

// Checkout
export const checkoutApi = {
  payment: (data) => client.post('/api/patient/CheckOuts/payment', data),
  success: (bookingId) => client.get(`/api/patient/CheckOuts/success/${bookingId}`),
};

// Bookings
export const bookingsPatientApi = {
  getMyBookings: () => client.get('/api/patient/Bookings/GetAllForPatient'),
  create: (data) => client.post('/api/patient/Bookings/Create', data),
  getById: (id) => client.get(`/api/patient/Bookings/${id}`),
};

// Results
export const resultsPatientApi = {
  getMyResults: () => client.get('/api/patient/Result/my'),
  getById: (id) => client.get(`/api/patient/Result/${id}`),
};

// Profile
export const patientProfileApi = {
  getMyProfile: () => client.get('/api/patient/PatientProfiles/GetMyProfile'),
  update: (id, data) => client.patch(`/api/patient/PatientProfiles/Update/${id}`, data),
  changePassword: (data) => client.patch('/api/patient/PatientProfiles/ChangePassword', data),
};

// Notifications
export const notificationsApi = {
  getAll: () => client.get('/api/patient/Notifications/GetAll'),
  getUnread: () => client.get('/api/patient/Notifications/unread'),
  getById: (id) => client.get(`/api/patient/Notifications/${id}`),
  markAsRead: (id) => client.patch(`/api/patient/Notifications/${id}/read`),
  markAllRead: () => client.patch('/api/patient/Notifications/read-all'),
  delete: (id) => client.delete(`/api/patient/Notifications/Remove/${id}`),
};

// Chats (Patient → Staff)
export const chatsPatientApi = {
  createSession: (data) => client.post('/api/patient/Chats/sessions', data),
  getSessions: () => client.get('/api/patient/Chats/sessions'),
  getSession: (id) => client.get(`/api/patient/Chats/sessions/${id}`),
  sendMessage: (id, data) => client.post(`/api/patient/Chats/sessions/${id}/messages`, data),
  markRead: (id) => client.post(`/api/patient/Chats/sessions/${id}/read`),
};

// AI Chat
export const aiChatApi = {
  startSession: (data) => client.post('/api/patient/AIs/sessions', data),
  getSessions: () => client.get('/api/patient/AIs/sessions'),
  getSession: (id) => client.get(`/api/patient/AIs/sessions/${id}`),
  sendMessage: (id, data) => client.post(`/api/patient/AIs/sessions/${id}/messages`, data),
};

// Staff profiles (patient view)
export const staffPublicApi = {
  getAll: () => client.get('/api/patient/StaffProfiles/GetAll'),
};



