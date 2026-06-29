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


        BooleanBuilder builder = new BooleanBuilder();


        if (keyword != null && !keyword.isBlank()) {
            builder.and(order.orderCode.containsIgnoreCase(keyword));
        }


        if (status != null && !status.isBlank()) {
            builder.and(order.status.eq(status));
        }


        if (paymentMethod != null && !paymentMethod.isBlank()) {
            builder.and(order.paymentMethod.eq(paymentMethod));
        }


        if (fromDate != null) {
            builder.and(order.createdAt.goe(fromDate));
        }
        if (toDate != null) {
            builder.and(order.createdAt.loe(toDate));
        }


        List<Order> content = queryFactory.selectFrom(order)
                .where(builder)
                .orderBy(order.createdAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();


        Long total = queryFactory.select(order.count())
                .from(order)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(content, pageable, total != null ? total : 0L);
    }
}
