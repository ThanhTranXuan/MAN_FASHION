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


    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        return (principal instanceof String) ? (String) principal : null;
    }


    @GetMapping
    public ApiResponse<List<CartItemResponse>> getAllCartItems() {
        String userId = getCurrentUserId();
        List<CartItemResponse> items = cartService.getCartItems(userId);

        return ApiResponse.<List<CartItemResponse>>builder()
                .message("cart.get.success")
                .data(items)
                .build();
    }


    @PostMapping
    public ApiResponse<List<CartItemResponse>> addCartItem(@RequestBody CartItemRequest req) {
        String userId = getCurrentUserId();
        List<CartItemResponse> result = cartService.addItem(userId, req);

        return ApiResponse.<List<CartItemResponse>>builder()
                .message("cart.add.success")
                .data(result)
                .build();
    }


    @PutMapping("/{id}")
    public ApiResponse<List<CartItemResponse>> updateCartItem(@PathVariable String id, @RequestBody CartItemRequest req) {
        String userId = getCurrentUserId();
        List<CartItemResponse> result = cartService.updateItem(userId, id, req);

        return ApiResponse.<List<CartItemResponse>>builder()
                .message("cart.update.success")
                .data(result)
                .build();
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeCartItem(@PathVariable String id) {
        String userId = getCurrentUserId();
        cartService.removeItem(userId, id);


        return ResponseEntity.noContent().build();
    }


    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        String userId = getCurrentUserId();
        cartService.clear(userId);

        return ResponseEntity.noContent().build();
    }
}
