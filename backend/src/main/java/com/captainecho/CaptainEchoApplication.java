package com.captainecho;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Captain Echo - 난독증 어린이를 위한 게임형 학습 플랫폼
 *
 * @project S13P31D101
 * @team Captain Echo Team
 */
@SpringBootApplication
@EnableJpaAuditing
public class CaptainEchoApplication {

    public static void main(String[] args) {
        SpringApplication.run(CaptainEchoApplication.class, args);
    }

}
