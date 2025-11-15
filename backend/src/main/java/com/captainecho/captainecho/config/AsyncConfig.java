package com.captainecho.captainecho.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 비동기 작업 설정
 * AI Service 호출을 비동기로 처리하기 위한 설정
 */
@Slf4j
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    /**
     * 비동기 작업용 ThreadPool 설정
     * - Core Pool Size: 2개
     * - Max Pool Size: 5개
     * - Queue Capacity: 100개
     */
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);          // 기본 스레드 수
        executor.setMaxPoolSize(5);           // 최대 스레드 수
        executor.setQueueCapacity(100);       // 큐 용량
        executor.setThreadNamePrefix("Async-AI-");  // 스레드 이름 접두사
        executor.setWaitForTasksToCompleteOnShutdown(true);  // 종료 시 작업 완료 대기
        executor.setAwaitTerminationSeconds(60);  // 최대 60초 대기
        executor.initialize();
        return executor;
    }

    /**
     * 비동기 작업 중 발생한 예외 처리
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (throwable, method, params) -> {
            log.error("[Async Exception] Method: {}, Message: {}",
                      method.getName(), throwable.getMessage(), throwable);
        };
    }
}
