package org.example.please.service;

import jakarta.transaction.Transactional;
import org.example.please.entity.User;
import org.example.please.repository.ChattingRepository;
import org.example.please.repository.DiaryRepository;
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
    @Autowired
    private ChattingRepository chattingRepository;
    @Autowired
    private DiaryRepository diaryRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 이메일 중복 체크
     * @param user 이메일 중복 확인할 사용자 객체
     * @return 이메일 중복 여부
     */
    public boolean checkEmail(User user) {
        return userRepository.existsByUserEmail(user.getUserEmail());
    }

    /**
     * 새로운 사용자 저장 (회원가입)
     * @param user 저장할 사용자 객체
     */
    public void saveUser(User user) {
        user.setUserPw(passwordEncoder.encode(user.getUserPw())); // 비밀번호 암호화
        userRepository.save(user);
        logger.info("New user registered with email: {}", user.getUserEmail());
    }

    /**
     * 사용자 로그인 로직
     * @param user 로그인할 사용자 객체
     * @return 인증된 사용자 객체 또는 null (인증 실패 시)
     */
    public User login(User user) {
        return userRepository.findByUserEmail(user.getUserEmail())
                .filter(foundUser -> passwordEncoder.matches(user.getUserPw(), foundUser.getUserPw()))
                .orElse(null);
    }

    /**
     * 사용자 비밀번호 업데이트
     * @param user 비밀번호를 업데이트할 사용자 객체
     */
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

    /**
     * 이메일로 사용자 조회
     * @param email 조회할 사용자 이메일
     * @return 조회된 사용자 객체 (Optional)
     */
    public Optional<User> findByEmail(String email) {
        logger.info("Searching for user by email: {}", email);
        return userRepository.findByUserEmail(email);
    }



    /**
     * 사용자 프로필 이미지 업로드 및 기존 이미지 삭제
     * @param email 사용자 이메일
     * @param photoFile 업로드할 프로필 이미지 파일
     * @return 저장된 프로필 이미지 파일명 또는 null (사용자를 찾을 수 없는 경우)
     * @throws IOException 파일 처리 오류
     */
    public String uploadProfileImage(String email, MultipartFile photoFile) throws IOException {
        Optional<User> optionalUser = userRepository.findByUserEmail(email);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            String newFileName = UUID.randomUUID() + "_" + photoFile.getOriginalFilename();
            if (newFileName.equals(user.getUserProfile())) {
                logger.info("중복된 이미지 업로드 요청이므로 기존 이미지 사용: {}", newFileName);
                return newFileName;
            }

            deleteOldProfileImage(user.getUserProfile());
            saveProfileImage(photoFile, newFileName);
            user.setUserProfile(newFileName);
            userRepository.save(user);
            logger.info("Updated profile image for user: {}", user.getUserEmail());
            return newFileName;
        } else {
            logger.warn("User not found with email: {}", email);
            return null;
        }
    }

    /**
     * 기존 프로필 이미지 삭제
     * @param fileName 삭제할 파일명
     */
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

    /**
     * 프로필 이미지 초기화 (이미지 삭제 후 DB의 이미지 정보 초기화)
     * @param email 사용자 이메일
     */
    public void resetProfileImage(String email) {
        userRepository.findByUserEmail(email).ifPresentOrElse(user -> {
            if (user.getUserProfile() != null) {
                deleteOldProfileImage(user.getUserProfile());
            }
            user.setUserProfile(null); // DB의 이미지 정보 초기화
            userRepository.save(user);
            logger.info("Reset profile image for user: {}", user.getUserEmail());
        }, () -> logger.warn("User not found with email: {}", email));
    }

    /**
     * 프로필 이미지 저장 (파일로 저장)
     * @param photoFile 저장할 이미지 파일
     * @param fileName 저장할 파일명
     * @throws IOException 파일 처리 오류
     */
    private void saveProfileImage(MultipartFile photoFile, String fileName) throws IOException {
        Path targetPath = Paths.get(profileImageDir, fileName).normalize();
        Files.createDirectories(targetPath.getParent()); // 디렉토리 생성
        photoFile.transferTo(targetPath.toFile()); // 파일 저장
        logger.info("Saved new profile image: {}", fileName);
    }




    public void updateQuietTimes(String userEmail, String startTime, String endTime) {
        userRepository.findByUserEmail(userEmail).ifPresentOrElse(user -> {
            user.setQuietStartTime(Time.valueOf(startTime));
            user.setQuietEndTime(Time.valueOf(endTime));
            userRepository.save(user);
        }, () -> {
            throw new RuntimeException("해당 사용자를 찾을 수 없습니다.");
        });
    }

    public void updateToggle(String userEmail, boolean toggle) {
        userRepository.findByUserEmail(userEmail).ifPresentOrElse(user -> {
            user.setToggle(toggle);
            userRepository.save(user);
        }, () -> {
            throw new RuntimeException("해당 사용자를 찾을 수 없습니다.");
        });
    }
    @Transactional
    public void updateChatbotLevelAfterDiaryCreation(String userEmail) {
        // 1. 작성된 일기 수 가져오기
        int diaryCount = diaryRepository.countByUserEmail(userEmail);

        // 2. 대화 수 계산: 같은 userEmail, croomIdx 기준
        int chatRecordCount = chattingRepository.countByUserEmailAndCroomIdx(userEmail);
        int conversationCount = chatRecordCount / 2;

        // 3. 레벨 계산
        int diaryLevel = diaryCount / 3; // 일기 3개당 1레벨
        int chatLevel = conversationCount / 10; // 대화 10개당 1레벨
        int newLevel = diaryLevel + chatLevel;

        // 4. 사용자 레벨 업데이트
        userRepository.updateChatbotLevel(userEmail, newLevel);
    }

}
