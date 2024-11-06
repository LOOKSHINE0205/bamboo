package org.example.please.controller;

import org.example.please.entity.User;
import org.example.please.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    // 이메일 중복 확인
    @PostMapping("/checkEmail")
    public ResponseEntity<Map<String, Object>> checkEmail(@RequestBody User user) {
        boolean isDuplicate = userService.checkEmail(user);
        Map<String, Object> response = new HashMap<>();
        response.put("message", isDuplicate ? "중복된 이메일입니다." : "사용 가능한 이메일입니다.");
        return isDuplicate
                ? ResponseEntity.status(HttpStatus.CONFLICT).body(response)
                : ResponseEntity.ok(response);
    }

    // 회원 가입
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

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        User authenticatedUser = userService.login(user);
        if (authenticatedUser != null) {
            response.put("message", "로그인 성공");
            response.put("user", authenticatedUser);
            return ResponseEntity.ok(response);
        }
        response.put("message", "로그인 실패");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // 비밀번호 업데이트
    @PostMapping("/updatePassword")
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

    // 사용자 정보 조회
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getUserInfo(@RequestParam String email) {
        Optional<User> user = userService.findByEmail(email);
        return user.map(value -> {
            Map<String, Object> response = new HashMap<>();
            response.put("user_nick", value.getUserNick());
            response.put("user_email", value.getUserEmail());
            return ResponseEntity.ok(response);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // 알림 시간 조회
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

    // 프로필 이미지 업로드
    @PostMapping("/uploadProfile")
    public ResponseEntity<Map<String, Object>> uploadProfile(
            @RequestParam(value = "email", required = true) String email,
            @RequestParam(value = "photo", required = true) MultipartFile photoFile) {

        Map<String, Object> response = new HashMap<>();

        // 파라미터 유효성 검사
        if (email == null || email.isEmpty()) {
            response.put("message", "이메일이 제공되지 않았습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (photoFile == null || photoFile.isEmpty()) {
            response.put("message", "이미지 파일이 제공되지 않았습니다.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            // 파일 업로드 처리
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

    // 프로필 이미지 초기화
    @PostMapping("/resetProfileImage")
    public ResponseEntity<Map<String, Object>> resetProfileImage(@RequestBody Map<String, String> request) {
        String email = request.get("userEmail");
        userService.resetProfileImage(email);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "프로필 이미지가 기본 이미지로 재설정되었습니다.");
        return ResponseEntity.ok(response);
    }
}
