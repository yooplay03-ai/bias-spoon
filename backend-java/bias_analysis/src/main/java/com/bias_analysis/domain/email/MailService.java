package com.bias_analysis.domain.email;

import java.util.Random;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.user.UserEntity;
import com.bias_analysis.domain.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {
	
	private final UserRepository userRepository;
	private final VerificationRepository verificationRepository;
	private final JavaMailSender mailSender;
	private final PasswordEncoder passwordEncoder;
	
	@Transactional
	public void sendEmailVerification(String email) {
		if(!userRepository.findByEmail(email).isPresent()) {
			throw new RuntimeException("해당 이메일로 등록된 사용자가 없습니다.");
		}
		
		verificationRepository.deleteByEmail(email);
		
		String code = String.format("%06d", new Random().nextInt(1000000));
		
		verificationRepository.save(new EmailVerification(email, code, 3));
		
		SimpleMailMessage mailMessage = new SimpleMailMessage();
		mailMessage.setTo(email);
		mailMessage.setSubject("아이디/비밀번호 찾기 인증번호입니다.");
		mailMessage.setText("인증번호: ["+code+"]\n3분 이내에 입력해주세요.");
		
		mailSender.send(mailMessage);
	}
	
	@Transactional
	public void resetPassword(String email, String code, String newPassword) {
		EmailVerification verification = getVerification(email, code);
		
		UserEntity user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("회원 정보가 일치하지 않습니다."));
		
		user.changePassword(passwordEncoder.encode(newPassword));
		
		verificationRepository.delete(verification);
	}
	
	@Transactional
	public String findUserLoginId(String email, String code) {
		EmailVerification verification = getVerification(email, code);
		
		UserEntity user = userRepository.findByEmail(email)
				.orElseThrow(() -> new RuntimeException("회원 정보가 일치하지 않습니다."));
		
		String loginId = user.getLoginId();
		int length = loginId.length();
		String maskedId = loginId.substring(0, length - 2) + "**";
		
		verificationRepository.delete(verification);
		
		return maskedId;
	}
	
	private EmailVerification getVerification(String email, String code) {
		EmailVerification verification = verificationRepository.findByEmailAndCode(email, code)
				.orElseThrow(() -> new RuntimeException("인증번호가 일치하지 않습니다."));
		
		if (verification.isExpired()) {
			throw new RuntimeException("인증 시간이 만료되었습니다.");
		}
		return verification;
	}
}
