package com.bias_analysis.domain.email;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class EmailVerification {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String email;
	private String code;
	private LocalDateTime expiredAt;
	
	public EmailVerification(String email, String code, int durationMinutes) {
		this.email = email;
		this.code = code;
		this.expiredAt = LocalDateTime.now().plusMinutes(durationMinutes);
	}
	
	public boolean isExpired() {
		return LocalDateTime.now().isAfter(this.expiredAt);
	}
}
