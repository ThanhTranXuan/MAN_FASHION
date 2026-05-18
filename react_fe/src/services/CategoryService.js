import ApiClient, { uploadClient } from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const toCategoryFormData = (data, file) => {
  const formData = new FormData();
  formData.append(
    'category',
    new Blob([JSON.stringify(data)], { type: 'application/json' }),
  );
  if (file) formData.append('file', file);
  return formData;
};

const CategoryService = {
  // Public
  getAll: (params) => ApiClient.get(ApiUrl.CATEGORIES, { params }),
  getBySlug: (slug) => ApiClient.get(ApiUrl.CATEGORY_DETAIL(slug)),

  // Admin/Employee
  create: (data, file) =>
    file
      ? uploadClient.post(ApiUrl.CREATE_CATEGORY, toCategoryFormData(data, file))
      : ApiClient.post(ApiUrl.CREATE_CATEGORY, data),
  update: (id, data, file) =>
    file
      ? uploadClient.put(ApiUrl.UPDATE_CATEGORY(id), toCategoryFormData(data, file))
      : ApiClient.put(ApiUrl.UPDATE_CATEGORY(id), data),
  softDelete: (id) => ApiClient.delete(ApiUrl.DELETE_CATEGORY(id)),
};

export default CategoryService;
