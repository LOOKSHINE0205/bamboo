package org.example.please.service;

import org.example.please.entity.User;
import org.example.please.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    // 파일 저장 경로를 환경 변수로 설정
    @Value("${user.profile.image.dir:C:/uploads/profile/images/}")
    private String profileImageDir;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 이메일 중복 체크
    public boolean checkEmail(User user) {
        return userRepository.existsByUserEmail(user.getUserEmail());
    }

    // 회원 저장 (회원가입)
    public void saveUser(User user) {
        user.setUserPw(passwordEncoder.encode(user.getUserPw()));
        userRepository.save(user);
        logger.info("New user registered with email: {}", user.getUserEmail());
    }

    // 로그인 로직
    public User login(User user) {
        Optional<User> foundUser = userRepository.findByUserEmail(user.getUserEmail());

        // Optional을 사용해 비밀번호가 일치할 경우 User 객체를 반환하고, 그렇지 않으면 null 반환
        return foundUser
                .filter(value -> passwordEncoder.matches(user.getUserPw(), value.getUserPw()))
                .orElse(null); // 인증 실패 시 null 반환
    }

    // 비밀번호 업데이트
    public void updatePassword(User user) {
        Optional<User> optionalUser = userRepository.findByUserEmail(user.getUserEmail());
        if (optionalUser.isPresent() && user.getUserPw() != null && !user.getUserPw().isEmpty()) {
            User existingUser = optionalUser.get();
            existingUser.setUserPw(passwordEncoder.encode(user.getUserPw()));
            userRepository.save(existingUser);
            logger.info("Password updated for user: {}", user.getUserEmail());
        } else {
            logger.warn("Password update failed - user not found or invalid new password for email: {}", user.getUserEmail());
        }
    }

    // 이메일로 사용자 조회
    public Optional<User> findByEmail(String email) {
        logger.info("Searching for user by email: {}", email);
        return userRepository.findByUserEmail(email);
    }

    // 알림 시간 업데이트
    public void updateQuietTime(String email, String quietStartTime, String quietEndTime) {
        Optional<User> optionalUser = userRepository.findByUserEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.setQuietStartTime(Time.valueOf(quietStartTime));
            user.setQuietEndTime(Time.valueOf(quietEndTime));
            userRepository.save(user);
            logger.info("Updated quiet time for user: {}", email);
        } else {
            logger.warn("User not found for email: {}", email);
            throw new RuntimeException("User not found");
        }
    }

    // 프로필 이미지 업로드 및 기존 이미지 삭제
    public String uploadProfileImage(String email, MultipartFile photoFile) throws IOException {
        Optional<User> optionalUser = userRepository.findByUserEmail(email);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // 새로 업로드할 이미지 파일명을 생성
            String newFileName = UUID.randomUUID().toString() + "_" + photoFile.getOriginalFilename();

            // 기존 이미지와 새 이미지 파일명이 동일하면, 중복 저장을 방지
            if (newFileName.equals(user.getProfileImage())) {
                logger.info("중복된 이미지 업로드 요청이므로 기존 이미지 사용: {}", newFileName);
                return newFileName;
            }

            // 기존 프로필 이미지 삭제
            deleteOldProfileImage(user.getProfileImage());

            // 새 프로필 이미지 저장
            user.setProfileImage(newFileName);
            saveProfileImage(photoFile, newFileName);  // 실제 파일을 저장합니다
            userRepository.save(user);

            logger.info("Updated profile image for user: {}", user.getUserEmail());
            return newFileName;
        } else {
            logger.warn("User not found with email: {}", email);
            return null;
        }
    }

    // 기존 프로필 이미지 삭제
    private void deleteOldProfileImage(String fileName) {
        try {
            if (fileName != null) {
                Path oldImagePath = Paths.get(profileImageDir, fileName);
                if (Files.deleteIfExists(oldImagePath)) {
                    logger.info("Deleted old profile image: {}", fileName);
                } else {
                    logger.warn("Old profile image not found for deletion: {}", fileName);
                }
            }
        } catch (IOException e) {
            logger.error("Failed to delete old profile image: {}", fileName, e);
        }
    }

    public void resetProfileImage(String email) {
        Optional<User> optionalUser = userRepository.findByUserEmail(email);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // 기존 프로필 이미지 파일 삭제
            if (user.getProfileImage() != null) {
                deleteOldProfileImage(user.getProfileImage());
            }

            // 프로필 이미지 필드를 기본값(null)로 설정
            user.setProfileImage(null);
            userRepository.save(user);

            logger.info("Reset profile image for user: {}", user.getUserEmail());
        } else {
            logger.warn("User not found with email: {}", email);
        }
    }

    // 프로필 이미지 저장
    private void saveProfileImage(MultipartFile photoFile, String fileName) throws IOException {
        Path targetPath = Paths.get(profileImageDir).resolve(fileName).normalize();

        // 디렉토리 생성
        Files.createDirectories(targetPath.getParent());

        photoFile.transferTo(targetPath.toFile());
        logger.info("Saved new profile image: {}", fileName);
    }
}
