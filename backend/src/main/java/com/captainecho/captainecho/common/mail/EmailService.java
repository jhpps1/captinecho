package com.captainecho.captainecho.common.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    /**
     * PIN 복구 인증 코드 이메일 발송
     */
    public void sendPinRecoveryCode(String toEmail, String code) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("[Captain Echo] PIN 번호 찾기 인증 코드");
            helper.setText(createRecoveryEmailContent(code), true);

            mailSender.send(message);
            log.info("PIN 복구 이메일 발송 성공: {}", toEmail);
        } catch (MessagingException e) {
            log.error("PIN 복구 이메일 발송 실패: {}", toEmail, e);
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }

    /**
     * 이메일 HTML 템플릿
     */
    private String createRecoveryEmailContent(String code) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                                <!-- 헤더 -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #3B82F6 0%%, #2563EB 100%%); padding: 40px 20px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                                            Captain Echo
                                        </h1>
                                        <p style="color: #E0E7FF; margin: 10px 0 0 0; font-size: 14px;">
                                            꼬마선장 에코
                                        </p>
                                    </td>
                                </tr>

                                <!-- 본문 -->
                                <tr>
                                    <td style="padding: 40px 40px 20px 40px;">
                                        <h2 style="color: #1F2937; margin: 0 0 20px 0; font-size: 24px;">
                                            PIN 번호 찾기 인증 코드
                                        </h2>
                                        <p style="color: #6B7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                                            안녕하세요.<br>
                                            요청하신 PIN 번호 찾기 인증 코드입니다.<br>
                                            아래 코드를 입력하여 PIN 번호를 초기화하세요.
                                        </p>

                                        <!-- 인증 코드 -->
                                        <div style="background-color: #F3F4F6; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
                                            <p style="color: #6B7280; margin: 0 0 10px 0; font-size: 14px;">
                                                인증 코드
                                            </p>
                                            <p style="color: #3B82F6; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 8px;">
                                                %s
                                            </p>
                                        </div>

                                        <!-- 안내 사항 -->
                                        <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin-bottom: 30px; border-radius: 4px;">
                                            <p style="color: #92400E; margin: 0; font-size: 14px; line-height: 1.6;">
                                                ⚠️ 이 코드는 <strong>5분간 유효</strong>합니다.<br>
                                                ⚠️ 보안을 위해 타인과 공유하지 마세요.<br>
                                                ⚠️ PIN 초기화 후 기본 PIN은 <strong>000000</strong>입니다.
                                            </p>
                                        </div>

                                        <p style="color: #9CA3AF; margin: 0; font-size: 14px; line-height: 1.6;">
                                            본인이 요청하지 않은 경우, 이 이메일을 무시하세요.
                                        </p>
                                    </td>
                                </tr>

                                <!-- 푸터 -->
                                <tr>
                                    <td style="background-color: #F9FAFB; padding: 30px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
                                        <p style="color: #9CA3AF; margin: 0; font-size: 12px;">
                                            © 2025 Captain Echo. All rights reserved.
                                        </p>
                                        <p style="color: #9CA3AF; margin: 10px 0 0 0; font-size: 12px;">
                                            난독증 어린이를 위한 학습 플랫폼
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(code);
    }
}
