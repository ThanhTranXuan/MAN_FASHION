// src/contexts/CartContext.jsx
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

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useUser();
  const location = useLocation();
  const invalidateCheckoutSession = () => {
    localStorage.removeItem('checkoutSessionId');
    console.log('Giỏ hàng thay đổi → Đã xóa checkoutSessionId cũ');
  };

  const isUserRole = isAuthenticated && user?.roleName === 'USER';

  // ✅ Cho phép: guest + USER
  // ❌ Không cho: ADMIN / EMPLOYEE
  const canUseCart = !isAuthenticated || isUserRole;

  const [cart, setCart] = useState({
    items: [],
    totalPrice: 0,
    totalQuantity: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    if (!canUseCart) {
      // ADMIN / EMPLOYEE → không dùng giỏ hàng
      setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
      setLoading(false);
      return;
    }

    try {
      let data;
      if (isUserRole) {
        // 🧾 USER: giỏ ở DB
        const res = await CartService.getAll();
        const items = Array.isArray(res.data.items ?? res.data)
          ? res.data.items ?? res.data
          : [];
        const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
        data = { items, totalPrice, totalQuantity };
      } else {
        // 👤 Guest: dùng localStorage
        data = await CartHelper.getCart();
      }

      setCart({
        items: data.items || [],
        totalPrice: data.totalPrice || 0,
        totalQuantity: data.totalQuantity || 0,
      });
    } catch (err) {
      console.error(err);
      setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
    } finally {
      setLoading(false);
    }
  }, [canUseCart, isUserRole]);

  useEffect(() => {
    loadCart();
  }, [loadCart, canUseCart, location.pathname, location.search]);

  const refreshCart = loadCart;

  const addItem = async (item, toast) => {
    if (!canUseCart) return;

    // Optimistic update
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

    // Gọi API / local tuỳ role
    try {
      if (isUserRole) {
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

  // Giữ signature cũ: (id, color, size, qty, toast) để không vỡ chỗ khác
  const updateQuantity = async (id, _color, _size, qty, toast) => {
    if (!canUseCart) return;

    setCart((prev) => {
      const items = prev.items.map((i) =>
        i.id === id ? { ...i, quantity: qty } : i,
      );
      const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);

      return { items, totalPrice, totalQuantity };
    });

    try {
      if (isUserRole) {
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

  // 🎨 Đổi variant cho item (dùng trong CartSidebar + CartVariantModal)
  const updateVariant = async (item, newVariant, toast) => {
    if (!canUseCart) return;

    // Optimistic update
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
      if (isUserRole) {
        // BE cần support update variant cho cart item
        await CartService.updateItem(item.id, {
          variantId: newVariant.id,
        });
        toast?.success?.('Variant updated successfully!');
      } else {
        // Guest: dùng helper, helper đã có toast
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
    if (!canUseCart) return;

    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));

    try {
      if (isUserRole) {
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
    if (!canUseCart) return;

    try {
      if (isUserRole) {
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
