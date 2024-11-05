package org.example.please.controller;

import org.example.please.entity.Feedback;
import org.example.please.entity.User;
import org.example.please.repository.FeedbackRepository;
import org.example.please.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private FeedbackService feedbackService;

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveFeedback(@RequestBody Feedback feedback) {
        Map<String, Object> response = new HashMap<>();
         feedbackService.saveFeedback(feedback);
         return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

//    @PostMapping("/join")
//    public ResponseEntity<Map<String, Object>> join(@RequestBody User user) {
//        Map<String, Object> response = new HashMap<>();
//        try {
//            userService.saveUser(user);
//            response.put("message", "회원가입 성공");
//            return ResponseEntity.status(HttpStatus.CREATED).body(response);
//        } catch (Exception e) {
//            response.put("message", "회원가입 실패: " + e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
//        }
//    }

}
