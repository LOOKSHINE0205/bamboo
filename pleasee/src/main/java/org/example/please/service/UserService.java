package org.example.please.service;

import org.example.please.entity.User;
import org.example.please.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Time;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    // 프로필 이미지 파일 저장 경로
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
        return userRepository.findByUserEmail(user.getUserEmail())
                .filter(foundUser -> passwordEncoder.matches(user.getUserPw(), foundUser.getUserPw()))
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
        userRepository.findByUserEmail(email).ifPresentOrElse(user -> {
            user.setQuietStartTime(Time.valueOf(quietStartTime));
            user.setQuietEndTime(Time.valueOf(quietEndTime));
            userRepository.save(user);
            logger.info("Updated quiet time for user: {}", email);
        }, () -> {
            logger.warn("User not found for email: {}", email);
            throw new RuntimeException("User not found");
        });
    }

    // 프로필 이미지 업로드 및 기존 이미지 삭제
    public String uploadProfileImage(String email, MultipartFile photoFile) throws IOException {
        Optional<User> optionalUser = userRepository.findByUserEmail(email);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // 새 이미지 파일명 생성 및 중복 체크
            String newFileName = UUID.randomUUID() + "_" + photoFile.getOriginalFilename();
            if (newFileName.equals(user.getProfileImage())) {
                logger.info("중복된 이미지 업로드 요청이므로 기존 이미지 사용: {}", newFileName);
                return newFileName;
            }

            // 기존 이미지 삭제 및 새 이미지 저장
            deleteOldProfileImage(user.getProfileImage());
            saveProfileImage(photoFile, newFileName);

            // DB에 이미지 정보 업데이트
            user.setProfileImage(newFileName);
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
        if (fileName != null) {
            try {
                Path oldImagePath = Paths.get(profileImageDir, fileName);
                if (Files.deleteIfExists(oldImagePath)) {
                    logger.info("Deleted old profile image: {}", fileName);
                } else {
                    logger.warn("Old profile image not found for deletion: {}", fileName);
                }
            } catch (IOException e) {
                logger.error("Failed to delete old profile image: {}", fileName, e);
            }
        }
    }

    // 프로필 이미지 초기화
    public void resetProfileImage(String email) {
        userRepository.findByUserEmail(email).ifPresentOrElse(user -> {
            if (user.getProfileImage() != null) {
                deleteOldProfileImage(user.getProfileImage());
            }
            user.setProfileImage(null); // DB의 이미지 정보 초기화
            userRepository.save(user);
            logger.info("Reset profile image for user: {}", user.getUserEmail());
        }, () -> logger.warn("User not found with email: {}", email));
    }

    // 프로필 이미지 저장 (파일로 저장)
    private void saveProfileImage(MultipartFile photoFile, String fileName) throws IOException {
        Path targetPath = Paths.get(profileImageDir, fileName).normalize();

        // 파일 저장 디렉토리 생성
        Files.createDirectories(targetPath.getParent());
        photoFile.transferTo(targetPath.toFile());

        logger.info("Saved new profile image: {}", fileName);
    }
}
