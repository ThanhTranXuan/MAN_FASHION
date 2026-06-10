package com.manfashion.springboot_be.repository.User;

import com.manfashion.springboot_be.entity.QUser;
import com.manfashion.springboot_be.entity.User;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserRepositoryCustomImpl implements UserRepositoryCustom {
    private final JPAQueryFactory queryFactory;
    private static final QUser user = QUser.user;
    @Override
    public Page<User> searchUsers(Integer roleId, String keyword, Pageable pageable) {
        BooleanBuilder builder  = new BooleanBuilder();
        builder.and(user.isActive.isTrue());
        if (roleId != null) {
            builder.and(user.role.id.eq(roleId));
        }
        if (keyword != null && !keyword.isBlank()) {
            builder.and(
                    user.email.containsIgnoreCase(keyword)
                            .or(user.fullName.containsIgnoreCase(keyword))
            );
        }
        List<User> users = queryFactory
                .selectFrom(user)
                .where(builder)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(user.createdAt.desc())
                .fetch();

        long total = queryFactory
                .selectFrom(user)
                .where(builder)
                .fetchCount();

        return new PageImpl<>(users, pageable, total);
    }
}

