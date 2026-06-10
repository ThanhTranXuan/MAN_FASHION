package com.manfashion.springboot_be.DTO.Employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {
    private String id;
    private String fullName;
    private String email;
    private Double hourlyRate;
    private Boolean isActive;
}

