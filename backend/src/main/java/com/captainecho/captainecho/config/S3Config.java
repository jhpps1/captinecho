package com.captainecho.captainecho.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * AWS S3 클라이언트 설정
 * FILE_STORAGE_TYPE 환경변수가 "s3"일 때만 활성화
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
@ConditionalOnProperty(name = "file.storage.type", havingValue = "s3")
public class S3Config {

    private final S3Properties s3Properties;

    /**
     * S3 클라이언트 Bean 생성
     */
    @Bean
    public S3Client s3Client() {
        log.info("S3Client Bean 생성 - Region: {}, Bucket: {}",
                s3Properties.getRegion().getStatic(),
                s3Properties.getS3().getBucket());

        return S3Client.builder()
                .region(Region.of(s3Properties.getRegion().getStatic()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(
                                s3Properties.getCredentials().getAccessKey(),
                                s3Properties.getCredentials().getSecretKey()
                        )
                ))
                .build();
    }
}
