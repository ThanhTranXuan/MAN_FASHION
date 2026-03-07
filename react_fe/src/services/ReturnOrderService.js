import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ReturnOrderService = {
  // USER
  requestReturn: (data) => ApiClient.post(ApiUrl.RETURNS, data),
  getMyReturns: (params) => ApiClient.get(ApiUrl.MY_RETURNS, { params }),

  // ADMIN/EMPLOYEE
  getAllAdmin: (params) => ApiClient.get(ApiUrl.RETURNS, { params }),
  updateStatusAdmin: (orderCode, status) =>
    ApiClient.patch(ApiUrl.UPDATE_RETURN_STATUS(orderCode), null, {
      params: { status },
    }),

  // 🔍 Check xem có return mới sau một mốc thời gian (millis)
  hasNewSince: (since) =>
    ApiClient.get(ApiUrl.RETURNS_HAS_NEW, {
      params: { since },
    }),
};

export default ReturnOrderService;
