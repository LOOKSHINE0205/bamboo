package org.example.please.repository;

import org.example.please.entity.Diary;
import org.example.please.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

public interface DiaryRepository extends JpaRepository<Diary, Integer> {

    // 특정 날짜에 작성된 모든 사용자의 일기 가져오기 (diaryDate 필드를 기준으로)
    List<Diary> findByDiaryDateBetween(Date start, Date end);

    // 특정 사용자가 특정 날짜에 작성한 일기 가져오기 (diaryDate 필드를 기준으로)
    List<Diary> findByUserEmailAndDiaryDateBetween(String userEmail, Date start, Date end);

    @Query(value = "SELECT d.* FROM diary_tb d JOIN user_tb u ON d.user_email = u.user_email WHERE u.user_email = :userEmail", nativeQuery = true)
    List<Diary> findDiariesByUserEmail(@Param("userEmail") String userEmail);

    @Query("SELECT d FROM Diary d WHERE d.userEmail = :userEmail AND YEAR(d.createdAt) = :year AND MONTH(d.createdAt) = :month")
    List<Diary> findByUserEmailAndYearAndMonth(String userEmail, int year, int month);

    @Query("SELECT COUNT(d) FROM Diary d WHERE d.userEmail = :userEmail")
    int countByUserEmail(@Param("userEmail") String userEmail);
}
