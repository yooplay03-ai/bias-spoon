package com.bias_analysis.domain.user;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UserResponseDTO {
	
	private final String loginId;
	
	private final String email;
	private final String userNickName;
	
	private final String status;
	private final LocalDateTime createdAt;
	
	public static UserResponseDTO from(UserEntity user) {
		return UserResponseDTO.builder()
				.loginId(user.getLoginId())
				.email(user.getEmail())
				.userNickName(user.getUserNickName())
				.status(user.getStatus())
				.createdAt(user.getCreatedAt())
				.build();
	}
}
