package org.example.please.repository;

import org.example.please.entity.Diary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;

public interface DiaryRepository extends JpaRepository<Diary, Integer> {

    // 특정 날짜에 작성된 모든 사용자의 일기 가져오기
    List<Diary> findByCreatedAtBetween(Timestamp start, Timestamp end);

    List<Diary> findByUserEmailAndCreatedAtBetween(String userEmail, Timestamp start, Timestamp end);
}
