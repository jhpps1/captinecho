package com.captainecho.captainecho.student.application.event;

import com.captainecho.captainecho.common.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileDeleteEventListener {

    private final FileStorageService fileStorageService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleFileDeleteEvent(FileDeleteEvent event) {
        String filePath = event.filePath();

        if (filePath != null && !filePath.isEmpty()) {
            boolean deleted = fileStorageService.delete(filePath);
            if (deleted) {
                log.info("Successfully deleted old file: {}", filePath);
            } else {
                log.warn("Failed to delete old file or file not found: {}", filePath);
            }
        }
    }
}
