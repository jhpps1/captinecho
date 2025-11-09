package com.captainecho.captainecho.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "file")
@Getter
@Setter
public class FileStorageProperties {

    private Storage storage = new Storage();
    private Upload upload = new Upload();

    @Getter
    @Setter
    public static class Storage {
        private String type = "local";
        private String location = "uploads";
    }

    @Getter
    @Setter
    public static class Upload {
        private ProfileImages profileImages = new ProfileImages();
    }

    @Getter
    @Setter
    public static class ProfileImages {
        private String path = "profiles";
        private long maxSize = 5242880L; // 5MB
        private String allowedExtensions = "jpg,jpeg,png,webp";
    }
}
