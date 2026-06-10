import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ReturnOrderService = {
  // USER
  requestReturn: (data) => ApiClient.post(ApiUrl.RETURNS, data).then(res=>{ return { data: res.data.data };}),
  getMyReturns: (params) => ApiClient.get(ApiUrl.MY_RETURNS, { params }).then(res=>{ return { data: res.data.data };}),

  // ADMIN/EMPLOYEE
  getAllAdmin: (params) => ApiClient.get(ApiUrl.RETURNS, { params }).then(res=>{ return { data: res.data.data };}),
  updateStatusAdmin: (orderCode, status, rejectReason) =>
    ApiClient.patch(ApiUrl.UPDATE_RETURN_STATUS(orderCode), null, {
      params: { status, rejectReason: rejectReason || undefined },
    }).then((res) => res.data.data),

  // 🔍 Check xem có return mới sau một mốc thời gian (millis)
  hasNewSince: (since) =>
    ApiClient.get(ApiUrl.RETURNS_HAS_NEW, {
      params: { since },
    }),
};

export default ReturnOrderService;
