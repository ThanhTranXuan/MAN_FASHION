package com.manfashion.springboot_be.service.Attendance;

import com.manfashion.springboot_be.DTO.Employee.AttendanceResponse;
import com.manfashion.springboot_be.entity.Attendance;
import com.manfashion.springboot_be.entity.User;
import com.manfashion.springboot_be.exception.AppException;
import com.manfashion.springboot_be.exception.ErrorCode;
import com.manfashion.springboot_be.mapper.AttendanceMapper;
import com.manfashion.springboot_be.repository.Attendance.AttendanceRepository;
import com.manfashion.springboot_be.repository.User.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepo;
    private final UserRepository userRepo;
    private final AttendanceMapper attendanceMapper;

    @Override
    public AttendanceResponse checkIn(String userIdHex) {
        User user = findUserById(userIdHex);

        Attendance att = Attendance.builder()
                .user(user)
                .checkInTime(LocalDateTime.now())
                .build();

        attendanceRepo.save(att);
        return attendanceMapper.toResponse(att);
    }

    @Override
    public AttendanceResponse checkOut(String userIdHex) {
        User user = findUserById(userIdHex);

        Attendance att = attendanceRepo
                .findFirstByUserIdAndCheckOutTimeIsNullOrderByCheckInTimeDesc(user.getId())
                .orElseThrow(() -> new RuntimeException("No check-in found"));

        att.setCheckOutTime(LocalDateTime.now());

        double hours = Duration.between(att.getCheckInTime(), att.getCheckOutTime()).toMinutes() / 60.0;
        att.setWorkingHours(java.math.BigDecimal.valueOf(hours));

        double hourlyRate = user.getHourlyRate() != null ? user.getHourlyRate().doubleValue() : 0.0;
        att.setSalary(java.math.BigDecimal.valueOf(hours * hourlyRate));

        attendanceRepo.save(att);
        return attendanceMapper.toResponse(att);
    }

    @Override
    public List<AttendanceResponse> getAttendance(String userIdHex, int month, int year) {
        Integer userId = Integer.parseInt(userIdHex);

        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(year, month, YearMonth.of(year, month).lengthOfMonth(), 23, 59);

        return attendanceRepo.findByUserIdAndCheckInTimeBetween(userId, start, end)
                .stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    private User findUserById(String userIdHex) {
        Integer userId = Integer.parseInt(userIdHex);
        return userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
