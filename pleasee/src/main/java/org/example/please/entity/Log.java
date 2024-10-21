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
@Table(name ="log_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Log {
    @Id
    @EqualsAndHashCode.Include
    private int log_id;

    // 사용자 ID
    private String user_email;

    // 활동 유형
    private String log_type;

    // 활동 세부 정보
    private String log_details;

    // 로그 발생 시간
    private Timestamp created_at;

    // 활동 상태
    private String log_status;

    // 참조 테이블
    private String log_table;

}
