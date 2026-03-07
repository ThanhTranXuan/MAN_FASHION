import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ReportService = {
  getOverview: () => ApiClient.get(ApiUrl.REPORT_OVERVIEW),
  getRevenueSummary: () => ApiClient.get(ApiUrl.REPORT_REVENUE_SUMMARY),
  getCustomerSummary: () => ApiClient.get(ApiUrl.REPORT_CUSTOMER_SUMMARY),
  getRevenueTrend: () => ApiClient.get(ApiUrl.REPORT_REVENUE_TREND),
  getCustomerTrend: () => ApiClient.get(ApiUrl.REPORT_CUSTOMER_TREND),
  getTopProductsMonthly: () =>
    ApiClient.get(ApiUrl.REPORT_TOP_PRODUCTS_MONTHLY),
  getTopEmployeesMonthly: ({ month, year } = {}) =>
    ApiClient.get(ApiUrl.REPORT_TOP_EMPLOYEES_MONTHLY(month, year)),

  // 🧾 Export tổng quan doanh thu tháng (dashboard)
  exportMonthlyRevenuePdf: ({ month, year } = {}) =>
    ApiClient.get(ApiUrl.REPORT_MONTHLY_REVENUE_PDF, {
      params: { month, year },
      responseType: 'blob',
    }),

  // 🧾 Export báo cáo sản phẩm (inventory + low stock)
  exportProductMonthlyPdf: ({ month, year } = {}) =>
    ApiClient.get(ApiUrl.REPORT_PRODUCT_MONTHLY_PDF, {
      params: { month, year },
      responseType: 'blob',
    }),

  // 🧾 Export báo cáo chấm công & payroll nhân viên
  exportEmployeePayrollPdf: ({ month, year } = {}) =>
    ApiClient.get(ApiUrl.REPORT_EMPLOYEE_PAYROLL_MONTHLY_PDF, {
      params: { month, year },
      responseType: 'blob',
    }),
};

export default ReportService;
