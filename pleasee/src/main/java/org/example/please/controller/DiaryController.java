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

    // 사진을 포함한 일기 작성
    @PostMapping("/create-with-photo")
    public ResponseEntity<Diary> createDiaryWithPhoto(
            @RequestPart("diary") String diaryData,
            @RequestPart(value = "photo", required = false) MultipartFile photoFile) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        // JSON 문자열로 전달된 diaryData를 Diary 객체로 변환
        Diary diary = objectMapper.readValue(diaryData, Diary.class);

        // 사진이 포함된 일기 저장
        Diary newDiary = diaryService.createDiary(diary, photoFile);

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
@GetMapping("/user_diaries")
public ResponseEntity<List<Diary>> getDiariesByUserEmail(@RequestParam String userEmail) {
    System.out.println("Received request for userEmail: " + userEmail);
    List<Diary> diaries = diaryService.getDiariesByUserEmail(userEmail);
    System.out.println("Diaries found: " + diaries.size());
    return ResponseEntity.ok(diaries);
}


}
