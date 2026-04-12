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
public class AttendanceResponse {
    private String id;
    private String userId;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Double workingHours;
    private Double salary;
}

