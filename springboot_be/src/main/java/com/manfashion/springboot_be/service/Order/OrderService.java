package com.manfashion.springboot_be.service.Order;

import com.manfashion.springboot_be.DTO.Order.OrderRequest;
import com.manfashion.springboot_be.DTO.Order.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    // =====================================================
    // NGHIỆP VỤ NGƯỜI DÙNG (USER)
    // =====================================================

    // 1. Khách hàng tạo đơn hàng từ giỏ hàng (Check tồn kho, áp mã giảm giá, tạo link thanh toán)
    OrderResponse createFromCart(String userIdHex, OrderRequest req);

    // 2. Khách hàng xem lịch sử đơn hàng của chính mình
    Page<OrderResponse> getOrdersByUserId(String userIdHex, Pageable pageable);

    // 3. Khách hàng chủ động cập nhật trạng thái (Ví dụ: Xác nhận đã nhận hàng - COMPLETED, hoặc RETURN)
    OrderResponse updateStatusByUser(String userIdHex, String orderCode, String status);

    // 4. Khách hàng chủ động huỷ đơn (Chỉ áp dụng khi đơn đang PENDING)
    void cancelPendingOrder(String orderCode);


    // =====================================================
    // NGHIỆP VỤ QUẢN TRỊ VIÊN (ADMIN/EMPLOYEE)
    // =====================================================

    // 5. Admin cập nhật trạng thái đơn hàng để đi giao (Gửi mail thông báo cho khách)
    OrderResponse updateStatus(String orderCode, String status);

    // 6. Admin xem toàn bộ danh sách đơn hàng (Có bộ lọc tìm kiếm)
    Page<OrderResponse> getAllOrders(String code, String status, Pageable pageable);

    // 7. Cảnh báo realtime cho Admin panel xem có đơn nào mới đổ về không
    boolean hasNewOrdersAfter(long sinceMillis);
}
