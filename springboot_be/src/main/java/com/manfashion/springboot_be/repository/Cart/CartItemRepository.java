package com.manfashion.springboot_be.repository.Cart;

import com.manfashion.springboot_be.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem,Integer> {
    List<CartItem> findByCartIdOrderByCreatedAtDesc(Integer cartId);

    void deleteByCartId(Integer cartId);
}
