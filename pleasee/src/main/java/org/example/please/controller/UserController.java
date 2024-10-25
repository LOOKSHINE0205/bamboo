package org.example.please.controller;

import org.example.please.entity.User;
import org.example.please.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // 이메일 중복 체크
    @PostMapping("/checkEmail")
    public ResponseEntity<?> checkEmail(@RequestBody User user) {
        boolean response = userService.checkEmail(user);
        if (response) {
            return ResponseEntity.badRequest().body("중복된 이메일입니다.");
        }
        return ResponseEntity.ok().body("사용 가능한 이메일입니다.");
    }

    // 회원가입
    @PostMapping("/join")
    public ResponseEntity<String> join(@RequestBody User user) {
        userService.saveUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공");
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        boolean response = userService.login(user);
        if (response) {
            return ResponseEntity.ok().body("로그인 성공");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패");
    }

    // 비밀번호만 업데이트
    @PostMapping("/updatePassword")
    public ResponseEntity<String> updatePassword(@RequestBody User user) {
        userService.updatePassword(user);
        return ResponseEntity.status(HttpStatus.OK).body("비밀번호가 성공적으로 변경되었습니다.");
    }

    // 프로필 이미지 업로드
    @PostMapping("/uploadProfile")
    public ResponseEntity<String> uploadProfile(@RequestParam("email") String email, @RequestParam("photo") MultipartFile photoFile) {
        try {
            userService.uploadProfileImage(email, photoFile);
            return ResponseEntity.ok().body("프로필 이미지가 성공적으로 업로드되었습니다.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이미지 업로드 실패");
        }
    }
}
