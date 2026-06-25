package com.manfashion.springboot_be.service.Employee;

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
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeMapper employeeMapper;

    @Override
    public Page<EmployeeResponse> getAllEmployees(String keyword, Pageable pageable) {
        Role employeeRole = getEmployeeRole();
        Integer roleId = employeeRole.getId();

        Page<User> employees = (keyword != null && !keyword.isEmpty())
                ? userRepo.searchUsers(roleId, keyword, pageable)
                : userRepo.findByRoleIdAndDeletedAtIsNull(roleId, pageable);

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
                .filter(existing -> existing.getDeletedAt() == null)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        employeeMapper.updateEmployee(req, user);
        return employeeMapper.toResponse(userRepo.save(user));
    }

    @Override
    @Transactional
    public void deleteEmployee(String id) {
        Integer employeeId = Integer.parseInt(id);
        User employee = userRepo.findById(employeeId)
                .filter(existing -> existing.getDeletedAt() == null)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (employee.getRole() == null || !"EMPLOYEE".equals(employee.getRole().getName())) {
            throw new AppException(ErrorCode.EMPLOYEE_DELETE_NOT_ALLOWED);
        }

        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (String.valueOf(employeeId).equals(String.valueOf(principal))) {
            throw new AppException(ErrorCode.EMPLOYEE_DELETE_NOT_ALLOWED);
        }

        employee.setDeletedAt(LocalDateTime.now());
        userRepo.save(employee);
    }

    @Override
    public EmployeeDetailResponse getEmployeeDetail(String userId) {
        User employee = userRepo.findById(Integer.parseInt(userId))
                .filter(existing -> existing.getDeletedAt() == null)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return EmployeeDetailResponse.builder()
                .id(String.valueOf(employee.getId()))
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .roleName(employee.getRole() == null ? null : employee.getRole().getName())
                .avatarUrl(employee.getAvatarUrl())
                .address(employee.getAddress())
                .createdAt(employee.getCreatedAt())
                .build();
    }

    private Role getEmployeeRole() {
        return roleRepo.findByName("EMPLOYEE")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
    }
}
