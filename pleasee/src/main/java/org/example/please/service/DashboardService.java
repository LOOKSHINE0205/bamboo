package org.example.please.service;

import lombok.RequiredArgsConstructor;
import org.example.please.repository.ChattingRepository;
import org.example.please.repository.DiaryRepository;
import org.example.please.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

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

    public Map<String, List<Long>> getWeeklyActivity() {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(7);

        // 일기 작성 수 집계
        List<Object[]> diaryStats = diaryRepository.countByDateBetween(startDate, endDate);
        // 채팅 수 집계
        List<Object[]> chatStats = chattingRepository.countByDateBetween(startDate, endDate);

        Map<String, List<Long>> weeklyStats = new HashMap<>();
        weeklyStats.put("diary", convertToList(diaryStats));
        weeklyStats.put("chat", convertToList(chatStats));

        return weeklyStats;
    }

    private List<Long> convertToList(List<Object[]> stats) {
        List<Long> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // TreeMap 사용하여 날짜 순서 보장 (또는 LinkedHashMap)
        Map<LocalDate, Long> dateCountMap = new TreeMap<>();

        // 최근 7일의 날짜를 미리 생성
        for(int i = 6; i >= 0; i--) {
            LocalDate date = now.minusDays(i).toLocalDate();
            dateCountMap.put(date, 0L);
        }

        // DB 결과를 Map에 저장 (나머지 로직은 동일)
        for(Object[] stat : stats) {
            LocalDate date;
            if (stat[0] instanceof java.sql.Date) {
                date = ((java.sql.Date) stat[0]).toLocalDate();
            } else if (stat[0] instanceof java.sql.Timestamp) {
                date = ((java.sql.Timestamp) stat[0]).toLocalDateTime().toLocalDate();
            } else if (stat[0] instanceof LocalDateTime) {
                date = ((LocalDateTime) stat[0]).toLocalDate();
            } else {
                throw new IllegalArgumentException("Unexpected date type: " + stat[0].getClass());
            }

            Long count = ((Number) stat[1]).longValue();
            dateCountMap.put(date, count);
        }

        // TreeMap은 키(날짜)순으로 자동 정렬되므로 values()를 바로 사용 가능
        result.addAll(dateCountMap.values());

        return result;
    }

    /**
     * 사용자 서비스 사용 통계를 반환합니다.
     * @return Map<String, Long> 형태로 각 사용자 그룹의 수를 반환
     */
    public Map<String, Long> getUserServiceStats() {
        Map<String, Long> stats = new HashMap<>();

        // 일기만 사용하는 사용자 수
        stats.put("diaryOnlyUsers", userRepository.countDiaryOnlyUsers());

        // 챗봇만 사용하는 사용자 수
        stats.put("chatbotOnlyUsers", userRepository.countChatbotOnlyUsers());

        // 둘 다 사용하는 사용자 수
        stats.put("bothUsers", userRepository.countBothUsers());

        // 전체 사용자 수 (이미 있는 메서드 활용)
        stats.put("totalUsers", getTotalUsers());

        return stats;
    }



}
