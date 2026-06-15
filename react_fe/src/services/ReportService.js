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
  getTopEmployeesMonthly: ({ month, year } = {}) =>
    ApiClient.get(ApiUrl.REPORT_TOP_EMPLOYEES_MONTHLY(month, year)).then(res=>{ return { data: res.data.data };}),
};

export default ReportService;
