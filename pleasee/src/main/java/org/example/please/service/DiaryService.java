package org.example.please.service;

import org.example.please.entity.Diary;
import org.example.please.entity.User;
import org.example.please.repository.DiaryRepository;
import org.example.please.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.net.URL;

@Service
public class DiaryService {

    @Autowired
    private DiaryRepository diaryRepository;

    // 파일을 저장할 경로 설정 (실제 경로로 설정해야 함)
    private final String uploadDir = "C:/uploads/";  // 파일 저장 경로를 실제 경로로 변경해야 합니다.
    @Autowired
    private UserRepository userRepository;

    // 전날과 오늘의 모든 사용자의 일기 가져오기
    public Map<String, List<Diary>> getDiariesForYesterdayAndToday() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = startOfDay.plusDays(1).minusSeconds(1);
        LocalDateTime endOfYesterday = startOfDay.minusSeconds(1);
        LocalDateTime startOfYesterday = startOfDay.minusDays(1);

        // 전날과 오늘의 일기를 가져오기
        List<Diary> yesterdayDiaries = diaryRepository.findByDiaryDateBetween(Timestamp.valueOf(startOfYesterday), Timestamp.valueOf(endOfYesterday));
        List<Diary> todayDiaries = diaryRepository.findByDiaryDateBetween(Timestamp.valueOf(startOfDay), Timestamp.valueOf(endOfToday));

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

    // 일기 작성 로직 (사진 파일 포함)
    public Diary createDiary(Diary diary, MultipartFile photoFile) throws IOException {
        // 작성 시간 자동 설정 (만약 클라이언트에서 제공하지 않았다면)
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
        }

        // 사진 파일 처리
        if (photoFile != null && !photoFile.isEmpty()) {
            String fileName = savePhoto(photoFile);
            diary.setDiaryPhoto(fileName);  // 사진 경로 설정
        }

        return diaryRepository.save(diary);
    }

    // 사진 없이 일기 작성 로직
    public Diary createDiary(Diary diary) {
        // 작성 시간 자동 설정 (만약 클라이언트에서 제공하지 않았다면)
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
        }

        return diaryRepository.save(diary);
    }

    // 사진 파일 저장 로직
    private String savePhoto(MultipartFile photoFile) throws IOException {
        // 파일 이름을 UUID로 생성하여 저장
        String fileName = UUID.randomUUID().toString() + "_" + photoFile.getOriginalFilename();
        File targetFile = new File(uploadDir + fileName);

        // 파일 저장 디렉터리가 없으면 생성
        if (!targetFile.exists()) {
            targetFile.mkdirs();
        }

        // 파일 저장
        photoFile.transferTo(targetFile);

        // 저장된 파일 경로 반환
        return fileName;
    }

    // URL을 통해 이미지 다운로드 및 저장
    public void downloadAndSavePhoto(String imageUrl, String fileName) throws IOException {
        // URL에서 이미지를 다운로드
        URL url = new URL(imageUrl);
        BufferedImage img = ImageIO.read(url);

        // 파일 저장 경로 설정
        File outputFile = new File(uploadDir + fileName);

        // 이미지 파일 저장 (jpg 형식으로 저장)
        ImageIO.write(img, "jpg", outputFile);
    }

    // 일기 작성 로직 (URL을 통해 사진 처리)
    public Diary createDiaryFromUrl(Diary diary, String imageUrl) throws IOException {
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
        }

        // URL을 통해 파일 다운로드 및 저장
        if (imageUrl != null && !imageUrl.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + ".jpg";  // 파일 이름 생성
            downloadAndSavePhoto(imageUrl, fileName);
            diary.setDiaryPhoto(fileName);  // 사진 파일 이름 설정
        }

        return diaryRepository.save(diary);  // 일기 저장
    }


    // 특정 일기 조회
    public Diary getDiaryById(int id) {
        return diaryRepository.findById(id).orElse(null);
    }

    // 일기 삭제
    public void deleteDiary(int id) {
        diaryRepository.deleteById(id);
    }

    public List<Diary> getDiariesByUserEmail(String userEmail) {
        // 사용자 이메일로 사용자 정보를 찾기
        Optional<User> user = userRepository.findByUserEmail(userEmail);
        if (user.isPresent()) {
            // 이메일을 기준으로 다이어리 조회
            return diaryRepository.findDiariesByUserEmail(userEmail);
        } else {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
    }

}
