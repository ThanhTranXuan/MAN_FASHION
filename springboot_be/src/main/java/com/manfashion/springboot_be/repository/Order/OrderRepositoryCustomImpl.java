package com.manfashion.springboot_be.repository.Order;

import com.manfashion.springboot_be.entity.Order;
import com.manfashion.springboot_be.entity.QOrder;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class OrderRepositoryCustomImpl implements  OrderRepositoryCustom{

    private final JPAQueryFactory queryFactory;
    private static final QOrder order = QOrder.order;

    @Override
    public Page<Order> searchOrders(String keyword, String status, String paymentMethod,
                                    LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable) {

        // 1. Khởi tạo bộ xây dựng điều kiện (giống logic buildBaseQuery của Product)
        BooleanBuilder builder = new BooleanBuilder();

        // Lọc theo từ khóa (mã đơn hàng hoặc thông tin liên quan)
        if (keyword != null && !keyword.isBlank()) {
            builder.and(order.orderCode.containsIgnoreCase(keyword));
        }

        // Lọc theo trạng thái
        if (status != null && !status.isBlank()) {
            builder.and(order.status.eq(status));
        }

        // Lọc theo phương thức thanh toán
        if (paymentMethod != null && !paymentMethod.isBlank()) {
            builder.and(order.paymentMethod.eq(paymentMethod));
        }

        // Lọc theo khoảng thời gian (Nghiệp vụ báo cáo/thống kê)
        if (fromDate != null) {
            builder.and(order.createdAt.goe(fromDate)); // Greater than or equal
        }
        if (toDate != null) {
            builder.and(order.createdAt.loe(toDate)); // Less than or equal
        }

        // 2. Thực hiện truy vấn lấy dữ liệu trang hiện tại
        List<Order> content = queryFactory.selectFrom(order)
                .where(builder)
                .orderBy(order.createdAt.desc()) // Mặc định đơn mới nhất lên đầu
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        // 3. Đếm tổng số bản ghi để phục vụ phân trang
        Long total = queryFactory.select(order.count())
                .from(order)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(content, pageable, total != null ? total : 0L);
    }
}
