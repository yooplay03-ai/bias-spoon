package com.bias_analysis.domain.admin.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.admin.dto.AdminUserReponse;
import com.bias_analysis.domain.auth.AuthorityEntity;
import com.bias_analysis.domain.auth.AuthorityRepository;
import com.bias_analysis.domain.user.UserEntity;
import com.bias_analysis.domain.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserService {
	
	private final UserRepository userRepository;
	private final AuthorityRepository authorityRepository;
	
	@Transactional(readOnly = true)
	public Page<AdminUserReponse> getUsers(Pageable pageable) {
		Page<UserEntity> userPage = userRepository.findAll(pageable);
		
		return userPage.map(AdminUserReponse::convertToAdminDTO);
	}
	
	@Transactional
	public void updateStatus(String loginId, String status) {
		UserEntity user = userRepository.findByLoginId(loginId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
		
		user.changeStatus(status);
	}
	
	@Transactional
	public void updateRole(String loginId, String role) {
		UserEntity user = userRepository.findByLoginId(loginId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
		
		AuthorityEntity newAuth = authorityRepository.findById(role)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 권한입니다."));
		
		user.getAuthorities().clear();
		user.getAuthorities().add(newAuth);
	}
}
