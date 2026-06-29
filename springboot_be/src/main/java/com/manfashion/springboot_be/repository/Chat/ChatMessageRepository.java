package com.manfashion.springboot_be.repository.Chat;

import com.manfashion.springboot_be.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage,Integer> {

    Page<ChatMessage> findByConversationIdOrderByCreatedAtDesc(Integer conversationId,
                                                               Pageable pageable);

    List<ChatMessage> findBySenderId(Integer senderId);
}
