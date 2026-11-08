import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach JWT token if present
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('selfcon_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor: Global error handler
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // If expired token
      if (localStorage.getItem('selfcon_token')) {
        localStorage.removeItem('selfcon_token');
        localStorage.removeItem('selfcon_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: credentials => api.post('/auth/login', credentials),
  register: userData => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateDetails: data => api.put('/auth/updatedetails', data),
  switchRole: role => api.put('/auth/switch-role', { role }),
  updatePassword: data => api.put('/auth/updatepassword', data),
  forgotPassword: email => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
  logout: () => api.get('/auth/logout')
};

// Property endpoints
export const propertyAPI = {
  getProperties: params => api.get('/properties', { params }),
  getPropertyById: id => api.get(`/properties/${id}`),
  getFeatured: () => api.get('/properties/featured'),
  getDestinations: () => api.get('/properties/destinations'),
  createProperty: data => api.post('/properties', data),
  updateProperty: (id, data) => api.put(`/properties/${id}`, data),
  deleteProperty: id => api.delete(`/properties/${id}`),
  blockDates: (id, data) => api.post(`/properties/${id}/block-dates`, data)
};

// SelfCon AI endpoints
export const aiAPI = {
  discover: prompt => api.post('/ai/discover', { prompt }),
  parse: prompt => api.post('/ai/parse', { prompt })
};

// Booking endpoints
export const bookingAPI = {
  createBooking: data => api.post('/bookings', data),
  confirmPayment: (id, paymentData) => api.post(`/bookings/${id}/confirm-payment`, paymentData),
  getUserBookings: () => api.get('/bookings/my-bookings'),
  getHostBookings: () => api.get('/bookings/host-bookings'),
  cancelBooking: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason })
};

// Buying & Selling Offer endpoints
export const offerAPI = {
  submitOffer: data => api.post('/offers', data),
  scheduleVisit: data => api.post('/offers/schedule-visit', data),
  getMyOffers: () => api.get('/offers/my-offers'),
  getSellerOffers: () => api.get('/offers/seller-offers'),
  respondToOffer: (id, data) => api.put(`/offers/${id}/respond`, data)
};

// User & Dashboard endpoints
export const userAPI = {
  toggleFavorite: propertyId => api.post(`/users/favorites/${propertyId}`),
  getFavorites: () => api.get('/users/favorites'),
  getDashboard: () => api.get('/users/dashboard'),
  reportProperty: data => api.post('/users/report', data)
};

// Admin & Host Dashboard endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: params => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  moderateProperty: (id, data) => api.put(`/admin/properties/${id}/moderate`, data),
  getReports: () => api.get('/admin/reports'),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}/resolve`, data),
  getOwnerDashboard: () => api.get('/admin/owner-dashboard')
};

// Reviews endpoints
export const reviewAPI = {
  getReviews: propertyId => api.get(`/reviews/property/${propertyId}`),
  addReview: (propertyId, data) => api.post(`/reviews/property/${propertyId}`, data),
  replyToReview: (id, response) => api.put(`/reviews/${id}/reply`, { response })
};

// Messages endpoints
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: conversationId => api.get(`/messages/${conversationId}`),
  sendMessage: data => api.post('/messages', data)
};

// Notifications endpoints
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: id => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

// Image Upload
export const uploadAPI = {
  uploadImages: formData =>
    api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export default api;

