
import ApiClient, { uploadClient } from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ProductService = {



  getAll: (params = {}) => {
    const normalizedParams = {
      ...params,
      sort:
        params.sort === 'price-asc'
          ? 'price_asc'
          : params.sort === 'price-desc'
            ? 'price_desc'
            : params.sort,
      sizes: params.sizes || params.variantSize,
    };
    delete normalizedParams.variantSize;

    return ApiClient.get(ApiUrl.PRODUCTS, { params: normalizedParams }).then(res => {


        return { data: res.data.data };
    });
  },

  getDetailBySlug: (slug) =>
      ApiClient.get(ApiUrl.PRODUCT_DETAIL(slug)).then(res => {


        return { data: res.data.data };
      }),
  getSimilarProducts: (id, limit = 8) =>
      ApiClient.get(ApiUrl.PRODUCT_SIMILAR(id), { params: { limit } }).then(res => {
          return { data: res.data.data };
      }),

  getDetailById: (id) => ApiClient.get(ApiUrl.PRODUCT_BY_ID(id)).then(res=>{ return { data: res.data.data };}),

  getStatsByCategory: () => ApiClient.get(ApiUrl.PRODUCT_STATS).then(response => {



      return response.data.data || response.data;
  }),
  getFilterOptions: () =>
    ApiClient.get(ApiUrl.PRODUCT_FILTER_OPTIONS).then(res => ({ data: res.data.data })),

  create: (data) => ApiClient.post(ApiUrl.CREATE_PRODUCT, data),
  update: (id, data) => ApiClient.put(ApiUrl.UPDATE_PRODUCT(id), data),
  updateActive: (id, isActive) =>
    ApiClient.patch(ApiUrl.TOGGLE_PRODUCT_ACTIVE(id), { isActive }),
  delete: (productId) => ApiClient.delete(ApiUrl.DELETE_PRODUCT(productId)),


  createVariant: (productId, data) =>
    ApiClient.post(ApiUrl.ADD_PRODUCT_VARIANT(productId), data),
  updateVariant: (variantId, data) =>
    ApiClient.put(ApiUrl.UPDATE_PRODUCT_VARIANT(variantId), data),
  deleteVariant: (variantId) =>
    ApiClient.delete(ApiUrl.DELETE_PRODUCT_VARIANT(variantId)),







  uploadImages: (productId, { color, files, remainingImageUrls } = {}) => {
    const formData = new FormData();

    if (Array.isArray(files)) {
      files.forEach((f) => formData.append('files', f));

    }

    return uploadClient.post(
      ApiUrl.UPLOAD_PRODUCT_IMAGES(productId),
      formData,
      {
        params: {
          ...(color ? { color } : {}),
          ...(Array.isArray(remainingImageUrls) ? { remainingImageUrls } : {}),
        },
      },
    );
  },
};

export default ProductService;
