import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const CategoryService = {
  // Public
  getAll: (params) => ApiClient.get(ApiUrl.CATEGORIES, { params }),
  getBySlug: (slug) => ApiClient.get(ApiUrl.CATEGORY_DETAIL(slug)),

  // Admin/Employee
  create: (data) => ApiClient.post(ApiUrl.CREATE_CATEGORY, data),
  update: (id, data) => ApiClient.put(ApiUrl.UPDATE_CATEGORY(id), data),
  softDelete: (id) => ApiClient.delete(ApiUrl.DELETE_CATEGORY(id)),
};

export default CategoryService;
