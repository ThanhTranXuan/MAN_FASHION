package com.manfashion.springboot_be.service.Cart;

import com.manfashion.springboot_be.DTO.Cart.CartItemRequest;
import com.manfashion.springboot_be.DTO.Cart.CartItemResponse;

import java.util.List;

public interface CartService {
    // 🧾 Lấy danh sách item trong giỏ
    List<CartItemResponse> getCartItems(String userIdHex);

    // ➕ Thêm sản phẩm vào giỏ
    List<CartItemResponse> addItem(String userIdHex, CartItemRequest req);

    // ♻️ Cập nhật giỏ hàng (variant hoặc số lượng)
    List<CartItemResponse> updateItem(String userIdHex, String cartItemIdHex, CartItemRequest req);

    // ❌ Xóa 1 item khỏi giỏ
    void removeItem(String userIdHex, String cartItemIdHex);

    // 🧹 Xóa toàn bộ giỏ hàng
    void clear(String userIdHex);
}
