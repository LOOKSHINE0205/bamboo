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
@Table(name ="alarm_tb")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Alarm {

    // 알림 ID
    @Id
    @EqualsAndHashCode.Include
    private int alarm_id;

    // 사용자 ID
    private String user_email;

    // 알림 시간
    private Timestamp alarm_time;

    // 알림 메시지
    private String alarm_msg;
}
