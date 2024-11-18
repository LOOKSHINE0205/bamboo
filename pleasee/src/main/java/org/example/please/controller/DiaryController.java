package org.example.please.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.please.entity.Diary;
import org.example.please.service.DiaryService;
import org.example.please.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/diaries")
public class DiaryController {

    @Autowired
    private DiaryService diaryService;

    @Autowired
    private UserService userService;

    /**
     * 사진을 포함한 일기 작성
     */
    @PostMapping("/create-with-photo")
    public ResponseEntity<Diary> createDiaryWithPhoto(
            @RequestPart("diary") String diaryData,
            @RequestPart(value = "photo", required = false) List<MultipartFile> photoFiles) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        Diary diary = objectMapper.readValue(diaryData, Diary.class); // JSON 데이터를 Diary 객체로 변환

        // 다중 파일 저장 및 일기 작성
        Diary newDiary = diaryService.createDiary(diary, photoFiles);

        // 챗봇 레벨 업데이트
        try {
            userService.updateChatbotLevelAfterDiaryCreation(diary.getUserEmail());
            System.out.println("챗봇 레벨 업데이트 완료: " + diary.getUserEmail());
        } catch (Exception e) {
            System.err.println("챗봇 레벨 업데이트 실패: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(newDiary);
    }

    /**
     * URL을 통해 사진 업로드 및 일기 작성
     */
    @PostMapping("/upload-from-url")
    public ResponseEntity<Diary> uploadFromUrl(
            @RequestParam("diary") String diaryData,
            @RequestParam("imageUrl") String imageUrl) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        Diary diary = objectMapper.readValue(diaryData, Diary.class); // JSON 데이터를 Diary 객체로 변환

        // URL을 통한 파일 다운로드 및 일기 저장
        Diary newDiary = diaryService.createDiaryFromUrl(diary, imageUrl);

        return ResponseEntity.status(HttpStatus.CREATED).body(newDiary);
    }

    /**
     * 사용자 이메일을 기준으로 일기 조회
     */
    @GetMapping("/user_diaries")
    public ResponseEntity<List<Map<String, Object>>> getDiariesByUserEmail(@RequestParam String userEmail) {
        List<Diary> diaries = diaryService.getDiariesByUserEmail(userEmail);

        // JSON 배열의 사진 데이터를 URL 리스트로 변환
        List<Map<String, Object>> diaryWithUrls = diaries.stream().map(diary -> {
            Map<String, Object> diaryMap = new HashMap<>();
            diaryMap.put("diaryIdx", diary.getDiaryIdx());
            diaryMap.put("userEmail", diary.getUserEmail());
            diaryMap.put("diaryDate", diary.getDiaryDate());
            diaryMap.put("emotionTag", diary.getEmotionTag());
            diaryMap.put("diaryWeather", diary.getDiaryWeather());
            diaryMap.put("diaryContent", diary.getDiaryContent());
            diaryMap.put("createdAt", diary.getCreatedAt());

            try {
                diaryMap.put("diaryPhoto", diaryService.createImageUrls(diary.getDiaryPhoto()));
            } catch (IOException e) {
                diaryMap.put("diaryPhoto", List.of("Error parsing image URLs"));
            }
            return diaryMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(diaryWithUrls);
    }

    /**
     * 월별 일기 조회
     */
    @GetMapping("/month")
    public ResponseEntity<List<Map<String, Object>>> getMonthDiaries(
            @RequestParam String userEmail,
            @RequestParam int year,
            @RequestParam int month) {

        List<Diary> diaries = diaryService.getDiariesByMonth(userEmail, year, month);

        // JSON 배열의 사진 데이터를 URL 리스트로 변환
        List<Map<String, Object>> diaryWithUrls = diaries.stream().map(diary -> {
            Map<String, Object> diaryMap = new HashMap<>();
            diaryMap.put("diaryIdx", diary.getDiaryIdx());
            diaryMap.put("userEmail", diary.getUserEmail());
            diaryMap.put("diaryDate", diary.getDiaryDate());
            diaryMap.put("emotionTag", diary.getEmotionTag());
            diaryMap.put("diaryWeather", diary.getDiaryWeather());
            diaryMap.put("diaryContent", diary.getDiaryContent());
            diaryMap.put("createdAt", diary.getCreatedAt());

            try {
                diaryMap.put("diaryPhoto", diaryService.createImageUrls(diary.getDiaryPhoto()));
            } catch (IOException e) {
                diaryMap.put("diaryPhoto", List.of("Error parsing image URLs"));
            }
            return diaryMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(diaryWithUrls);
    }
}
