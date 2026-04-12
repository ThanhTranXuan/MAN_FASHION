package com.manfashion.springboot_be.controller.Employee;

import com.manfashion.springboot_be.DTO.ApiResponse.ApiResponse;
import com.manfashion.springboot_be.DTO.Employee.AttendanceResponse;
import com.manfashion.springboot_be.DTO.Employee.EmployeeDetailResponse;
import com.manfashion.springboot_be.DTO.Employee.EmployeeRequest;
import com.manfashion.springboot_be.DTO.Employee.EmployeeResponse;
import com.manfashion.springboot_be.service.Employee.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;

    // 👥 GET all employees (ADMIN only)
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<Page<EmployeeResponse>> getAllEmployees(
            @RequestParam(required = false) String keyword,
            Pageable pageable) {

        Page<EmployeeResponse> employees = employeeService.getAllEmployees(keyword, pageable);

        return ApiResponse.<Page<EmployeeResponse>>builder()
                .message("employee.get_all.success")
                .data(employees)
                .build();
    }

    // ➕ CREATE new employee (ADMIN only)
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<EmployeeResponse> createEmployee(@RequestBody EmployeeRequest newEmployee) {

        EmployeeResponse created = employeeService.createEmployee(newEmployee);

        return ApiResponse.<EmployeeResponse>builder()
                .message("employee.create.success")
                .data(created)
                .build();
    }

    // ♻️ UPDATE employee (ADMIN only)
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<EmployeeResponse> updateEmployee(
            @PathVariable String id,
            @RequestBody EmployeeRequest updates) {

        EmployeeResponse updated = employeeService.updateEmployee(id, updates);

        return ApiResponse.<EmployeeResponse>builder()
                .message("employee.update.success")
                .data(updated)
                .build();
    }

    // 🗑️ DELETE employee (ADMIN only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<Void> deleteEmployee(@PathVariable String id) {

        employeeService.deleteEmployee(id);

        return ApiResponse.<Void>builder()
                .message("employee.delete.success")
                .build();
    }

    // 📊 GET work detail of an employee (ADMIN only)
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> getWorkDetail(
            @PathVariable String id,
            @RequestParam int month,
            @RequestParam int year) {

        EmployeeDetailResponse detail = employeeService.getWorkDetail(id, month, year);

        return ApiResponse.<EmployeeDetailResponse>builder()
                .message("employee.detail.get.success")
                .data(detail)
                .build();
    }

    // ⏱️ EMPLOYEE check-in (EMPLOYEE only)
    @PostMapping("/check-in")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public ApiResponse<AttendanceResponse> checkIn() {

        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        AttendanceResponse attendance = employeeService.checkIn(userId);

        return ApiResponse.<AttendanceResponse>builder()
                .message("attendance.check_in.success")
                .data(attendance)
                .build();
    }

    // ⏲️ EMPLOYEE check-out (EMPLOYEE only)
    @PostMapping("/check-out")
    @PreAuthorize("hasAuthority('EMPLOYEE')")
    public ApiResponse<AttendanceResponse> checkOut() {

        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        AttendanceResponse attendance = employeeService.checkOut(userId);

        return ApiResponse.<AttendanceResponse>builder()
                .message("attendance.check_out.success")
                .data(attendance)
                .build();
    }
}
