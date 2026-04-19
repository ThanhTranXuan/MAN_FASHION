// services/OrderService.js
import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const OrderService = {
  create: async (data) => {
    const response = await ApiClient.post(ApiUrl.CREATE_ORDER, data);
    return response.data.data; 
  },

  getMyOrders: (params) => ApiClient.get(ApiUrl.MY_ORDERS, { params }).then(res=>{ return { data: res.data.data };}),
  updateUserStatus: (orderCode, status) =>
    ApiClient.patch(ApiUrl.UPDATE_ORDER_STATUS(orderCode), null, {
      params: { status },
    }),

  // ADMIN
  getAllAdmin: (params) => ApiClient.get(ApiUrl.ORDERS, { params }).then(res=>{ return { data: res.data.data };}),
  updateAdminStatus: (orderCode, status) =>
    ApiClient.patch(ApiUrl.UPDATE_ORDER_STATUS(orderCode), null, {
      params: { status },
    }),

  hasNewSince: (since) =>
    ApiClient.get(ApiUrl.ORDERS_HAS_NEW, { params: { since } }),
};

export default OrderService;