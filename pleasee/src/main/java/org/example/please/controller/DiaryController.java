package org.example.please.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import org.example.please.entity.Diary;
import org.example.please.service.DiaryService;
import com.fasterxml.jackson.databind.ObjectMapper;
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
            @RequestPart(value = "photo", required = false) List<MultipartFile> photoFiles) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        Diary diary = objectMapper.readValue(diaryData, Diary.class);

        // 다중 파일을 지원하는 메서드 호출
        Diary newDiary = diaryService.createDiary(diary, photoFiles);

        // 일기 저장 후 챗봇 레벨 업데이트
        try {
            userService.updateChatbotLevelAfterDiaryCreation(diary.getUserEmail());
            System.out.println("챗봇 레벨 업데이트 완료: " + diary.getUserEmail());
        } catch (Exception e) {
            System.err.println("챗봇 레벨 업데이트 실패: " + e.getMessage());
        }

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
    public ResponseEntity<List<Map<String, Object>>> getDiariesByUserEmail(@RequestParam String userEmail) {
        System.out.println("Received request for userEmail: " + userEmail);

        List<Diary> diaries = diaryService.getDiariesByUserEmail(userEmail);
        System.out.println("Diaries found: " + diaries.size());

        // 다이어리 데이터와 URL을 포함하는 Map으로 변환하여 반환
        List<Map<String, Object>> diaryWithUrls = diaries.stream().map(diary -> {
            Map<String, Object> diaryMap = new HashMap<>();
            diaryMap.put("diaryIdx", diary.getDiaryIdx());
            diaryMap.put("userEmail", diary.getUserEmail());
            diaryMap.put("diaryDate", diary.getDiaryDate());
            diaryMap.put("emotionTag", diary.getEmotionTag());
            diaryMap.put("diaryWeather", diary.getDiaryWeather());
            diaryMap.put("diaryContent", diary.getDiaryContent());
            diaryMap.put("createdAt", diary.getCreatedAt());
            // 이미지 URL 생성 및 추가
            try {
                diaryMap.put("diaryPhoto", diaryService.createImageUrls(diary.getDiaryPhoto()));
            } catch (IOException e) {
                e.printStackTrace(); // 로그 출력
                diaryMap.put("diaryPhoto", "Error parsing image URLs");
            }
            return diaryMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(diaryWithUrls);
    }

    // diaryPhoto URL 생성 메서드
    private String createImageUrl(String diaryPhoto) {
        try {
            // 서버의 기본 URL을 선언합니다.
            String serverBaseUrl = "192.168.21.191:8082"; // 실제 서버 주소를 사용하세요.

            // diaryPhoto가 JSON 배열 형식일 경우 처리
            ObjectMapper objectMapper = new ObjectMapper();
            List<String> photoList = objectMapper.readValue(diaryPhoto, new TypeReference<List<String>>() {});

            return photoList.stream()
                    .map(photo -> serverBaseUrl + "/uploads/images/db/" + photo) // URL을 결합하여 완전한 경로 생성
                    .collect(Collectors.joining(","));
        } catch (IOException e) {
            // JSON 파싱 오류 처리
            e.printStackTrace();
            return "";
        }
    }


    @GetMapping("/month")
    public List<Diary> getMonthDiaries(
            @RequestParam String userEmail,
            @RequestParam int year,
            @RequestParam int month) {
        return diaryService.getDiariesByMonth(userEmail, year, month);
    }



}
