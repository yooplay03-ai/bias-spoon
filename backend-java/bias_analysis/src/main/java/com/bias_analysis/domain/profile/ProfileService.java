package com.bias_analysis.domain.profile;

import org.springframework.stereotype.Service;

import com.bias_analysis.domain.user.UserEntity;
import com.bias_analysis.domain.user.UserRepository;
import com.bias_analysis.domain.user.UserResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileService {
	private final UserRepository userRepository;
	
	public UserResponseDTO getUserInfo(String loginId) {
		UserEntity user = userRepository.findByLoginId(loginId)
				.orElseThrow(() -> new RuntimeException("존재하지 않거나 잘못된 사용자입니다."));
		
		return UserResponseDTO.from(user);
	}
}
