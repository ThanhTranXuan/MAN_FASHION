package com.manfashion.springboot_be.DTO.Chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarkReadRequest {

    // Chỉ cần ID phòng chat là đủ để server biết cần update bảng nào
    private Integer conversationId;
}
