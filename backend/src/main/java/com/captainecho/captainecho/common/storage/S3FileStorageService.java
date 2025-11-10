package com.captainecho.captainecho.common.storage;

import com.captainecho.captainecho.common.util.FileHashUtil;
import com.captainecho.captainecho.config.FileStorageProperties;
import com.captainecho.captainecho.config.S3Properties;
import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.Arrays;

/**
 * AWS S3에 파일을 저장하는 구현체
 * FILE_STORAGE_TYPE=s3일 때 활성화됨
 */
@Slf4j
@Service
@Primary
@RequiredArgsConstructor
@ConditionalOnProperty(name = "file.storage.type", havingValue = "s3")
public class S3FileStorageService implements FileStorageService {

    private final S3Client s3Client;
    private final S3Properties s3Properties;
    private final FileStorageProperties fileStorageProperties;

    @Override
    public String store(MultipartFile file, String prefix) {
        // 파일 검증
        validateFile(
                file,
                fileStorageProperties.getUpload().getProfileImages().getAllowedExtensions(),
                fileStorageProperties.getUpload().getProfileImages().getMaxSize()
        );

        // 파일 해시 계산
        String fileHash = FileHashUtil.calculateHash(file);
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);

        // S3 객체 키 생성: profiles/{hash}.{extension}
        String s3Key = String.format("%s/%s.%s", prefix, fileHash, fileExtension);

        try {
            // S3에 파일 업로드 (Public Read 권한 설정)
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(s3Properties.getS3().getBucket())
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .acl(ObjectCannedACL.PUBLIC_READ)  // Public 읽기 권한 설정
                    .build();

            s3Client.putObject(
                    putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );

            log.info("S3 파일 업로드 완료 (Public) - Bucket: {}, Key: {}",
                    s3Properties.getS3().getBucket(), s3Key);

            // S3 키 반환 (DB에 저장될 값)
            return s3Key;

        } catch (S3Exception e) {
            log.error("S3 업로드 실패 - Key: {}, ErrorCode: {}", s3Key, e.awsErrorDetails().errorCode(), e);
            throw new EchoException(StudentErrorCode.FILE_UPLOAD_FAILED);
        } catch (IOException e) {
            log.error("파일 읽기 실패 - Key: {}", s3Key, e);
            throw new EchoException(StudentErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    @Override
    public boolean delete(String s3Key) {
        if (s3Key == null || s3Key.isEmpty()) {
            return false;
        }

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(s3Properties.getS3().getBucket())
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);

            log.info("S3 파일 삭제 완료 - Bucket: {}, Key: {}",
                    s3Properties.getS3().getBucket(), s3Key);
            return true;

        } catch (S3Exception e) {
            log.error("S3 파일 삭제 실패 - Key: {}, ErrorCode: {}",
                    s3Key, e.awsErrorDetails().errorCode(), e);
            return false;
        }
    }

    @Override
    public String getFileUrl(String s3Key) {
        if (s3Key == null || s3Key.isEmpty()) {
            return null;
        }

        // Public 버킷의 직접 URL 생성
        // 형식: https://{bucket}.s3.{region}.amazonaws.com/{key}
        String publicUrl = String.format("https://%s.s3.%s.amazonaws.com/%s",
                s3Properties.getS3().getBucket(),
                s3Properties.getRegion().getStatic(),
                s3Key);

        log.debug("Public URL 생성 완료 - Key: {}, URL: {}", s3Key, publicUrl);
        return publicUrl;
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
