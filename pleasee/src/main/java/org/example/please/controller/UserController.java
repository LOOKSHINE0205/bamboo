package org.example.please.controller;

import org.example.please.entity.User;
import org.example.please.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping("/join")
    public ResponseEntity<String> join(@RequestBody User user) {
        String response = userService.checkEmail(user);
        if(response.equals("중복")){
            return ResponseEntity.badRequest().body(response);
        }
        user.setChatbotType("챗봇타입");
        user.setChatbotName("챗봇이름");
        userService.saveUser(user);
        return ResponseEntity.ok("회원가입 성공");
    }

}
