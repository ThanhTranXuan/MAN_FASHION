import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const EmployeeService = {

  getAll: (params) => ApiClient.get(ApiUrl.EMPLOYEES, { params }).then(res=>{ return { data: res.data.data };}),
  getById: (id) =>
    ApiClient.get(ApiUrl.EMPLOYEE_DETAIL(id)).then(res=>{ return { data: res.data.data };}),
  create: (data) => ApiClient.post(ApiUrl.EMPLOYEES, data),
  update: (id, data) => ApiClient.put(ApiUrl.UPDATE_EMPLOYEE(id), data),
  delete: (id) => ApiClient.delete(ApiUrl.DELETE_EMPLOYEE(id)),
};

export default EmployeeService;
