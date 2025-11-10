package com.captainecho.captainecho.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * AWS S3 관련 설정 프로퍼티
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "cloud.aws")
public class S3Properties {

    private S3Config s3 = new S3Config();
    private CredentialsConfig credentials = new CredentialsConfig();
    private RegionConfig region = new RegionConfig();

    @Getter
    @Setter
    public static class S3Config {
        private String bucket;
    }

    @Getter
    @Setter
    public static class CredentialsConfig {
        private String accessKey;
        private String secretKey;
    }

    @Getter
    @Setter
    public static class RegionConfig {
        private String staticRegion = "ap-northeast-2";

        // AWS SDK는 'static'이라는 필드명을 사용하므로 별칭 제공
        public String getStatic() {
            return staticRegion;
        }

        public void setStatic(String region) {
            this.staticRegion = region;
        }
    }
}
