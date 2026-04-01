package com.manfashion.springboot_be.repository.User;

import com.manfashion.springboot_be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserRepositoryCustom {
    Page<User> searchUsers(Integer roleId, String keyword, Pageable pageable);
}