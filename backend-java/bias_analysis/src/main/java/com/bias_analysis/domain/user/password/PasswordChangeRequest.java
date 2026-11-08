package com.bias_analysis.domain.user.password;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class PasswordChangeRequest {
	
	@NotBlank(message = "현재 비밀번호를 입력해주세요")
	private String currentPassword;
	
	@Column(name = "user_pwd",nullable = false)
	@NotBlank(message = "새 비밀번호를 입력해주세요")
	private String newPassword;
	
	@NotBlank(message = "새 비밀번호 확인을 입력해주세요")
	private String newPasswordConfirm;
}
