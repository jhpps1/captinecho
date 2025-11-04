package com.captainecho.captainecho.jwt.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {
    private final SecretKey secretKey;
    private final long accessTokenValidityMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-validity-ms}") long accessTokenValidityMs
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidityMs = accessTokenValidityMs;
    }

    public String generateAccessToken(Long protectorId) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + accessTokenValidityMs);

        return Jwts.builder()
                .subject(String.valueOf(protectorId))
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getProtectorId(String token) {
        return Long.valueOf(parseToken(token).getSubject());
    }

    public boolean validateToken(String token) {
        try {
            log.info("Validating JWT token (length: {})", token.length());
            parseToken(token);
            log.info("Token validation SUCCESS");
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Token validation FAILED: Token expired - Issued: {}, Expiration: {}",
                e.getClaims().getIssuedAt(), e.getClaims().getExpiration());
        } catch (SignatureException e) {
            log.warn("Token validation FAILED: Invalid signature - {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Token validation FAILED: Malformed token - {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("Token validation FAILED: Illegal argument - {}", e.getMessage());
        } catch (Exception e) {
            log.error("Token validation FAILED: Unexpected error", e);
        }
        return false;
    }
}
