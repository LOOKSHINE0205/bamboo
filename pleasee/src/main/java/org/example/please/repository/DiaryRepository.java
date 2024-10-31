package org.example.please.repository;

import org.example.please.entity.Diary;
import org.example.please.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.sql.Timestamp;
import java.util.List;

public interface DiaryRepository extends JpaRepository<Diary, Integer> {

    // 특정 날짜에 작성된 모든 사용자의 일기 가져오기
    List<Diary> findByCreatedAtBetween(Timestamp start, Timestamp end);

    List<Diary> findByUserEmailAndCreatedAtBetween(String userEmail, Timestamp start, Timestamp end);

    @Query(value = "SELECT d.* FROM diary_tb d JOIN user_tb u ON d.user_email = u.user_email WHERE u.user_email = :userEmail", nativeQuery = true)
    List<Diary> findDiariesByUserEmail(@Param("userEmail") String userEmail);

}
