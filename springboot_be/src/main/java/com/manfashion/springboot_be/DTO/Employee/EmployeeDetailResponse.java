package com.manfashion.springboot_be.DTO.Employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDetailResponse {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String roleName;
    private String avatarUrl;
    private String address;
    private LocalDateTime createdAt;
}
