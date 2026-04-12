package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Employee.EmployeeRequest;
import com.manfashion.springboot_be.DTO.Employee.EmployeeResponse;
import com.manfashion.springboot_be.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "id", source = "id")
    EmployeeResponse toResponse(User user);

    // Không map trường password từ Request vào Entity tại đây để xử lý mã hóa riêng
    @Mapping(target = "password", ignore = true)
    User toEntity(EmployeeRequest request);
}
