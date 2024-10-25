package org.example.please.service;

import org.example.please.entity.User;
import org.example.please.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;


@Service
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    // 파일 저장 경로 설정 (실제 경로로 수정하세요)
    private final String profileImageDir = "C:/uploads/profile/images/";

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // 이메일 중복 체크
    public boolean checkEmail(User user) {
        return userRepository.existsByUserEmail(user.getUserEmail());
    }

    // DB insert
    public void saveUser(User user) {
        String encodedPassword = passwordEncoder.encode(user.getUserPw());
        user.setUserPw(encodedPassword);
        userRepository.save(user);
    }

    // 로그인
    public boolean login(User user) {
        Optional<User> foundUser = userRepository.findByUserEmail(user.getUserEmail());
        return foundUser.filter(value -> passwordEncoder.matches(user.getUserPw(), value.getUserPw())).isPresent();
    }

    // 비밀번호 업데이트
    public void updatePassword(User user) {
        Optional<User> optionalUser = userRepository.findByUserEmail(user.getUserEmail());

        if (optionalUser.isPresent()) {
            User existingUser = optionalUser.get();
            if (user.getUserPw() != null && !user.getUserPw().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(user.getUserPw());
                existingUser.setUserPw(encodedPassword);
            }
            userRepository.save(existingUser);
        }
    }

    // 프로필 이미지 업로드 및 기존 이미지 삭제
    @Transactional
    public void uploadProfileImage(String email, MultipartFile photoFile) throws IOException {
        Optional<User> optionalUser = userRepository.findByUserEmail(email);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // 기존 프로필 이미지 삭제
            if (user.getProfileImage() != null) {
                deleteOldProfileImage(user.getProfileImage());
            }

            // 새 프로필 이미지 저장
            String fileName = saveProfileImage(photoFile);
            user.setProfileImage(fileName);
            userRepository.save(user);

            System.out.println("Updated profile image for user: " + user.getUserEmail());
        } else {
            System.out.println("User not found with email: " + email);
        }
    }

    // 기존 프로필 이미지 삭제
    private void deleteOldProfileImage(String fileName) throws IOException {
        Path oldImagePath = Paths.get(profileImageDir, fileName);
        Files.deleteIfExists(oldImagePath);
    }

    // 프로필 이미지 저장
    private String saveProfileImage(MultipartFile photoFile) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + photoFile.getOriginalFilename();
        File targetFile = new File(profileImageDir + fileName);

        if (!targetFile.exists()) {
            targetFile.mkdirs();
        }

        photoFile.transferTo(targetFile);
        return fileName;
    }
}
