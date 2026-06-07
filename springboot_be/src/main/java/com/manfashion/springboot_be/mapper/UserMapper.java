package com.manfashion.springboot_be.mapper;

import com.manfashion.springboot_be.DTO.User.UserCreateRequest;
import com.manfashion.springboot_be.DTO.User.UserResponse;
import com.manfashion.springboot_be.DTO.User.UserUpdateAvatarRequest;
import com.manfashion.springboot_be.DTO.User.UserUpdateProfileRequest;
import com.manfashion.springboot_be.entity.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roleName", expression = "java(user.getRole() != null ? user.getRole().getName() : null)")
    UserResponse toResponseDTO(User user);

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "socialProvider", ignore = true)
    @Mapping(target = "socialId", ignore = true)
    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "hourlyRate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(UserCreateRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "socialProvider", ignore = true)
    @Mapping(target = "socialId", ignore = true)
    @Mapping(target = "avatarUrl", ignore = true)
    @Mapping(target = "hourlyRate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateProfile(UserUpdateProfileRequest dto, @MappingTarget User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "socialProvider", ignore = true)
    @Mapping(target = "socialId", ignore = true)
    @Mapping(target = "phone", ignore = true)
    @Mapping(target = "fullName", ignore = true)
    @Mapping(target = "address", ignore = true)
    @Mapping(target = "hourlyRate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateAvatar(UserUpdateAvatarRequest dto, @MappingTarget User user);
}
