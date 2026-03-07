import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const EmployeeService = {
  // employee self actions
  checkIn: () => ApiClient.post(ApiUrl.CHECK_IN),
  checkOut: () => ApiClient.post(ApiUrl.CHECK_OUT),

  // admin actions
  getAll: (params) => ApiClient.get(ApiUrl.EMPLOYEES, { params }),
  getById: (id, { month, year } = {}) =>
    ApiClient.get(ApiUrl.EMPLOYEE_DETAIL(id, month, year)),
  create: (data) => ApiClient.post(ApiUrl.EMPLOYEES, data),
  update: (id, data) => ApiClient.put(ApiUrl.UPDATE_EMPLOYEE(id), data),
  delete: (id) => ApiClient.delete(ApiUrl.DELETE_EMPLOYEE(id)),
};

export default EmployeeService;
