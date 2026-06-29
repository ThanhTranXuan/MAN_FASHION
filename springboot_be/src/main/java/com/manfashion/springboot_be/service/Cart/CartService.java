package com.manfashion.springboot_be.service.Cart;

import com.manfashion.springboot_be.DTO.Cart.CartItemRequest;
import com.manfashion.springboot_be.DTO.Cart.CartItemResponse;

import java.util.List;

public interface CartService {

    List<CartItemResponse> getCartItems(String userIdHex);


    List<CartItemResponse> addItem(String userIdHex, CartItemRequest req);


    List<CartItemResponse> updateItem(String userIdHex, String cartItemIdHex, CartItemRequest req);


    void removeItem(String userIdHex, String cartItemIdHex);


    void clear(String userIdHex);
}
