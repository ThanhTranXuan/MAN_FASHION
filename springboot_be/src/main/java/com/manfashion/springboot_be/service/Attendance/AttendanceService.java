package com.manfashion.springboot_be.service.Attendance;

import com.manfashion.springboot_be.DTO.Employee.AttendanceResponse;

import java.util.List;

public interface AttendanceService {
    AttendanceResponse checkIn(String userIdHex);
    AttendanceResponse checkOut(String userIdHex);
    List<AttendanceResponse> getAttendance(String userIdHex, int month, int year);
}
