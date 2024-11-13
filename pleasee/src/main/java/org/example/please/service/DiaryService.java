package org.example.please.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.beans.factory.annotation.Value;

@Service
public class DiaryService {

    @Value("${server.base.url}")
    private String serverAddress;

    @Autowired
    private DiaryRepository diaryRepository;

    private final String uploadDir = "C:/uploads/images/db/";  // 파일 저장 경로
    @Autowired
    private UserRepository userRepository;

    // 전날과 오늘의 모든 사용자의 일기 가져오기
    public Map<String, List<Diary>> getDiariesForYesterdayAndToday() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = startOfDay.plusDays(1).minusSeconds(1);
        LocalDateTime endOfYesterday = startOfDay.minusSeconds(1);
        LocalDateTime startOfYesterday = startOfDay.minusDays(1);

        List<Diary> yesterdayDiaries = diaryRepository.findByDiaryDateBetween(Timestamp.valueOf(startOfYesterday), Timestamp.valueOf(endOfYesterday));
        List<Diary> todayDiaries = diaryRepository.findByDiaryDateBetween(Timestamp.valueOf(startOfDay), Timestamp.valueOf(endOfToday));

        Map<String, List<Diary>> diariesByUser = yesterdayDiaries.stream()
                .filter(diary -> diary.getUserEmail() != null)
                .collect(Collectors.groupingBy(Diary::getUserEmail, Collectors.toCollection(ArrayList::new)));

        todayDiaries.stream()
                .filter(diary -> diary.getUserEmail() != null)
                .forEach(diary -> diariesByUser.merge(diary.getUserEmail(),
                        new ArrayList<>(List.of(diary)),
                        (existingDiaries, newDiary) -> {
                            existingDiaries.addAll(newDiary);
                            return existingDiaries;
                        }));

        return diariesByUser;
    }

    public List<Diary> getAllDiaries() {
        return diaryRepository.findAll();
    }

    public Diary createDiary(Diary diary, List<MultipartFile> photoFiles) throws IOException {
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
        }

        if (photoFiles != null && !photoFiles.isEmpty()) {
            List<String> fileNames = new ArrayList<>();
            for (MultipartFile photoFile : photoFiles) {
                if (!photoFile.isEmpty()) {
                    String fileName = savePhoto(photoFile);
                    fileNames.add(fileName);
                }
            }
            diary.setDiaryPhoto(new ObjectMapper().writeValueAsString(fileNames));
        }

        return diaryRepository.save(diary);
    }

    public Diary createDiary(Diary diary) {
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
        }
        return diaryRepository.save(diary);
    }

    private String savePhoto(MultipartFile photoFile) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + photoFile.getOriginalFilename();
        File targetFile = new File(uploadDir + fileName);

        if (!targetFile.exists()) {
            targetFile.mkdirs();
        }

        photoFile.transferTo(targetFile);
        return fileName;
    }

    // 여러 이미지 URL 처리
    public List<String> createImageUrls(String diaryPhotoJson) throws IOException {
        List<String> urls = new ArrayList<>();
        if (diaryPhotoJson != null && !diaryPhotoJson.isEmpty()) {
            ObjectMapper objectMapper = new ObjectMapper();
            List<String> photoFiles = objectMapper.readValue(diaryPhotoJson, new TypeReference<List<String>>() {});

            for (String photoFile : photoFiles) {
                String fullUrl = serverAddress.trim() + "/uploads/images/db/" + photoFile.trim();
                System.out.println("Generated Image URL: " + fullUrl);
                urls.add(fullUrl);
            }
        }
        return urls;
    }

    public void downloadAndSavePhoto(String imageUrl, String fileName) throws IOException {
        URL url = new URL(imageUrl);
        BufferedImage img = ImageIO.read(url);
        File outputFile = new File(uploadDir + fileName);
        ImageIO.write(img, "jpg", outputFile);
    }

    public Diary createDiaryFromUrl(Diary diary, String imageUrl) throws IOException {
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
        }

        if (imageUrl != null && !imageUrl.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + ".jpg";
            downloadAndSavePhoto(imageUrl, fileName);
            diary.setDiaryPhoto(fileName);
        }

        return diaryRepository.save(diary);
    }

    public Diary getDiaryById(int id) {
        return diaryRepository.findById(id).orElse(null);
    }

    public void deleteDiary(int id) {
        diaryRepository.deleteById(id);
    }

    public List<Diary> getDiariesByUserEmail(String userEmail) {
        Optional<User> user = userRepository.findByUserEmail(userEmail);
        if (user.isPresent()) {
            return diaryRepository.findDiariesByUserEmail(userEmail);
        } else {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
    }

    public String createImageUrl(String diaryPhoto) {
        if (diaryPhoto == null || diaryPhoto.isEmpty()) {
            return null;
        }
        return serverAddress.trim() + "/uploads/images/db/" + diaryPhoto.trim();
    }
}
