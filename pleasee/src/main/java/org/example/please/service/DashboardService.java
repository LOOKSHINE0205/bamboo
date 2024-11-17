package org.example.please.service;

import lombok.RequiredArgsConstructor;
import org.example.please.repository.ChattingRepository;
import org.example.please.repository.DiaryRepository;
import org.example.please.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final DiaryRepository diaryRepository;
    private final ChattingRepository chattingRepository;

    public long getTotalUsers() {
        return userRepository.countTotalUsers();
    }

    public long getActiveUsersToday() {
        return userRepository.countActiveUsersToday();
    }

    public long getTodayDiaryCount() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return diaryRepository.countTodayDiaries(startOfDay, endOfDay);
    }

    public long getTodayChattingSessions() {
        return chattingRepository.countTodayChattingSessions();
    }
}
