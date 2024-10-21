package org.example.please.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@ToString
@Table(name ="diary_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Diary {
    @Id
    @EqualsAndHashCode.Include
    // 일기 ID
    private int diary_idx;

    // 사용자 ID
    private String user_email;

    // 감정 태그
    private String emotion_tag;

    // 일기 내용
    private String diary_content;

    // 작성 일자
    private Timestamp created_at;
}
