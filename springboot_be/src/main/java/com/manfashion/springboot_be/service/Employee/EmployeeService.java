package com.manfashion.springboot_be.service.Employee;

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
    EmployeeDetailResponse getEmployeeDetail(String userId);
}
