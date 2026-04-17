package com.manfashion.springboot_be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // Đổi ObjectId (MongoDB) thành Integer tự tăng (MySQL)

    // Khóa ngoại liên kết với bảng orders (Như đã thống nhất dùng Integer)
    @Column(name = "order_id")
    private Integer orderId;

    @Column(name = "payment_order_code")
    private Long paymentOrderCode;

    // Các đường link VNPay / PayOS / Momo thường rất dài, vượt quá 255 ký tự mặc định của VARCHAR.
    // Nên ép kiểu dưới Database là TEXT để không bị lỗi "Data too long for column".
    @Column(name = "payment_link", columnDefinition = "TEXT")
    private String paymentLink;

    @Column(name = "qr_code_url", columnDefinition = "TEXT")
    private String qrCodeUrl;

    @Column(name = "payment_status", length = 50)
    private String paymentStatus; // Mặc định: PAID, FAILED, REFUNDED

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "amount_vnd")
    private Double amountVND;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    // Thay thế @CreatedDate của MongoDB bằng Hibernate Annotation
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Thay thế @LastModifiedDate của MongoDB
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
