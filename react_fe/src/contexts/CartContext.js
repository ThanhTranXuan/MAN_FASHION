
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { CartHelper } from 'utils/CartHelper';
import { useUser } from 'contexts/UserContext';
import { useLocation } from 'react-router-dom';
import CartService from 'services/CartService';

const CartContext = createContext();

const normalizeCartItems = (items = []) =>
  items.map((item) => {
    const imageUrl =
      item.imageUrl ||
      item.thumbnailUrl ||
      item.productImage ||
      item.variantImageUrl ||
      item.product?.thumbnailUrl ||
      item.product?.images?.[0]?.url ||
      item.product?.images?.[0] ||
      null;

    return {
      ...item,
      imageUrl,
      thumbnailUrl: item.thumbnailUrl || imageUrl,
    };
  });

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useUser();
  const location = useLocation();
  const invalidateCheckoutSession = () => {
    localStorage.removeItem('checkoutSessionId');
    console.log('Giỏ hàng thay đổi → Đã xóa checkoutSessionId cũ');
  };

  const usesServerCart = isAuthenticated && Boolean(user?.id);


  const canUseCart = true;

  const [cart, setCart] = useState({
    items: [],
    totalPrice: 0,
    totalQuantity: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    try {
      let data;
      if (usesServerCart) {

        const res = await CartService.getAll();
        const items = Array.isArray(res.data.items ?? res.data)
          ? res.data.items ?? res.data
          : [];
        const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
        data = { items, totalPrice, totalQuantity };
      } else {

        data = await CartHelper.getCart();
      }

      const normalizedItems = normalizeCartItems(data.items || []);
      setCart({
        items: normalizedItems,
        totalPrice: normalizedItems.reduce((s, i) => s + i.price * i.quantity, 0),
        totalQuantity: normalizedItems.reduce((s, i) => s + i.quantity, 0),
      });
    } catch (err) {
      console.error(err);
      setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
    } finally {
      setLoading(false);
    }
  }, [usesServerCart]);

  useEffect(() => {
    loadCart();
  }, [loadCart, location.pathname, location.search]);

  const refreshCart = loadCart;

  const addItem = async (item, toast) => {

    setCart((prev) => {
      const exists = prev.items.find(
        (i) =>
          i.productId === item.productId &&
          i.color === item.color &&
          i.size === item.size,
      );

      let items;
      if (exists) {
        items = prev.items.map((i) =>
          i.productId === item.productId &&
          i.color === item.color &&
          i.size === item.size
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i,
        );
      } else {
        items = [...prev.items, item];
      }

      const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);

      return { items, totalPrice, totalQuantity };
    });


    try {
      if (usesServerCart) {
        await CartService.addItem({
          productId: item.productId,
          quantity: item.quantity || 1,
          variantId: item.variantId,
        });
        toast?.success?.('Added to your cart.');
      } else {
        await CartHelper.addItem(item, toast);
      }
    } finally {
      invalidateCheckoutSession();
      await refreshCart();
    }
  };


  const updateQuantity = async (id, _color, _size, qty, toast) => {
    setCart((prev) => {
      const items = prev.items.map((i) =>
        i.id === id ? { ...i, quantity: qty } : i,
      );
      const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);

      return { items, totalPrice, totalQuantity };
    });

    try {
      if (usesServerCart) {
        await CartService.updateItem(id, { quantity: qty });
      } else {
        await CartHelper.updateQuantity(id, qty, toast);
      }
    } catch (err) {
      console.error(err);
    } finally {
      invalidateCheckoutSession();
      await refreshCart();
    }
  };


  const updateVariant = async (item, newVariant, toast) => {

    setCart((prev) => {
      const items = prev.items.map((i) =>
        i.id === item.id
          ? {
              ...i,
              variantId: newVariant.id,
              color: newVariant.color,
              size: newVariant.size,
            }
          : i,
      );
      const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);

      return { items, totalPrice, totalQuantity };
    });

    try {
      if (usesServerCart) {

        await CartService.updateItem(item.id, {
          variantId: newVariant.id,
        });
        toast?.success?.('Variant updated successfully!');
      } else {

        await CartHelper.updateVariant(item, newVariant, toast);
      }
    } catch (err) {
      console.error(err);
      toast?.error?.('Failed to update variant.');
      await refreshCart();
    } finally {
      invalidateCheckoutSession();
      await refreshCart();
    }
  };

  const removeItem = async (id, _color, _size, toast) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));

    try {
      if (usesServerCart) {
        await CartService.removeItem(id);
      } else {
        await CartHelper.removeItem(id);
      }
    } finally {
      invalidateCheckoutSession();
      await refreshCart();
    }
  };

  const clearCart = async () => {
    try {
      if (usesServerCart) {
        await CartService.clear();
      } else {
        CartHelper.clearGuest();
      }

      setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
    } catch (err) {
      console.error('Error clearing cart:', err);
      setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
    } finally {
      invalidateCheckoutSession();
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        canUseCart,
        addItem,
        removeItem,
        updateQuantity,
        updateVariant,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
