package org.example.please.controller;

import org.example.please.entity.User;
import org.example.please.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/checkEmail")
    public ResponseEntity<?> checkEmail(@RequestBody User user) {
        String response = userService.checkEmail(user);
        if(response.equals("중복")){
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok().body(response);
    }

    @PostMapping("/join")
    public ResponseEntity<String> join(@RequestBody User user) {
        userService.saveUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("회원가입 성공");  // 201 Created 응답
    }

}
