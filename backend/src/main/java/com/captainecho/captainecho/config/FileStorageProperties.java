package com.captainecho.captainecho.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "file")
public class FileStorageProperties {

    private Storage storage = new Storage();
    private Upload upload = new Upload();

    public Storage getStorage() {
        return storage;
    }

    public void setStorage(Storage storage) {
        this.storage = storage;
    }

    public Upload getUpload() {
        return upload;
    }

    public void setUpload(Upload upload) {
        this.upload = upload;
    }

    public static class Storage {
        private String type = "local";
        private String location = "uploads";

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }
    }

    public static class Upload {
        private ProfileImages profileImages = new ProfileImages();

        public ProfileImages getProfileImages() {
            return profileImages;
        }

        public void setProfileImages(ProfileImages profileImages) {
            this.profileImages = profileImages;
        }
    }

    public static class ProfileImages {
        private String path = "profiles";
        private long maxSize = 5242880L; // 5MB
        private String allowedExtensions = "jpg,jpeg,png,webp";

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public long getMaxSize() {
            return maxSize;
        }

        public void setMaxSize(long maxSize) {
            this.maxSize = maxSize;
        }

        public String getAllowedExtensions() {
            return allowedExtensions;
        }

        public void setAllowedExtensions(String allowedExtensions) {
            this.allowedExtensions = allowedExtensions;
        }
    }
}
