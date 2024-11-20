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

    @Autowired
    private DiaryRepository diaryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DiaryPhotoService diaryPhotoService; // 사진 저장 로직 처리

    @Autowired
    private DiaryPhotoUrlService diaryPhotoUrlService; // 사진 URL 변환 로직 처리



    public List<Diary> getAllDiaries() {
        return diaryRepository.findAll();
    }

    /**
     * 사진을 포함한 일기 작성
     */
    public Diary createDiary(Diary diary, List<MultipartFile> photoFiles) throws IOException {
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
        }

        if (photoFiles != null && !photoFiles.isEmpty()) {
            String photoJson = diaryPhotoService.savePhotos(photoFiles); // JSON 배열로 변환
            diary.setDiaryPhoto(photoJson);
        }

        return diaryRepository.save(diary);
    }

    /**
     * URL로부터 사진 다운로드 및 일기 작성
     */
    public Diary createDiaryFromUrl(Diary diary, String imageUrl) throws IOException {
        if (diary.getCreatedAt() == null) {
            diary.setCreatedAt(new Timestamp(System.currentTimeMillis()).toLocalDateTime());
        }

        if (imageUrl != null && !imageUrl.isEmpty()) {
            String photoJson = diaryPhotoService.downloadAndSavePhoto(imageUrl); // URL로부터 파일 다운로드
            diary.setDiaryPhoto(photoJson); // JSON 배열로 저장
        }

        return diaryRepository.save(diary);
    }

    /**
     * 사용자 이메일을 기준으로 일기 데이터 조회
     */
    public List<Diary> getDiariesByUserEmail(String userEmail) {
        Optional<User> user = userRepository.findByUserEmail(userEmail);
        if (user.isPresent()) {
            return diaryRepository.findDiariesByUserEmail(userEmail);
        } else {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
    }

    /**
     * 월별 사용자 일기 조회
     */
    public List<Diary> getDiariesByMonth(String userEmail, int year, int month) {
        return diaryRepository.findByUserEmailAndYearAndMonth(userEmail, year, month);
    }

    /**
     * 다중 이미지 URL 생성
     */
    public List<String> createImageUrls(String diaryPhotoJson) throws IOException {
        return diaryPhotoUrlService.createImageUrls(diaryPhotoJson);
    }

    /**
     * 특정 ID로 일기 조회
     */
    public Diary getDiaryById(int id) {
        return diaryRepository.findById(id).orElse(null);
    }

    /**
     * 일기 삭제
     */
    public void deleteDiary(int id) {
        diaryRepository.deleteById(id);
    }
}

//