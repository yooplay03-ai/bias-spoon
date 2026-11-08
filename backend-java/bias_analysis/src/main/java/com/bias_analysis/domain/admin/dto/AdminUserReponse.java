package com.bias_analysis.domain.admin.dto;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import com.bias_analysis.domain.auth.AuthorityEntity;
import com.bias_analysis.domain.user.UserEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserReponse {
	private Long userId;
	private String loginId;
	private String userNickName;
	private String email;
	private String status;
	private String role;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
	public static AdminUserReponse convertToAdminDTO(UserEntity user) {
		String roles = user.getAuthorities().stream()
				.map(AuthorityEntity::getAuthorityName)
				.collect(Collectors.joining(", "));
		
		return AdminUserReponse.builder()
				.userId(user.getId())
				.loginId(user.getLoginId())
				.userNickName(user.getUserNickName())
				.email(user.getEmail())
				.status(user.getStatus())
				.role(roles)
				.createdAt(user.getCreatedAt())
				.updatedAt(user.getUpdatedAt())
				.build();
	}
}
