package com.manfashion.springboot_be.service.Employee;

import com.manfashion.springboot_be.DTO.Employee.AttendanceResponse;
import com.manfashion.springboot_be.DTO.Employee.EmployeeDetailResponse;
import com.manfashion.springboot_be.DTO.Employee.EmployeeRequest;
import com.manfashion.springboot_be.DTO.Employee.EmployeeResponse;
import com.manfashion.springboot_be.entity.Role;
import com.manfashion.springboot_be.entity.User;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.EmployeeMapper;
import com.manfashion.springboot_be.repository.Role.RoleRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import com.manfashion.springboot_be.service.Attendance.AttendanceService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService{
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final AttendanceService attendanceService;
    private final EmployeeMapper employeeMapper;
    @Override
    public Page<EmployeeResponse> getAllEmployees(String keyword, Pageable pageable) {
        Role employeeRole = getEmployeeRole();
        Integer roleId = employeeRole.getId();

        Page<User> employees = (keyword != null && !keyword.isEmpty())
                ? userRepo.searchUsers(roleId, keyword, pageable)
                : userRepo.findByRoleIdAndIsActiveTrue(roleId, pageable);

        return employees.map(employeeMapper::toResponse);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        Role role = getEmployeeRole();
        User employee = employeeMapper.toEntity(req);

        employee.setPassword(passwordEncoder.encode(req.getPassword()));
        employee.setRole(role);

        return employeeMapper.toResponse(userRepo.save(employee));
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(String id, EmployeeRequest req) {
        User user = userRepo.findById(Integer.parseInt(id))
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        employeeMapper.updateEmployee(req, user);
        // Có thể cập nhật thêm fullName, phone tùy nghiệp vụ
        return employeeMapper.toResponse(userRepo.save(user));
    }

    @Override
    @Transactional
    public void deleteEmployee(String id) {
        Integer employeeId = Integer.parseInt(id);
        User employee = userRepo.findById(employeeId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (employee.getRole() == null || !"EMPLOYEE".equals(employee.getRole().getName())) {
            throw new AppException(ErrorCode.EMPLOYEE_DELETE_NOT_ALLOWED);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (String.valueOf(employeeId).equals(String.valueOf(principal))) {
            throw new AppException(ErrorCode.EMPLOYEE_DELETE_NOT_ALLOWED);
        }

        employee.setIsActive(false);
        userRepo.save(employee);
    }

    @Override
    public AttendanceResponse checkIn(String userId) {
        return attendanceService.checkIn(userId);
    }

    @Override
    public AttendanceResponse checkOut(String userId) {
        return attendanceService.checkOut(userId);
    }

    @Override
    public EmployeeDetailResponse getWorkDetail(String userId, int month, int year) {
        List<AttendanceResponse> attendances = attendanceService.getAttendance(userId, month, year);

        // Tính tổng giờ làm và lương bằng Stream (dùng BigDecimal cho chuẩn xác)
        double totalHours = attendances.stream()
                .mapToDouble(a -> a.getWorkingHours() != null ? a.getWorkingHours().doubleValue() : 0.0)
                .sum();

        double totalSalary = attendances.stream()
                .mapToDouble(a -> a.getSalary() != null ? a.getSalary().doubleValue() : 0.0)
                .sum();

        return EmployeeDetailResponse.builder()
                .employeeId(userId)
                .month(month)
                .year(year)
                .totalHours(totalHours)
                .totalSalary(totalSalary)
                .attendances(attendances)
                .build();
    }

    private Role getEmployeeRole() {
        return roleRepo.findByName("EMPLOYEE")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    }
}
