import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ReportService = {
  getOverview: () => ApiClient.get(ApiUrl.REPORT_OVERVIEW).then(res=>{ return { data: res.data.data };}),
  getRevenueSummary: () => ApiClient.get(ApiUrl.REPORT_REVENUE_SUMMARY).then(res=>{ return { data: res.data.data };}),
  getCustomerSummary: () => ApiClient.get(ApiUrl.REPORT_CUSTOMER_SUMMARY).then(res=>{ return { data: res.data.data };}),
  getRevenueTrend: () => ApiClient.get(ApiUrl.REPORT_REVENUE_TREND).then(res=>{ return { data: res.data.data };}),
  getCustomerTrend: () => ApiClient.get(ApiUrl.REPORT_CUSTOMER_TREND).then(res=>{ return { data: res.data.data };}),
  getTopProductsMonthly: () =>
    ApiClient.get(ApiUrl.REPORT_TOP_PRODUCTS_MONTHLY).then(res=>{ return { data: res.data.data };}),
  getProductCategorySummary: () =>
    ApiClient.get(ApiUrl.REPORT_PRODUCT_CATEGORY_SUMMARY).then(res=>{ return { data: res.data.data };}),
};

export default ReportService;
