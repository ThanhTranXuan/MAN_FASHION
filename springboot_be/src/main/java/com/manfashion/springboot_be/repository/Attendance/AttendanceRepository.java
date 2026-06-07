package com.manfashion.springboot_be.repository.Attendance;

import com.manfashion.springboot_be.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance,Integer> {
    Optional<Attendance> findFirstByUserIdAndCheckOutTimeIsNullOrderByCheckInTimeDesc(Integer userId);

    List<Attendance> findByUserIdAndCheckInTimeBetween(Integer userId, LocalDateTime start, LocalDateTime end);

    void deleteByUserId(Integer userId);
}
