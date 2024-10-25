package org.example.please.controller;

import org.example.please.entity.Diary;
import org.example.please.service.DiaryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
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

    // JSON으로 일기 데이터를 받아 데이터베이스에 저장 (사진 없음)
    @PostMapping("/create")
    public ResponseEntity<Diary> createDiary(@RequestBody Diary diary) {
        Diary newDiary = diaryService.createDiary(diary);  // 사진 없는 일기 저장
        return ResponseEntity.status(HttpStatus.CREATED).body(newDiary);
    }

    // 사진을 포함한 일기 작성
    @PostMapping("/create-with-photo")
    public ResponseEntity<Diary> createDiaryWithPhoto(
            @RequestParam("diary") String diaryData,
            @RequestParam(value = "photo", required = false) MultipartFile photoFile) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        Diary diary = objectMapper.readValue(diaryData, Diary.class);

        Diary newDiary = diaryService.createDiary(diary, photoFile);  // 사진 있는 일기 저장

        return ResponseEntity.status(HttpStatus.CREATED).body(newDiary);
    }


    @PostMapping("/upload-from-url")
    public ResponseEntity<Diary> uploadFromUrl(
            @RequestParam("diary") String diaryData,
            @RequestParam("imageUrl") String imageUrl) throws IOException {

        // 일기 데이터를 JSON으로 파싱
        ObjectMapper objectMapper = new ObjectMapper();
        Diary diary = objectMapper.readValue(diaryData, Diary.class);

        // URL을 통해 파일 다운로드 및 저장
        Diary newDiary = diaryService.createDiaryFromUrl(diary, imageUrl);

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
