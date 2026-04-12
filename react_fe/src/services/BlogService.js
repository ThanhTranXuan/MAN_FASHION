import ApiClient, { uploadClient } from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const BlogService = {
  // Public
  // getAll: (params) => ApiClient.get(ApiUrl.BLOGS, { params }),
  getAll: (params = {}) => 
      ApiClient.get(ApiUrl.BLOGS, { params }).then(res => {
          // res.data.data hiện tại là cục Page (có content, totalPages...)
          // Ta bọc nó lại thành { data: { content: [...], totalPages: ... } }
          return { data: res.data.data };
      }),
  getBySlug: (slug) => ApiClient.get(ApiUrl.BLOG_DETAIL(slug)).then(res=>{ return { data: res.data.data };}),

  // Admin/Employee
  create: (data, file) => {
    const formData = new FormData();
    formData.append('blog', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (file) formData.append('file', file);
    return uploadClient.post(ApiUrl.BLOGS, formData);
  },

  update: (id, data, file) => {
    const formData = new FormData();
    formData.append('blog', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (file) formData.append('file', file);
    return uploadClient.put(ApiUrl.UPDATE_BLOG(id), formData);
  },

  delete: (id) => ApiClient.delete(ApiUrl.DELETE_BLOG(id)),
};

export default BlogService;
