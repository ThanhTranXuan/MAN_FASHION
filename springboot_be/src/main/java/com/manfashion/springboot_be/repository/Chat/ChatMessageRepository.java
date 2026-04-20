package com.manfashion.springboot_be.repository.Chat;

import com.manfashion.springboot_be.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMessageRepository extends JpaRepository<ChatMessage,Integer> {
    // Paging: page 0 = mới nhất, sort theo createdAt DESC
    Page<ChatMessage> findByConversationIdOrderByCreatedAtDesc(Integer conversationId,
                                                               Pageable pageable);
}
