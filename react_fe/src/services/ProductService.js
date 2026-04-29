// src/services/ProductService.js
import ApiClient, { uploadClient } from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ProductService = {
  // Public
  // getAll: (params = {}) => ApiClient.get(ApiUrl.PRODUCTS, { params }),
  // 2. Sửa hàm lấy danh sách (getAll)
  getAll: (params = {}) => 
    ApiClient.get(ApiUrl.PRODUCTS, { params }).then(res => {
        // res.data.data hiện tại là cục Page (có content, totalPages...)
        // Ta bọc nó lại thành { data: { content: [...], totalPages: ... } }
        return { data: res.data.data };
    }),
  // getDetailBySlug: (slug) => ApiClient.get(ApiUrl.PRODUCT_DETAIL(slug)),
  getDetailBySlug: (slug) => 
      ApiClient.get(ApiUrl.PRODUCT_DETAIL(slug)).then(res => {
          // .data đầu tiên là của Axios
          // .data thứ hai là trường 'data' trong ApiResponse của Spring Boot
        return { data: res.data.data };
      }),
  // Admin/Employee
  getDetailById: (id) => ApiClient.get(ApiUrl.PRODUCT_BY_ID(id)).then(res=>{ return { data: res.data.data };}),
  // getStatsByCategory: () => ApiClient.get(ApiUrl.PRODUCT_STATS),
  getStatsByCategory: () => ApiClient.get(ApiUrl.PRODUCT_STATS).then(response => {
      // Axios mặc định để dữ liệu trả về ở response.data
      // Backend của ta lại bọc mảng trong trường 'data' của ApiResponse
      // => Cần gọi .data 2 lần để lấy đúng lõi, hoặc dùng || để an toàn nếu ApiClient đã có cấu hình sẵn
      return response.data.data || response.data; 
  }),

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
