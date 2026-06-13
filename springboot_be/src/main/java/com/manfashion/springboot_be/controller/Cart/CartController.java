package com.manfashion.springboot_be.controller.Cart;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Cart.CartItemRequest;
import com.manfashion.springboot_be.DTO.Cart.CartItemResponse;
import com.manfashion.springboot_be.service.Cart.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('USER','ADMIN','EMPLOYEE')")
public class CartController {

    private final CartService cartService;

    // Helper: Lấy ID của user đang đăng nhập (Xác thực: biết ai đang gửi yêu cầu)
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        return (principal instanceof String) ? (String) principal : null;
    }

    // 🛒 GET all cart items for current user
    @GetMapping
    public ApiResponse<List<CartItemResponse>> getAllCartItems() {
        String userId = getCurrentUserId();
        List<CartItemResponse> items = cartService.getCartItems(userId);

        return ApiResponse.<List<CartItemResponse>>builder()
                .message("cart.get.success")
                .data(items)
                .build();
    }

    // ➕ ADD item to cart
    @PostMapping
    public ApiResponse<List<CartItemResponse>> addCartItem(@RequestBody CartItemRequest req) {
        String userId = getCurrentUserId();
        List<CartItemResponse> result = cartService.addItem(userId, req);

        return ApiResponse.<List<CartItemResponse>>builder()
                .message("cart.add.success")
                .data(result)
                .build();
    }

    // ♻️ UPDATE cart item quantity or details
    @PutMapping("/{id}")
    public ApiResponse<List<CartItemResponse>> updateCartItem(@PathVariable String id, @RequestBody CartItemRequest req) {
        String userId = getCurrentUserId();
        List<CartItemResponse> result = cartService.updateItem(userId, id, req);

        return ApiResponse.<List<CartItemResponse>>builder()
                .message("cart.update.success")
                .data(result)
                .build();
    }

    // ❌ REMOVE item from cart
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeCartItem(@PathVariable String id) {
        String userId = getCurrentUserId();
        cartService.removeItem(userId, id);

        // Trả về 204 No Content giống form xoá bên Category
        return ResponseEntity.noContent().build();
    }

    // 🗑️ CLEAR entire cart
    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        String userId = getCurrentUserId();
        cartService.clear(userId);

        return ResponseEntity.noContent().build();
    }
}
