package com.manfashion.springboot_be.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name="order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    private Integer quantity;
    private Double price;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "variant_color")
    private String variantColor;

    @Column(name = "variant_size")
    private String variantSize;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    // Bảng này trong SQL của bạn không có created_at / updated_at
}
