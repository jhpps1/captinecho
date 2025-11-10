package com.captainecho.captainecho.common.storage;

import com.captainecho.captainecho.config.FileStorageProperties;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.UUID;

/**
 * 로컬 파일 시스템에 파일을 저장하는 구현체
 * 추후 S3FileStorageService로 교체 가능하도록 설계됨
 */
@Slf4j
@Service
@Primary
@RequiredArgsConstructor
@ConditionalOnProperty(name = "file.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements FileStorageService {

    private final FileStorageProperties fileStorageProperties;
    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getStorage().getLocation())
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("파일 저장 디렉토리 생성 완료: {}", this.fileStorageLocation);
        } catch (IOException e) {
            log.error("파일 저장 디렉토리 생성 실패", e);
            throw new EchoException(StudentErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public String store(MultipartFile file, String prefix) {
        // 파일 검증
        validateFile(
                file,
                fileStorageProperties.getUpload().getProfileImages().getAllowedExtensions(),
                fileStorageProperties.getUpload().getProfileImages().getMaxSize()
        );

        // 고유한 파일명 생성 (UUID + timestamp + 원본 확장자)
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uniqueFileName = String.format("%s_%s_%s.%s",
                prefix,
                UUID.randomUUID().toString(),
                timestamp,
                fileExtension
        );

        try {
            // prefix 디렉토리 생성
            Path targetLocation = this.fileStorageLocation.resolve(prefix);
            Files.createDirectories(targetLocation);

            // 파일 저장
            Path targetFile = targetLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            log.info("파일 저장 완료: {}", targetFile);

            // 저장된 파일의 상대 경로 반환 (DB에 저장될 값)
            return prefix + "/" + uniqueFileName;
        } catch (IOException e) {
            log.error("파일 저장 실패", e);
            throw new EchoException(StudentErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public boolean delete(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return false;
        }

        try {
            Path fileToDelete = this.fileStorageLocation.resolve(filePath).normalize();
            boolean deleted = Files.deleteIfExists(fileToDelete);

            if (deleted) {
                log.info("파일 삭제 완료: {}", fileToDelete);
            } else {
                log.warn("파일을 찾을 수 없음: {}", fileToDelete);
            }

            return deleted;
        } catch (IOException e) {
            log.error("파일 삭제 실패: {}", filePath, e);
            return false;
        }
    }

    @Override
    public String getFileUrl(String fileName) {
        // 로컬 환경에서는 상대 경로를 반환
        // 추후 프론트엔드에서 BASE_URL + filePath 형태로 조합하여 사용
        // 예: http://localhost:8080/uploads/profiles/xxx.jpg
        return "/uploads/" + fileName;
    }

    @Override
    public void validateFile(MultipartFile file, String allowedExtensions, long maxSize) {
        // 1. 빈 파일 체크
        if (file == null || file.isEmpty()) {
            throw new EchoException(StudentErrorCode.EMPTY_FILE);
        }

        // 2. 파일 크기 체크
        if (file.getSize() > maxSize) {
            throw new EchoException(StudentErrorCode.FILE_SIZE_EXCEEDED);
        }

        // 3. 파일 확장자 체크
        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !originalFileName.contains(".")) {
            throw new EchoException(StudentErrorCode.INVALID_FILE_TYPE);
        }

        String fileExtension = getFileExtension(originalFileName).toLowerCase();
        String[] allowedExts = allowedExtensions.toLowerCase().split(",");

        boolean isAllowed = Arrays.stream(allowedExts)
                .map(String::trim)
                .anyMatch(ext -> ext.equals(fileExtension));

        if (!isAllowed) {
            throw new EchoException(StudentErrorCode.INVALID_FILE_TYPE);
        }

        // 4. MIME 타입 체크 (추가 보안)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new EchoException(StudentErrorCode.INVALID_FILE_TYPE);
        }
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}
