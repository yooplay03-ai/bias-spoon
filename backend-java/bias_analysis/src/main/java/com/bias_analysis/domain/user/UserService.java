package com.bias_analysis.domain.user;

import java.time.LocalDateTime;
import java.util.Collections;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.auth.AuthorityEntity;
import com.bias_analysis.domain.auth.AuthorityRepository;
import com.bias_analysis.domain.profile.ProfileEditRequestDTO;
import com.bias_analysis.domain.user.password.PasswordChangeRequest;
import com.bias_analysis.domain.user.password.PasswordConfirm;
import com.bias_analysis.global.auth.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

	private final AuthorityRepository authorityRepository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final RefreshTokenRepository refreshTokenRepository;

	public UserEntity signup(UserDTO userDto) {

		if (userRepository.findOneWithAuthoritiesByLoginId(userDto.getLoginId()).orElse(null) != null) {
			throw new RuntimeException("이미 가입되어 있는 유저입니다.");
		}
		
		if (checkNickNameDuplicate(userDto.getUserNickName())) {
			throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
		}
		
		AuthorityEntity authority = authorityRepository.findById("USER")
				.orElseThrow(() -> new RuntimeException("USER 권한이 존재하지 않습니다."));

		UserEntity user = UserEntity.builder().email(userDto.getEmail())
				.password(passwordEncoder.encode(userDto.getPassword()))
				.loginId(userDto.getLoginId())
				.userNickName(userDto.getUserNickName())
				.authorities(Collections.singleton(authority))
				.status("ACTIVE")
				.passwordUpdatedAt(LocalDateTime.now()).build();

		return userRepository.save(user);
	}

	@Transactional
	public UserResponseDTO userUpdate(String loginId, ProfileEditRequestDTO profileEditRequestDTO) {
		log.info("dto 값:{}", profileEditRequestDTO.getNickname());
		UserEntity user = userRepository.findByLoginId(loginId)
				.orElseThrow(() -> new RuntimeException("존재하지 않거나 잘못된 사용자입니다."));
		
		if (profileEditRequestDTO.getNickname() != null) {
			validateNickname(user.getUserNickName(), profileEditRequestDTO.getNickname());
			user.changeNickname(profileEditRequestDTO.getNickname());
		}
		
		if (profileEditRequestDTO.getEmail() != null) {
			user.changeEmail(profileEditRequestDTO.getEmail());
		}
		
		userRepository.saveAndFlush(user);
		return UserResponseDTO.from(user);
	}

	@Transactional
	public void userDelete(String loginId, PasswordConfirm passwordConfirm) {
		UserEntity user = userRepository.findByLoginId(loginId)
				.orElseThrow(() -> new RuntimeException("존재하지 않거나 잘못된 사용자입니다."));

		if (!passwordEncoder.matches(passwordConfirm.getCurrentPassword(), user.getPassword())) {
			throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
		}

		user.changeStatus("DELETED");
		refreshTokenRepository.deleteById(loginId);
	}

	@Transactional
	public void passwordChange(String loginId, PasswordChangeRequest passwordChangRequest) {
		UserEntity user = userRepository.findByLoginId(loginId)
				.orElseThrow(() -> new RuntimeException("존재하지 않거나 잘못된 사용자입니다."));

		if (!passwordEncoder.matches(passwordChangRequest.getCurrentPassword(), user.getPassword())) {
			throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
		}

		if (passwordEncoder.matches(passwordChangRequest.getNewPassword(), user.getPassword())) {
			throw new IllegalArgumentException("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
		}

		user.changePassword(passwordEncoder.encode(passwordChangRequest.getNewPassword()));

		refreshTokenRepository.deleteById(loginId);
	}
	
	
	@Transactional(readOnly = true)
	public boolean checkLoginIdDuplicate(String loginId) {
		return userRepository.existsByLoginId(loginId);
	}
	
	@Transactional(readOnly = true)
	public boolean checkNickNameDuplicate(String nickName) {
		return userRepository.existsByUserNickName(nickName);
	}
	
	private void validateNickname(String currentNickname, String newNickname) {
		if (!currentNickname.equals(newNickname) && checkNickNameDuplicate(newNickname)) {
			throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
		}
	}
}
