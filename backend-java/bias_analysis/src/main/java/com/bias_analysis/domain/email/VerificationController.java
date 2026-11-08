package com.bias_analysis.domain.email;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class VerificationController {
	
	private final MailService mailService;
	
	@PostMapping("/send-code")
	public ResponseEntity<String> sendCode(@RequestBody @Valid VerificationDTO.SendCodeRequest request) {
		mailService.sendEmailVerification(request.getEmail());
		return ResponseEntity.ok("인증 코드가 발송되었습니다.");
	}
	
	@PostMapping("/password/reset")
	public ResponseEntity<String> resetPassword(@RequestBody @Valid VerificationDTO.ResetPasswordRequest request) {
		mailService.resetPassword(request.getEmail(), request.getCode(), request.getNewPassword());
		return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
	}
	
	@PostMapping("/find-loginId/verify")
	public ResponseEntity<String> findLoginId(@RequestBody @Valid VerificationDTO.VerifyIdRequest request) {
		String maskedId = mailService.findUserLoginId(request.getEmail(), request.getCode());
		return ResponseEntity.ok(maskedId);
	}
}
