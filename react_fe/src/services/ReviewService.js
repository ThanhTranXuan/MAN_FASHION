import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

const ReviewService = {
  getReviews: (productId, page = 0, size = 10, sort = 'createdAt,desc') => {
    return axios.get(`${API_BASE_URL}/products/${productId}/reviews`, {
      params: { page, size, sort }
    });
  },

  getLatestReviews: (productId, limit = 3) => {
    return axios.get(`${API_BASE_URL}/products/${productId}/reviews/latest`, {
      params: { limit }
    });
  },

  getReviewSummary: (productId) => {
    return axios.get(`${API_BASE_URL}/products/${productId}/reviews/summary`);
  },

  createReview: (productId, data, userId) => {
    const headers = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    return axios.post(`${API_BASE_URL}/products/${productId}/reviews`, data, { headers });
  }
};

export default ReviewService;
