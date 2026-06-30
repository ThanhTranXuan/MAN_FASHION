import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const unwrap = (res) => ({ data: res.data.data });

const ReviewService = {
  getReviews: (productId, page = 0, size = 10, sort = 'createdAt,desc') =>
    ApiClient.get(ApiUrl.PRODUCT_REVIEWS(productId), {
      params: { page, size, sort },
    }).then(unwrap),

  getLatestReviews: (productId, limit = 3) =>
    ApiClient.get(ApiUrl.PRODUCT_REVIEWS_LATEST(productId), {
      params: { limit },
    }).then(unwrap),

  getReviewSummary: (productId) =>
    ApiClient.get(ApiUrl.PRODUCT_REVIEWS_SUMMARY(productId)).then(unwrap),

  createReview: (productId, data) =>
    ApiClient.post(ApiUrl.PRODUCT_REVIEWS(productId), data).then(unwrap),

  getAdminReviews: (params = {}) =>
    ApiClient.get(ApiUrl.ADMIN_REVIEWS, { params }).then(unwrap),

  approveReview: (reviewId) =>
    ApiClient.patch(ApiUrl.ADMIN_REVIEW_APPROVE(reviewId)).then(unwrap),

  replyReview: (reviewId, adminReply) =>
    ApiClient.patch(ApiUrl.ADMIN_REVIEW_REPLY(reviewId), { adminReply }).then(unwrap),

  deleteReview: (reviewId) =>
    ApiClient.delete(ApiUrl.ADMIN_REVIEW_DELETE(reviewId)),
};

export default ReviewService;
