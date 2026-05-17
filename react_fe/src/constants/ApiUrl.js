// ApiUrl.js - centralized API endpoints with dynamic base URL

// 🌐 Base URL - lấy từ .env hoặc fallback về localhost
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// 🧩 Helper để build URL đầy đủ
const withBase = (path) => `${BASE_URL}${path}`;

const ApiUrl = {
  // ==== AUTH ====
  REGISTER: withBase('/api/auth/register'),
  LOGIN: withBase('/api/auth/login'),
  SOCIAL_LOGIN: withBase('/api/auth/social-login'),
  REFRESH_TOKEN: withBase('/api/auth/refresh'),
  FORGOT_PASSWORD: withBase('/api/auth/forgot-password'),
  RESET_PASSWORD: withBase('/api/auth/reset-password'),

  // ==== USER ACCOUNT ====
  PROFILE: withBase('/api/users/me'),
  UPDATE_PROFILE: withBase('/api/users/me'),
  UPDATE_AVATAR: withBase('/api/users/me/avatar'),
  CHANGE_PASSWORD: withBase('/api/users/me/password'),
  DELETE_ACCOUNT: withBase('/api/users/me'),

  // ==== USER MANAGEMENT (admin) ====
  ALL_USERS: withBase('/api/users'), // ?keyword=&roleId=

  // ==== PRODUCTS ====
  PRODUCTS: withBase('/api/products'),
  PRODUCT_DETAIL: (slug) => withBase(`/api/products/detail/${slug}`),
  PRODUCT_BY_ID: (id) => withBase(`/api/products/${id}`),
  PRODUCT_SIMILAR: (id) => withBase(`/api/products/${id}/similar`),
  PRODUCT_STATS: withBase('/api/products/stats'),
  CREATE_PRODUCT: withBase('/api/products'),
  UPDATE_PRODUCT: (id) => withBase(`/api/products/${id}`),
  TOGGLE_PRODUCT_ACTIVE: (id) => withBase(`/api/products/${id}/active`),
  DELETE_PRODUCT: (id) => withBase(`/api/products/${id}`),
  UPLOAD_PRODUCT_IMAGES: (id) => withBase(`/api/products/${id}/images`),
  ADD_PRODUCT_VARIANT: (id) => withBase(`/api/products/${id}/variants`),
  UPDATE_PRODUCT_VARIANT: (variantId) =>
    withBase(`/api/products/variants/${variantId}`),
  DELETE_PRODUCT_VARIANT: (variantId) =>
    withBase(`/api/products/variants/${variantId}`),

  // ==== PRODUCT REVIEWS ====
  PRODUCT_REVIEWS: (productId) => withBase(`/api/v1/products/${productId}/reviews`),
  PRODUCT_REVIEWS_LATEST: (productId) => withBase(`/api/v1/products/${productId}/reviews/latest`),
  PRODUCT_REVIEWS_SUMMARY: (productId) => withBase(`/api/v1/products/${productId}/reviews/summary`),
  ADMIN_REVIEWS: withBase('/api/v1/admin/reviews'),
  ADMIN_REVIEW_APPROVE: (reviewId) => withBase(`/api/v1/admin/reviews/${reviewId}/approve`),
  ADMIN_REVIEW_REJECT: (reviewId) => withBase(`/api/v1/admin/reviews/${reviewId}/reject`),
  ADMIN_REVIEW_REPLY: (reviewId) => withBase(`/api/v1/admin/reviews/${reviewId}/reply`),
  ADMIN_REVIEW_DELETE: (reviewId) => withBase(`/api/v1/admin/reviews/${reviewId}`),

  // ==== CATEGORIES ====
  CATEGORIES: withBase('/api/categories'),
  CATEGORY_DETAIL: (slug) => withBase(`/api/categories/${slug}`),
  CREATE_CATEGORY: withBase('/api/categories'),
  UPDATE_CATEGORY: (id) => withBase(`/api/categories/${id}`),
  DELETE_CATEGORY: (id) => withBase(`/api/categories/${id}`),

  // ==== BLOGS ====
  BLOGS: withBase('/api/blogs'),
  BLOG_DETAIL: (slug) => withBase(`/api/blogs/${slug}`),
  CREATE_BLOG: withBase('/api/blogs'),
  UPDATE_BLOG: (id) => withBase(`/api/blogs/${id}`),
  DELETE_BLOG: (id) => withBase(`/api/blogs/${id}`),

  // ==== COUPONS ====
  COUPONS: withBase('/api/coupons'),
  UPDATE_COUPON: (id) => withBase(`/api/coupons/${id}`),
  DELETE_COUPON: (id) => withBase(`/api/coupons/${id}`),

  // ==== CART ====
  CART: withBase('/api/cart'),
  UPDATE_CART_ITEM: (id) => withBase(`/api/cart/${id}`),
  REMOVE_CART_ITEM: (id) => withBase(`/api/cart/${id}`),

  // ==== ORDERS ====
  ORDERS: withBase('/api/orders'),
  CREATE_ORDER: withBase('/api/orders'),
  MY_ORDERS: withBase('/api/orders/me'),
  UPDATE_ORDER_STATUS: (orderCode) =>
    withBase(`/api/orders/${orderCode}/status`),
  // 🔍 Check có đơn mới sau timestamp (millis)
  ORDERS_HAS_NEW: withBase('/api/orders/has-new'),

  // ==== RETURNS ====
  RETURNS: withBase('/api/returns'),
  MY_RETURNS: withBase('/api/returns/me'),
  UPDATE_RETURN_STATUS: (orderCode) =>
    withBase(`/api/returns/${orderCode}/status`),
  // 🔍 Check có return mới sau timestamp
  RETURNS_HAS_NEW: withBase('/api/returns/has-new'),

  // ==== CHAT ====
  CHAT_START: withBase('/api/chat/start'),
  CHAT_ME: withBase('/api/chat/me'),
  CHAT_MESSAGES: (id) => withBase(`/api/chat/${id}/messages`),
  CHAT_ALL_ADMIN: withBase('/api/chat/admin/conversations'),
  CHAT_SEND_WS: '/app/chat/send', // WebSocket endpoint FE → BE
  CHAT_TOPIC: (id) => `/topic/chat/${id}`, // WebSocket topic BE → FE

  // ==== EMPLOYEES ====
  EMPLOYEES: withBase('/api/employees'),
  EMPLOYEE_DETAIL: (id, month, year) =>
    withBase(`/api/employees/${id}?month=${month}&year=${year}`),
  UPDATE_EMPLOYEE: (id) => withBase(`/api/employees/${id}`),
  DELETE_EMPLOYEE: (id) => withBase(`/api/employees/${id}`),
  CHECK_IN: withBase('/api/employees/check-in'),
  CHECK_OUT: withBase('/api/employees/check-out'),

  // ==== REPORTS ====
  REPORT_OVERVIEW: withBase('/api/reports/overview'),
  REPORT_REVENUE_SUMMARY: withBase('/api/reports/revenue/summary'),
  REPORT_CUSTOMER_SUMMARY: withBase('/api/reports/customers/summary'),
  REPORT_REVENUE_TREND: withBase('/api/reports/revenue/trend'),
  REPORT_CUSTOMER_TREND: withBase('/api/reports/customers/trend'),
  REPORT_TOP_CATEGORIES_WEEKLY: withBase('/api/reports/categories/top-weekly'),
  REPORT_TOP_PRODUCTS_MONTHLY: withBase('/api/reports/products/top-monthly'),
  REPORT_TOP_EMPLOYEES_MONTHLY: (month, year) => {
    let url = '/api/reports/employees/top-monthly';
    if (month !== undefined && year !== undefined) {
      url += `?month=${month}&year=${year}`;
    }
    return withBase(url);
  },

  // 🔽 Export PDF
  REPORT_MONTHLY_REVENUE_PDF: '/api/reports/monthly-revenue/pdf',
  REPORT_PRODUCT_MONTHLY_PDF: '/api/reports/products/monthly/pdf',
  REPORT_EMPLOYEE_PAYROLL_MONTHLY_PDF:
    '/api/reports/employees/payroll/monthly/pdf',
};

export default ApiUrl;
