package com.bias_analysis.domain.user.password;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class PasswordConfirm {
	
	@NotBlank(message = "현재 비밀번호를 입력해주세요")
	private String currentPassword;
	
}
