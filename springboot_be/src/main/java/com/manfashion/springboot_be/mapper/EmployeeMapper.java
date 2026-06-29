package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Employee.EmployeeRequest;
import com.manfashion.springboot_be.DTO.Employee.EmployeeResponse;
import com.manfashion.springboot_be.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "id", source = "id")
    @Mapping(target = "roleName", expression = "java(user.getRole() != null ? user.getRole().getName() : null)")
    EmployeeResponse toResponse(User user);


    @Mapping(target = "password", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "socialProvider", ignore = true)
    @Mapping(target = "socialId", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(EmployeeRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "socialProvider", ignore = true)
    @Mapping(target = "socialId", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEmployee(EmployeeRequest request, @MappingTarget User user);
}
