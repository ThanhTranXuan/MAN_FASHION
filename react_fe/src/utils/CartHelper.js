const CART_KEY = 'guest_cart';

export const CartHelper = {
  // 🧩 Thêm sản phẩm cho GUEST (localStorage)
  async addItem(product, toast) {
    try {
      const stored = localStorage.getItem(CART_KEY);
      const cart = stored ? JSON.parse(stored) : [];

      const index = cart.findIndex(
        (i) =>
          i.productId === product.productId &&
          i.color === product.color &&
          i.size === product.size
      );

      if (index !== -1) {
        cart[index].quantity += product.quantity || 1;
      } else {
        const nextId =
          cart.length > 0
            ? Math.max(...cart.map((i) => i.id || 0)) + 1
            : 1;

        cart.push({
          id: nextId,
          productId: product.productId,
          variantId: product.variantId,
          quantity: product.quantity || 1,
          productName: product.productName || product.name || 'Unnamed Product',
          price: product.price,
          imageUrl: product.imageUrl || product.thumbnailUrl || product.productImage || null,
          thumbnailUrl: product.thumbnailUrl || product.imageUrl || product.productImage || null,
          color: product.color || null,
          size: product.size || null,
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      toast?.success?.('Added to your cart.');
    } catch (err) {
      console.error(err);
      toast?.error?.('Failed to add item to cart.');
    }
  },

  // 🧩 Cập nhật số lượng (GUEST)
  async updateQuantity(cartItemId, quantity, toast) {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (!stored) return;

      const cart = JSON.parse(stored);
      const idx = cart.findIndex((i) => i.id === cartItemId);
      if (idx !== -1) {
        cart[idx].quantity = quantity;
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      }
    } catch (err) {
      console.error(err);
      toast?.error?.('Failed to update quantity.');
    }
  },

  // 🧩 Cập nhật variant (GUEST)
  async updateVariant(item, newVariant, toast) {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (!stored) return;
      const cart = JSON.parse(stored);

      const idx = cart.findIndex((i) => i.id === item.id);
      if (idx !== -1) {
        cart[idx].variantId = newVariant.id;
        cart[idx].color = newVariant.color;
        cart[idx].size = newVariant.size;
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        toast?.success?.('Variant updated successfully!');
      }
    } catch (err) {
      console.error(err);
      toast?.error?.('Failed to update variant.');
    }
  },

  // 🧩 Xóa item (GUEST)
  async removeItem(cartItemId) {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (!stored) return;

      const cart = JSON.parse(stored).filter((i) => i.id !== cartItemId);
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error(error);
    }
  },

  // 🧩 Lấy giỏ GUEST
  async getCart() {
    const stored = localStorage.getItem(CART_KEY);
    const cart = stored ? JSON.parse(stored) : [];
    const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalQuantity = cart.reduce((s, i) => s + i.quantity, 0);
    return { items: cart, totalPrice, totalQuantity };
  },

  clearGuest() {
    localStorage.removeItem(CART_KEY);
  },
};
