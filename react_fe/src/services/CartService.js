import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';








const CartService = {


  getAll: () => ApiClient.get(ApiUrl.CART).then(res => ({ data: res.data.data || [] })),

  addItem: (data) => ApiClient.post(ApiUrl.CART, data).then(res => ({ data: res.data.data || [] })),

  updateItem: (id, data) => ApiClient.put(ApiUrl.UPDATE_CART_ITEM(id), data).then(res => ({ data: res.data.data || [] })),


  removeItem: (id) => ApiClient.delete(ApiUrl.REMOVE_CART_ITEM(id)).then(res => res.data),

  clear: () => ApiClient.delete(ApiUrl.CART).then(res => res.data),
};



export default CartService;
