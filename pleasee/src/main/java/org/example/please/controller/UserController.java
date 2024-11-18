package org.example.please.controller;

import jakarta.validation.Valid;
import org.example.please.config.SecurityConfig;
import org.example.please.entity.Chatbot;
import org.example.please.entity.User;
import org.example.please.service.ChattingService;
import org.example.please.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.IOException;
import java.sql.Time;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private static final String SERVER_URL = "http://192.168.0.15:8082/uploads/profile/images/";

    @Autowired
    private UserService userService;

    @Autowired
    private ChattingService chattingService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/checkEmail")
    public ResponseEntity<Map<String, Object>> checkEmail(@RequestBody User user) {
        boolean isDuplicate = userService.checkEmail(user);
        Map<String, Object> response = new HashMap<>();
        response.put("message", isDuplicate ? "중복된 이메일입니다." : "사용 가능한 이메일입니다.");
        return isDuplicate
                ? ResponseEntity.status(HttpStatus.CONFLICT).body(response)
                : ResponseEntity.ok(response);
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> join(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        try {
            userService.saveUser(user);
            response.put("message", "회원가입 성공");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("message", "회원가입 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 비밀번호 확인 메서드 추가
    @PostMapping("/verifyPassword")
    public ResponseEntity<Map<String, Object>> verifyPassword(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<User> userFromDb = userService.findByEmail(user.getUserEmail());

            if (userFromDb.isPresent()) {
                String storedPassword = userFromDb.get().getUserPw();
                String enteredPassword = user.getUserPw();

                // 비밀번호 null 검증
                if (enteredPassword == null || enteredPassword.isEmpty()) {
                    response.put("message", "비밀번호를 입력해 주세요.");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }

                boolean isPasswordMatch = passwordEncoder.matches(enteredPassword, storedPassword);
                response.put("isValid", isPasswordMatch);
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            logger.error("비밀번호 확인 중 오류 발생: ", e);
            response.put("message", "비밀번호 확인 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }






    @PutMapping("/updatePassword")
    public ResponseEntity<Map<String, Object>> updatePassword(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        try {
            userService.updatePassword(user);
            response.put("message", "비밀번호가 성공적으로 변경되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "비밀번호 변경 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }


    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        User authenticatedUser = userService.login(user);

        if (authenticatedUser != null) {
            userService.updateChatbotLevelAfterDiaryCreation(authenticatedUser.getUserEmail());
            Chatbot croomIdx = chattingService.findByUserEmail(authenticatedUser.getUserEmail());
            String profileImageUrl = authenticatedUser.getUserProfile() != null
                    ? SERVER_URL + authenticatedUser.getUserProfile()
                    : null;
            response.put("message", "로그인 성공");
            response.put("user", authenticatedUser);
            response.put("croomIdx", croomIdx != null ? croomIdx.getCroomIdx() : null);
            response.put("profile_image", profileImageUrl);
            return ResponseEntity.ok(response);
        }

        response.put("message", "로그인 실패");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getUserInfo(@RequestParam String email) {
        Optional<User> user = userService.findByEmail(email);
        return user.map(value -> {
            Map<String, Object> response = new HashMap<>();
            response.put("user_nick", value.getUserNick());
            response.put("user_email", value.getUserEmail());
            response.put("profile_image", value.getUserProfile() != null ? SERVER_URL + value.getUserProfile() : null);
            return ResponseEntity.ok(response);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/getQuietTime")
    public ResponseEntity<Map<String, Object>> getQuietTime(@RequestParam String email) {
        Optional<User> user = userService.findByEmail(email);
        return user.map(value -> {
            Map<String, Object> response = new HashMap<>();
            response.put("quiet_start_time", value.getQuietStartTime());
            response.put("quiet_end_time", value.getQuietEndTime());
            return ResponseEntity.ok(response);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found")));
    }

    @PostMapping("/uploadProfile")
    public ResponseEntity<Map<String, Object>> uploadProfile(
            @RequestParam("email") String email,
            @RequestParam("photo") MultipartFile photoFile) {

        Map<String, Object> response = new HashMap<>();
        if (email == null || email.isEmpty()) {
            response.put("message", "이메일이 제공되지 않았습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (photoFile == null || photoFile.isEmpty()) {
            response.put("message", "이미지 파일이 제공되지 않았습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            String filePath = userService.uploadProfileImage(email, photoFile);

            if (filePath != null) {
                response.put("message", "프로필 이미지가 성공적으로 업로드되었습니다.");
                response.put("filePath", filePath);
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "유저를 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (IOException e) {
            response.put("message", "이미지 업로드 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/resetProfileImage")
    public ResponseEntity<Map<String, Object>> resetProfileImage(@RequestBody Map<String, String> request) {
        String email = request.get("userEmail");
        userService.resetProfileImage(email);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "프로필 이미지가 기본 이미지로 재설정되었습니다.");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/updateNotificationSettings")
    public ResponseEntity<String> updateNotificationSettings(
            @RequestParam String userEmail,
            @RequestParam boolean toggle,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        try {
            if (toggle) {
                // 알람 활성화 시 시간 포맷 확인 후 변환
                String formattedStartTime = (startTime != null && startTime.length() == 4) ?
                        startTime.substring(0, 2) + ":" + startTime.substring(2) + ":00" : startTime + ":00";
                String formattedEndTime = (endTime != null && endTime.length() == 4) ?
                        endTime.substring(0, 2) + ":" + endTime.substring(2) + ":00" : endTime + ":00";

                userService.updateQuietTimes(userEmail, formattedStartTime, formattedEndTime);
            } else {
                // 알람 끄기 시 시간 값을 null로 설정
                userService.updateQuietTimes(userEmail, null, null);
            }
            // 알람 토글 상태 업데이트 (활성화/비활성화)
            userService.updateToggle(userEmail, toggle);

            return ResponseEntity.ok("알림 설정이 업데이트되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("알림 설정 업데이트 중 오류 발생");
        }
    }


}