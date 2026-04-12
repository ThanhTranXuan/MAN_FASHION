package com.manfashion.springboot_be.service.Employee;


import com.manfashion.springboot_be.DTO.Employee.AttendanceResponse;
import com.manfashion.springboot_be.DTO.Employee.EmployeeDetailResponse;
import com.manfashion.springboot_be.DTO.Employee.EmployeeRequest;
import com.manfashion.springboot_be.DTO.Employee.EmployeeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeService {
    Page<EmployeeResponse> getAllEmployees(String keyword, Pageable pageable);
    EmployeeResponse createEmployee(EmployeeRequest req);
    EmployeeResponse updateEmployee(String id, EmployeeRequest req);
    void deleteEmployee(String id);
    AttendanceResponse checkIn(String userId);
    AttendanceResponse checkOut(String userId);
    EmployeeDetailResponse getWorkDetail(String userId, int month, int year);
}
