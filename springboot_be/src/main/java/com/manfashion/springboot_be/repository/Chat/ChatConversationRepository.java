package com.manfashion.springboot_be.repository.Chat;

import com.manfashion.springboot_be.entity.ChatConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversation,Integer> {
    Optional<ChatConversation> findFirstByUserIdOrderByCreatedAtDesc(Integer userId);
    Optional<ChatConversation> findByUserId(Integer userId);
    List<ChatConversation> findByAssignedEmployeeId(Integer employeeId);
    Page<ChatConversation> findAllByOrderByLastMessageAtDesc(Pageable pageable);
}
