package com.manfashion.springboot_be.repository.Product;

import com.manfashion.springboot_be.entity.Product;
import com.manfashion.springboot_be.entity.QCategory;
import com.manfashion.springboot_be.entity.QProduct;
import com.manfashion.springboot_be.entity.QProductVariant;
import com.manfashion.springboot_be.repository.User.UserRepositoryCustom;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ProductRepositoryCustomImpl implements ProductRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    private static final QProduct product = QProduct.product;
    private static final QCategory category = QCategory.category;
    private static final QProductVariant variant = QProductVariant.productVariant;

    @Override
    public Page<Product> searchAllProducts(String keyword, List<Integer> categoryIds, String color, List<String> sizes, Boolean inStock, Boolean active, String sortOption, Pageable pageable) {
        BooleanBuilder builder = buildBaseQuery(keyword, categoryIds, color, sizes, inStock, active);

        OrderSpecifier<?> orderSpecifier = product.createdAt.desc();
        if ("price_asc".equalsIgnoreCase(sortOption)) {
            orderSpecifier = product.price.asc();
        } else if ("price_desc".equalsIgnoreCase(sortOption)) {
            orderSpecifier = product.price.desc();
        }

        List<Product> content = queryFactory.selectFrom(product)
                .leftJoin(product.category, category).fetchJoin()
                .where(builder)
                .orderBy(orderSpecifier)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory.select(product.count()).from(product).where(builder).fetchOne();
        return new PageImpl<>(content, pageable, total != null ? total : 0L);
    }

    @Override
    public List<Product> searchForChatBot(String keyword, List<Integer> categoryIds, String color, List<String> sizes, int limit) {
        BooleanBuilder builder = buildBaseQuery(keyword, categoryIds, color, sizes, true, true);

        return queryFactory.selectFrom(product)
                .leftJoin(product.category, category).fetchJoin()
                .where(builder)
                .orderBy(product.createdAt.desc())
                .limit(limit)
                .fetch();
    }
    private BooleanBuilder buildBaseQuery(String keyword, List<Integer> categoryIds, String color, List<String> sizes, Boolean inStock, Boolean active) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(product.deletedAt.isNull());

        if (active != null) builder.and(product.isActive.eq(active));
        if (keyword != null && !keyword.isBlank()) {
            String kw = keyword.trim().toLowerCase();
            BooleanBuilder keywordBuilder = new BooleanBuilder();
            
            keywordBuilder.or(product.name.lower().contains(kw))
                          .or(product.category.name.lower().contains(kw))
                          .or(product.description.lower().contains(kw));
            
            builder.and(keywordBuilder);
        }

        if (categoryIds != null && !categoryIds.isEmpty()) builder.and(product.category.id.in(categoryIds));

        boolean hasColor = color != null && !color.isBlank();
        boolean hasSize = sizes != null && !sizes.isEmpty();
        boolean checkStock = Boolean.TRUE.equals(inStock);

        if (hasColor || hasSize || checkStock) {
            BooleanBuilder variantBuilder = new BooleanBuilder();
            variantBuilder.and(variant.deletedAt.isNull());

            if (hasColor) variantBuilder.and(variant.color.equalsIgnoreCase(color));
            if (hasSize) variantBuilder.and(variant.size.in(sizes));
            if (checkStock) variantBuilder.and(variant.stock.gt(0));

            builder.and(product.id.in(
                    JPAExpressions.select(variant.product.id).from(variant).where(variantBuilder)
            ));
        }
        return builder;
    }

}
