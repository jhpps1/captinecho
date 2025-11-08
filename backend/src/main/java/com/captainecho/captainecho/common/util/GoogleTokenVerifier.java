package com.captainecho.captainecho.common.util;

import com.captainecho.captainecho.exception.EchoException;
import com.captainecho.captainecho.exception.code.AuthErrorCode;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${oauth2.google.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    public GoogleTokenInfo verify(String idToken) {
        try {
            GoogleIdToken googleIdToken = verifier.verify(idToken);
            if (googleIdToken == null) {
                throw new EchoException(AuthErrorCode.INVALID_TOKEN);
            }

            GoogleIdToken.Payload payload = googleIdToken.getPayload();

            String socialId = payload.getSubject();
            String email = payload.getEmail();

            return new GoogleTokenInfo(socialId, email);
        } catch (Exception e) {
            throw new EchoException(AuthErrorCode.INVALID_TOKEN);
        }
    }
}

