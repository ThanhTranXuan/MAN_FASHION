package com.manfashion.springboot_be.service.User;

import com.manfashion.springboot_be.DTO.User.*;
import com.manfashion.springboot_be.entity.Role;
import com.manfashion.springboot_be.entity.User;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.UserMapper;
import com.manfashion.springboot_be.repository.Role.RoleRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    //getAll
    @Override
    public Page<UserResponse> getAllUsers(String keyword, String roleIdHex, Pageable pageable) {
        Integer roleId = (roleIdHex != null && !roleIdHex.isEmpty())
                ? Integer.parseInt(roleIdHex)
                : null;
       Page<User> users= userRepository.searchUsers(roleId,keyword,pageable);
        return users.map(userMapper::toResponseDTO);
    }
    //create
    @Override
    public UserResponse createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        return userMapper.toResponseDTO(userRepository.save(user));
    }
    //getById
    @Override
    public UserResponse getUserById(String userIdStr) {
        Integer userId = Integer.valueOf(userIdStr);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toResponseDTO(user);
    }
    //update
    @Override
    public Optional<UserResponse> updateProfile(String userIdStr, UserUpdateProfileRequest req) {
        Integer userId = Integer.valueOf(userIdStr);

        return userRepository.findById(userId).map(existing -> {
            userMapper.updateProfile(req, existing);
            User saved = userRepository.save(existing);
            return userMapper.toResponseDTO(saved);
        });
    }
    //updateAvatar
    @Override
    public Optional<UserResponse> updateAvatar(String userIdHex, UserUpdateAvatarRequest req) {
        Integer userId = Integer.parseInt(userIdHex);
        return userRepository.findById(userId).map(user -> {
            userMapper.updateAvatar(req, user);
            return userMapper.toResponseDTO(userRepository.save(user));
        });
    }
    //delete
    @Override
    public void delete(String userIdHex) {
        userRepository.deleteById(Integer.parseInt(userIdHex));
    }
    //change password
    public void changePassword(String userIdHex, UserChangePasswordRequest req) {
        Integer userId = Integer.parseInt(userIdHex);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(req.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.OLD_PASSWORD_IS_INCORECT);
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }
}

