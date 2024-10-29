package org.example.please.controller;

import org.example.please.entity.User;
import org.example.please.service.UserService;
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
@CrossOrigin(origins = "*") // 모든 도메인에서 요청을 허용, 필요시 특정 도메인으로 제한 가능
public class UserController {

    @Autowired
    private UserService userService;

    // 이메일 중복 체크
    @PostMapping("/checkEmail")
    public ResponseEntity<Map<String, Object>> checkEmail(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        boolean isDuplicate = userService.checkEmail(user);
        if (isDuplicate) {
            response.put("message", "중복된 이메일입니다.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        response.put("message", "사용 가능한 이메일입니다.");
        return ResponseEntity.ok(response);
    }

    // 회원가입
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
        boolean isAuthenticated = userService.login(user);
        if (isAuthenticated) {
            response.put("message", "로그인 성공");
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

    // 프로필 이미지 업로드
    @PostMapping("/uploadProfile")
    public ResponseEntity<Map<String, Object>> uploadProfile(@RequestParam("email") String email, @RequestParam("photo") MultipartFile photoFile) {
        Map<String, Object> response = new HashMap<>();
        try {
            userService.uploadProfileImage(email, photoFile);
            response.put("message", "프로필 이미지가 성공적으로 업로드되었습니다.");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            response.put("message", "이미지 업로드 실패");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getUserInfo(@RequestParam String email) {
        System.out.println("Fetching user info for email: " + email);
        Optional<User> user = userService.findByEmail(email);
        if (user.isPresent()) {
            System.out.println("User found: " + user.get().getUserNick());
            Map<String, Object> response = new HashMap<>();
            response.put("user_nick", user.get().getUserNick());
            response.put("user_email", user.get().getUserEmail());
            return ResponseEntity.ok(response);
        } else {
            System.out.println("User not found for email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
