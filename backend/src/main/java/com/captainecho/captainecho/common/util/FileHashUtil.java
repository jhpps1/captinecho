package com.captainecho.captainecho.common.util;

import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.StudentErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * 파일 해시 계산 유틸리티
 */
@Slf4j
public class FileHashUtil {

    private static final String HASH_ALGORITHM = "MD5";

    /**
     * MultipartFile의 MD5 해시값을 계산하여 반환
     *
     * @param file 해시를 계산할 파일
     * @return 16진수 문자열로 표현된 MD5 해시값 (32자)
     */
    public static String calculateHash(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            byte[] buffer = new byte[8192];
            int bytesRead;

            while ((bytesRead = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }

            byte[] hashBytes = digest.digest();
            return bytesToHex(hashBytes);

        } catch (NoSuchAlgorithmException e) {
            log.error("해시 알고리즘을 찾을 수 없습니다: {}", HASH_ALGORITHM, e);
            throw new EchoException(StudentErrorCode.FILE_UPLOAD_FAILED);
        } catch (IOException e) {
            log.error("파일 읽기 중 오류 발생", e);
            throw new EchoException(StudentErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    /**
     * byte 배열을 16진수 문자열로 변환
     *
     * @param bytes 변환할 byte 배열
     * @return 16진수 문자열
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
