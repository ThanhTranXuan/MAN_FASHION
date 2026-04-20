package com.manfashion.springboot_be.DTO.Report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopEmployeeResponse {
    private String id;
    private String fullName;
    private String email;
    private Double hourlyRate;
    private Double totalHours;
    private Double totalSalary;
    private Integer month;
    private Integer year;
}
