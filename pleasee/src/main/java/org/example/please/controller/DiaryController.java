package org.example.please.controller;

import org.example.please.entity.Diary;
import org.example.please.service.DiaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/diaries")
public class DiaryController {

    @Autowired
    private DiaryService diaryService;

    // 전날과 오늘의 일기 가져오기
    @GetMapping("/yesterday-and-today")
    public ResponseEntity<Map<String, List<Diary>>> getDiariesForYesterdayAndToday() {
        Map<String, List<Diary>> diaries = diaryService.getDiariesForYesterdayAndToday();
        return ResponseEntity.ok(diaries);  // 200 OK 응답
    }

    // 사용자로부터 일기 데이터를 받아 데이터베이스에 저장
    @PostMapping("/create")
    public ResponseEntity<Diary> createDiary(@RequestBody Diary diary) {
        Diary newDiary = diaryService.createDiary(diary);
        return ResponseEntity.status(HttpStatus.CREATED).body(newDiary);
    }

    // 모든 일기 조회
    @GetMapping
    public ResponseEntity<List<Diary>> getAllDiaries() {
        List<Diary> diaries = diaryService.getAllDiaries();
        return ResponseEntity.ok(diaries);
    }

    // 특정 일기 조회
    @GetMapping("/{id}")
    public ResponseEntity<Diary> getDiaryById(@PathVariable int id) {
        Diary diary = diaryService.getDiaryById(id);
        if (diary != null) {
            return ResponseEntity.ok(diary);  // 200 OK 응답
        } else {
            return ResponseEntity.notFound().build();  // 404 Not Found 응답
        }
    }

    // 일기 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiary(@PathVariable int id) {
        diaryService.deleteDiary(id);
        return ResponseEntity.noContent().build();  // 204 No Content 응답
    }
}
