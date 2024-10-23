package org.example.please.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString
@Table(name = "diary_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Diary {
    @Id
    @Column(name = "diary_idx")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    // 일기 ID
    private int diaryIdx;

    // 사용자 ID
    @Column(name = "user_email")
    private String userEmail;

    // 감정 태그
    @Column(name = "emotion_tag")
    private String emotionTag;

    // 일기 내용
    @Column(name = "diary_content")
    private String diaryContent;

    // 작성 일자
    @Column(name = "created_at")
    private Timestamp createdAt;
}
