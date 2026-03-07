// src/services/ProductService.js
import ApiClient, { uploadClient } from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ProductService = {
  // Public
  getAll: (params = {}) => ApiClient.get(ApiUrl.PRODUCTS, { params }),
  getDetailBySlug: (slug) => ApiClient.get(ApiUrl.PRODUCT_DETAIL(slug)),

  // Admin/Employee
  getDetailById: (id) => ApiClient.get(ApiUrl.PRODUCT_BY_ID(id)),
  getStatsByCategory: () => ApiClient.get(ApiUrl.PRODUCT_STATS),

  create: (data) => ApiClient.post(ApiUrl.CREATE_PRODUCT, data),
  update: (id, data) => ApiClient.put(ApiUrl.UPDATE_PRODUCT(id), data),
  updateActive: (id, isActive) =>
    ApiClient.patch(ApiUrl.TOGGLE_PRODUCT_ACTIVE(id), { isActive }),
  delete: (productId) => ApiClient.delete(ApiUrl.DELETE_PRODUCT(productId)),

  // Variants (JSON)
  createVariant: (productId, data) =>
    ApiClient.post(ApiUrl.ADD_PRODUCT_VARIANT(productId), data),
  updateVariant: (variantId, data) =>
    ApiClient.put(ApiUrl.UPDATE_PRODUCT_VARIANT(variantId), data),
  deleteVariant: (variantId) =>
    ApiClient.delete(ApiUrl.DELETE_PRODUCT_VARIANT(variantId)),

  /**
   * Images:
   *  - Nếu không có color: replace ALL ảnh của product
   *  - Nếu có color: replace ALL ảnh của product + color đó
   *  - Nếu không append file nào => BE hiểu là 'xoá hết'
   */
  uploadImages: (productId, { color, files } = {}) => {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((f) => formData.append('files', f));
      // nếu files rỗng thì FormData không có 'files' => BE nhận files == null
    }

    return uploadClient.post(
      ApiUrl.UPLOAD_PRODUCT_IMAGES(productId),
      formData,
      {
        params: color ? { color } : undefined,
      },
    );
  },
};

export default ProductService;
