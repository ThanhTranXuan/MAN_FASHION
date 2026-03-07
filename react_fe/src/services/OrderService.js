// services/OrderService.js
import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const OrderService = {
  create: async (data) => {
    const response = await ApiClient.post(ApiUrl.CREATE_ORDER, data);
    return response.data; 
  },

  getMyOrders: (params) => ApiClient.get(ApiUrl.MY_ORDERS, { params }),
  updateUserStatus: (orderCode, status) =>
    ApiClient.patch(ApiUrl.UPDATE_ORDER_STATUS(orderCode), null, {
      params: { status },
    }),

  // ADMIN
  getAllAdmin: (params) => ApiClient.get(ApiUrl.ORDERS, { params }),
  updateAdminStatus: (orderCode, status) =>
    ApiClient.patch(ApiUrl.UPDATE_ORDER_STATUS(orderCode), null, {
      params: { status },
    }),

  hasNewSince: (since) =>
    ApiClient.get(ApiUrl.ORDERS_HAS_NEW, { params: { since } }),
};

export default OrderService;