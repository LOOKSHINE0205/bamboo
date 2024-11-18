package org.example.please.controller;

import lombok.RequiredArgsConstructor;
import org.example.please.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Long>> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", dashboardService.getTotalUsers());
        stats.put("activeUsersToday", dashboardService.getActiveUsersToday());
        stats.put("totalDiaries", dashboardService.getTodayDiaryCount());
        stats.put("todayChatSessions", dashboardService.getTodayChattingSessions());

        return ResponseEntity.ok(stats);
    }
}
