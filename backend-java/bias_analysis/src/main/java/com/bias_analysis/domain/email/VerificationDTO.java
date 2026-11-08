package com.bias_analysis.domain.email;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

public class VerificationDTO {
	@Getter
    public static class SendCodeRequest {
        @Email
        private String email;
        private String userId;
    }

    @Getter
    public static class VerifyIdRequest {
        @Email
        private String email;
        @NotBlank
        private String code;
    }

    @Getter
    public static class ResetPasswordRequest {
        @Email
        private String email;
        @NotBlank
        private String code;
        @NotBlank
        private String newPassword;
    }
}
