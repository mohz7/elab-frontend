import client from './client';

// Branches (Admin)
export const branchesAdminApi = {
  getAll: () => client.get('/api/admin/Branchs/GetAll'),

  getById: (id) =>
    client.get(`/api/admin/Branchs/GetById/${id}`),

  create: (data) =>
    client.post('/api/admin/Branchs/Create', data),

  update: (id, data) =>
    client.patch(`/api/admin/Branchs/Update/${id}`, data),

  deactivate: (id) =>
    client.patch(`/api/admin/Branchs/Deactivate/${id}`),

  activate: (id) =>
    client.patch(`/api/admin/Branchs/Activate/${id}`),
};

// Test Catalogs (Admin)
export const testCatalogsAdminApi = {
  getAll: () => client.get('/api/admin/TestCatalogs/GetAll'),
  getById: (id) => client.get(`/api/admin/TestCatalogs/GetById/${id}`),
  create: (data) => client.post('/api/admin/TestCatalogs/Create', data),
  update: (id, data) => client.patch(`/api/admin/TestCatalogs/Update/${id}`, data),
  deactivate: (id) => client.delete(`/api/admin/TestCatalogs/Deactivate/${id}`),
  activate: (id) => client.patch(`/api/admin/TestCatalogs/Activate/${id}`),
};

// Offers (Admin)
export const offersAdminApi = {
  getAll: (branchId) => client.get('/api/admin/Offers/getALl', { params: { branchId } }),
  getById: (id) => client.get(`/api/admin/Offers/GetById/${id}`),
  create: (data) => client.post('/api/admin/Offers/Create', data),
  update: (id, data) => client.patch(`/api/admin/Offers/Update/${id}`, data),
  deactivate: (id) => client.patch(`/api/admin/Offers/Deactivate/${id}`),
  activate: (id) => client.patch(`/api/admin/Offers/Activate/${id}`),
};

// Prices (Admin)
export const pricesAdminApi = {
  getAll: (branchId) => client.get('/api/admin/Prices/getALl', { params: { branchId } }),
  getById: (id) => client.get(`/api/admin/Prices/GetById/${id}`),
  create: (data) => client.post('/api/admin/Prices/Create', data),
  update: (id, data) => client.put(`/api/admin/Prices/Update/${id}`, data),
  remove: (id) => client.delete(`/api/admin/Prices/Remove/${id}`),
};

// Report Templates (Admin)
export const reportTemplatesAdminApi = {
  getAll: (testCatalogId) => client.get('/api/admin/ReportTemplates/GetAll', { params: { testCatalogId } }),
  getById: (id) => client.get(`/api/admin/ReportTemplates/GetById/${id}`),
  create: (data) => client.post('/api/admin/ReportTemplates/Create', data),
  update: (id, data) => client.patch(`/api/admin/ReportTemplates/Update/${id}`, data, { headers: { id } }),
  remove: (id) => client.delete(`/api/admin/ReportTemplates/Remove/${id}`),
};

// Reference Ranges (Admin)
export const referenceRangesAdminApi = {
  getAll: (reportTemplateId) => client.get('/api/admin/ReferenceRanges/GetAll', { params: { ReportTemplateId: reportTemplateId } }),
  getById: (id) => client.get(`/api/admin/ReferenceRanges/GetById/${id}`),
  create: (data) => client.post('/api/admin/ReferenceRanges/Create', data),
  update: (id, data) => client.patch(`/api/admin/ReferenceRanges/Update/${id}`, data, { headers: { id } }),
  remove: (id) => client.delete(`/api/admin/ReferenceRanges/Remove/${id}`),
};

export const staffProfilesAdminApi = {
  getAll: (params) => client.get('/api/admin/StaffProfiles/GetAll', { params }),
  getById: (id) => client.get(`/api/admin/StaffProfiles/GetById/${id}`),
  create: (data) => client.post('/api/admin/StaffProfiles/Create', data),
  update: (id, data) => client.patch(`/api/admin/StaffProfiles/Update/${id}`, data),
  deactivate: (id) => client.patch(`/api/admin/StaffProfiles/InActive/${id}`),
  activate: (id) => client.patch(`/api/admin/StaffProfiles/Active/${id}`),  // ✅ add this
  changePassword: (id, data) => client.patch(`/api/admin/StaffProfiles/ChangePassword/${id}`, data),
};
// Patient Profiles (Admin)
export const patientProfilesAdminApi = {
  getAll: () => client.get('/api/admin/PatientProfiles/GetAll'),
  getById: (id) => client.get(`/api/admin/PatientProfiles/GetById/${id}`),
  create: (data) => client.post('/api/admin/PatientProfiles/Create', data),
  update: (id, data) => client.patch(`/api/admin/PatientProfiles/Update/${id}`, data),
  changePassword: (id, data) => client.patch(`/api/admin/PatientProfiles/ChangePassword/${id}`, data),
};

// Patient Records (Admin)
export const patientRecordsAdminApi = {
  getAll: () => client.get('/api/admin/PatientRecords/GetAll'),
  getById: (id) => client.get(`/api/admin/PatientRecords/GetById/${id}`),
  getByPatient: (patientProfileId) => client.get(`/api/admin/PatientRecords/patient/${patientProfileId}`),
  create: (data) => client.post('/api/admin/PatientRecords/Create', data),
  update: (id, data) => client.patch(`/api/admin/PatientRecords/Update/${id}`, data),
  remove: (id) => client.delete(`/api/admin/PatientRecords/Remove/${id}`),
};

// Bookings (Admin)
export const bookingsAdminApi = {
  getAll: () => client.get('/api/admin/Bookings/GetAll'),
  getByStatus: (status) => client.get(`/api/admin/Bookings/status/${status}`),
  changeStatus: (bookingId, status) => client.patch(`/api/admin/Bookings/change-status/${bookingId}`, status),
};

// Results (Admin)
export const resultsAdminApi = {
    getAll:  () => client.get('api/admin/Result/GetAll'), 
  getById: (id) => client.get(`/api/admin/Result/${id}`),
};

// Notifications (Admin)
export const notificationsAdminApi = {
  getAll: () => client.get('/api/admin/Notifications/GetAll'),
};
