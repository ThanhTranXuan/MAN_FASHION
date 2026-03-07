import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const CartService = {
  getAll: () => ApiClient.get(ApiUrl.CART),
  addItem: (data) => ApiClient.post(ApiUrl.CART, data),
  updateItem: (id, data) => ApiClient.put(ApiUrl.UPDATE_CART_ITEM(id), data),
  removeItem: (id) => ApiClient.delete(ApiUrl.REMOVE_CART_ITEM(id)),
  clear: () => ApiClient.delete(ApiUrl.CART),
};

export default CartService;
