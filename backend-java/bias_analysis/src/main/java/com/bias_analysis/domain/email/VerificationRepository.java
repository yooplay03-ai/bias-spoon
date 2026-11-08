package com.bias_analysis.domain.email;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationRepository extends JpaRepository<EmailVerification, Long>{
	void deleteByEmail(String email);

	Optional<EmailVerification> findByEmailAndCode(String email, String code);
}
