package com.manfashion.springboot_be.DTO.Chat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SenderInfo {

    private Integer userId; // Trỏ về ID trong bảng duy nhất 'users'

    private String name; // Tên hiển thị (Admin, Employee, hoặc tên Khách)

    private String avatar; // Link ảnh đại diện (Ví dụ link Cloudinary)
}
