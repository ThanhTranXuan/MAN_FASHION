package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.Employee.AttendanceResponse;
import com.manfashion.springboot_be.entity.Attendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {

    @Mapping(target = "id", source = "id")
    AttendanceResponse toResponse(Attendance attendance);
}
