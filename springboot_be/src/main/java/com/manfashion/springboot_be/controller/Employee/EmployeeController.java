package com.manfashion.springboot_be.controller.Employee;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Employee.EmployeeDetailResponse;
import com.manfashion.springboot_be.DTO.Employee.EmployeeRequest;
import com.manfashion.springboot_be.DTO.Employee.EmployeeResponse;
import com.manfashion.springboot_be.service.Employee.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<Page<EmployeeResponse>> getAllEmployees(
            @RequestParam(required = false) String keyword,
            Pageable pageable) {
        return ApiResponse.<Page<EmployeeResponse>>builder()
                .message("employee.get_all.success")
                .data(employeeService.getAllEmployees(keyword, pageable))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<EmployeeResponse> createEmployee(@RequestBody EmployeeRequest newEmployee) {
        return ApiResponse.<EmployeeResponse>builder()
                .message("employee.create.success")
                .data(employeeService.createEmployee(newEmployee))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<EmployeeResponse> updateEmployee(
            @PathVariable String id,
            @RequestBody EmployeeRequest updates) {
        return ApiResponse.<EmployeeResponse>builder()
                .message("employee.update.success")
                .data(employeeService.updateEmployee(id, updates))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<Void> deleteEmployee(@PathVariable String id) {
        employeeService.deleteEmployee(id);
        return ApiResponse.<Void>builder()
                .message("employee.delete.success")
                .build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> getEmployeeDetail(@PathVariable String id) {
        return ApiResponse.<EmployeeDetailResponse>builder()
                .message("employee.detail.get.success")
                .data(employeeService.getEmployeeDetail(id))
                .build();
    }
}
