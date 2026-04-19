package com.manfashion.springboot_be.repository.Return;

import com.manfashion.springboot_be.entity.ReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReturnItemRepository extends JpaRepository<ReturnItem,Integer> {
    List<ReturnItem> findByReturnOrderId(Integer id);
}
