package com.manfashion.springboot_be.DTO.Employee;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDetailResponse {
    private String employeeId;
    private int month;
    private int year;
    private Double totalHours;
    private Double totalSalary;
    private List<AttendanceResponse> attendances;
}