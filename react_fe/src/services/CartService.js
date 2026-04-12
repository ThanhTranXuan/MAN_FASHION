import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

// const CartService = {
//   getAll: () => ApiClient.get(ApiUrl.CART),
//   addItem: (data) => ApiClient.post(ApiUrl.CART, data),
//   updateItem: (id, data) => ApiClient.put(ApiUrl.UPDATE_CART_ITEM(id), data),
//   removeItem: (id) => ApiClient.delete(ApiUrl.REMOVE_CART_ITEM(id)),
//   clear: () => ApiClient.delete(ApiUrl.CART),
// };
const CartService = {
  // Lấy mảng từ Backend (res.data.data) và bọc lại vào một object { data: [...] }
  // Để chiều đúng logic của CartContext!
  getAll: () => ApiClient.get(ApiUrl.CART).then(res => ({ data: res.data.data || [] })),
  
  addItem: (data) => ApiClient.post(ApiUrl.CART, data).then(res => ({ data: res.data.data || [] })),
  
  updateItem: (id, data) => ApiClient.put(ApiUrl.UPDATE_CART_ITEM(id), data).then(res => ({ data: res.data.data || [] })),
  
  // Method Delete giữ nguyên
  removeItem: (id) => ApiClient.delete(ApiUrl.REMOVE_CART_ITEM(id)).then(res => res.data),
  
  clear: () => ApiClient.delete(ApiUrl.CART).then(res => res.data),
};



export default CartService;
