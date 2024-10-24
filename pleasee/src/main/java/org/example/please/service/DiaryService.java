package org.example.please.service;

import org.example.please.entity.Diary;
import org.example.please.repository.DiaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DiaryService {

    @Autowired
    private DiaryRepository diaryRepository;

    // 전날과 오늘의 모든 사용자의 일기 가져오기
    public Map<String, List<Diary>> getDiariesForYesterdayAndToday() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = startOfDay.plusDays(1).minusSeconds(1);
        LocalDateTime endOfYesterday = startOfDay.minusSeconds(1);
        LocalDateTime startOfYesterday = startOfDay.minusDays(1);

        // 전날과 오늘의 일기를 가져오기
        List<Diary> yesterdayDiaries = diaryRepository.findByCreatedAtBetween(Timestamp.valueOf(startOfYesterday), Timestamp.valueOf(endOfYesterday));
        List<Diary> todayDiaries = diaryRepository.findByCreatedAtBetween(Timestamp.valueOf(startOfDay), Timestamp.valueOf(endOfToday));

        // 사용자 이메일이 null이 아닌 경우를 필터링하고 사용자별로 그룹화
        Map<String, List<Diary>> diariesByUser = yesterdayDiaries.stream()
                .filter(diary -> diary.getUserEmail() != null)  // null 이메일 제외
                .collect(Collectors.groupingBy(Diary::getUserEmail, Collectors.toCollection(ArrayList::new)));  // ArrayList로 수집

        // todayDiaries도 사용자별로 그룹화하고 병합
        todayDiaries.stream()
                .filter(diary -> diary.getUserEmail() != null)  // null 이메일 제외
                .forEach(diary -> diariesByUser.merge(diary.getUserEmail(),
                        new ArrayList<>(List.of(diary)),  // ArrayList로 리스트 생성
                        (existingDiaries, newDiary) -> {
                            existingDiaries.addAll(newDiary);  // 기존 리스트에 새로운 항목 추가
                            return existingDiaries;
                        }));

        return diariesByUser;
    }

    // 모든 일기 조회
    public List<Diary> getAllDiaries() {
        return diaryRepository.findAll();
    }

    // 일기 작성 로직
    public Diary createDiary(Diary diary) {
        // 작성 시간 자동 설정 (만약 클라이언트에서 제공하지 않았다면)
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        }
        return diaryRepository.save(diary);
    }

    // 특정 일기 조회
    public Diary getDiaryById(int id) {
        return diaryRepository.findById(id).orElse(null);
    }

    // 일기 삭제
    public void deleteDiary(int id) {
        diaryRepository.deleteById(id);
    }


}
