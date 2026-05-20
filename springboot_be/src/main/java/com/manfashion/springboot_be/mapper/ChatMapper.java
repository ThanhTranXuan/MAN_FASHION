package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Chat.ChatConversationSummary;
import com.manfashion.springboot_be.DTO.Chat.ChatMessageResponse;
import com.manfashion.springboot_be.entity.ChatConversation;
import com.manfashion.springboot_be.entity.ChatMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMapper {

    // 1. Ánh xạ Conversation -> Summary
    @Mapping(source = "user.fullName", target = "userName") // Giả định bảng User có trường fullName
    @Mapping(source = "user.avatarUrl", target = "userAvatarUrl")
    ChatConversationSummary toSummary(ChatConversation entity);

    List<ChatConversationSummary> toSummaryList(List<ChatConversation> entities);

    // 2. Ánh xạ ChatMessage -> ChatMessageResponse (Dành cho API lấy lịch sử /messages)
    @Mapping(source = "sender.fullName", target = "senderName")
    @Mapping(source = "sender.avatarUrl", target = "senderAvatarUrl")
    ChatMessageResponse toMessageResponse(ChatMessage entity);
}
