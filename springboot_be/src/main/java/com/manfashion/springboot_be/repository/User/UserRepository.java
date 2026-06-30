package com.manfashion.springboot_be.repository.User;

import com.manfashion.springboot_be.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> , UserRepositoryCustom {

    Optional<User> findByEmail(String email);

    Optional<User> findBySocialProviderAndSocialId(String socialProvider, String socialId);

    boolean existsByEmail(String email);
    Page<User> findByRoleIdAndDeletedAtIsNull(Integer roleId, Pageable pageable);


    long countByRole_IdAndDeletedAtIsNull(Integer roleId);
    long countByRole_NameAndDeletedAtIsNull(String roleName);
    Page<User> findByRole_IdAndDeletedAtIsNullOrderByCreatedAtDesc(Integer roleId, Pageable pageable);

    @Query("select r.name from User u join u.role r where u.id = :userId")
    Optional<String> findRoleNameByUserId(@Param("userId") Integer userId);
}
