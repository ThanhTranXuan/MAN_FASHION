package com.manfashion.springboot_be.repository.Category;

import com.manfashion.springboot_be.entity.Category;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface CategoryRepository extends JpaRepository<Category,Integer> {
    Page<Category> findByDeletedAtIsNull(Pageable pageable);

    List<Category> findByParentId(Integer parentId);

    boolean existsBySlug(String uniqueSlug);

    Optional<Category> findBySlugAndDeletedAtIsNull(String slug);

    Optional<Category> findBySlug(String categorySlug);

    List<Category> findByParentIdIsNullAndDeletedAtIsNull();

    List<Category> findByParentIdAndDeletedAtIsNull(Integer parentId);
    // ==========================================================
    // HÀM BỔ SUNG THÊM ĐỂ PHỤC VỤ NGHIỆP VỤ XOÁ MỀM ĐỆ QUY
    // ==========================================================
    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.deletedAt = :now WHERE c.id IN :ids")
    void softDeleteByIds(@Param("ids") List<Integer> ids, @Param("now") LocalDateTime now);
}
