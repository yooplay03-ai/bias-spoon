package com.bias_analysis.global.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class RefreshToken {
	
	@Id
	private String loginId;
	
//	@OneToOne
//	@MapsId
//	@JoinColumn(name = "user_id")
//	private UserEntity userEntity;
	
	@Column(nullable = false)
	private String token;
	
	public RefreshToken(String loginId, String token) {
		this.loginId = loginId;
		this.token = token;
	}
	
	public void updateToken(String newToken) {
		this.token = newToken;
	}
}
