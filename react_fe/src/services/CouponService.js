import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const CouponService = {
  // getAll: (params) => ApiClient.get(ApiUrl.COUPONS, { params }),
  getAll: (params = {}) => 
      ApiClient.get(ApiUrl.COUPONS, { params }).then(res => {
          // res.data.data hiện tại là cục Page (có content, totalPages...)
          // Ta bọc nó lại thành { data: { content: [...], totalPages: ... } }
          return { data: res.data.data };
      }),
  create: (data) => ApiClient.post(ApiUrl.COUPONS, data),
  update: (id, data) => ApiClient.put(ApiUrl.UPDATE_COUPON(id), data),
  delete: (id) => ApiClient.delete(ApiUrl.DELETE_COUPON(id)),
};

export default CouponService;
