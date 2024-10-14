package org.example.please.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // HTTP 보안 설정
        http
                .csrf(csrf -> csrf.disable()) // CSRF 비활성화
                .cors(cors -> cors.disable()) // CORS 비활성화, 필요에 따라 커스터마이즈 가능
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll() // 특정 경로에 대한 접근 허용
                        .anyRequest().authenticated() // 다른 모든 요청은 인증 필요
                );

        return http.build();
    }
}

