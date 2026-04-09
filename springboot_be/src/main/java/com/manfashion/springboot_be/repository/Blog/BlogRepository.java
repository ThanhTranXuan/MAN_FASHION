package com.manfashion.springboot_be.repository.Blog;

import com.manfashion.springboot_be.entity.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BlogRepository extends JpaRepository<Blog,Integer> {
    Page<Blog> findByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title, Pageable pageable);

    Page<Blog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    boolean existsBySlug(String slug);

    Optional<Blog> findBySlug(String slug);
}
