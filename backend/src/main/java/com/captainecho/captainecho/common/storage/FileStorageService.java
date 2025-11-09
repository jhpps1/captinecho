package com.captainecho.captainecho.common.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * 파일 저장 서비스 인터페이스
 * 로컬 파일 시스템 또는 AWS S3와 같은 클라우드 스토리지에 파일을 저장하는 기능을 추상화합니다.
 */
public interface FileStorageService {

    /**
     * 파일을 저장하고 저장된 파일의 URL 또는 경로를 반환합니다.
     *
     * @param file 저장할 파일
     * @param prefix 파일 저장 경로의 접두사 (예: "profiles", "avatars")
     * @return 저장된 파일의 URL 또는 경로
     */
    String store(MultipartFile file, String prefix);

    /**
     * 파일을 삭제합니다.
     *
     * @param filePath 삭제할 파일의 경로
     * @return 삭제 성공 여부
     */
    boolean delete(String filePath);

    /**
     * 파일의 전체 URL을 반환합니다.
     *
     * @param fileName 파일명
     * @return 파일의 전체 URL
     */
    String getFileUrl(String fileName);

    /**
     * 파일이 유효한 이미지 파일인지 검증합니다.
     *
     * @param file 검증할 파일
     * @param allowedExtensions 허용된 확장자 목록 (쉼표로 구분)
     * @param maxSize 최대 파일 크기 (bytes)
     * @throws com.captainecho.captainecho.exception.EchoException 파일이 유효하지 않은 경우
     */
    void validateFile(MultipartFile file, String allowedExtensions, long maxSize);
}
