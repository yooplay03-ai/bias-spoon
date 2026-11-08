package com.bias_analysis.global.auth;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.user.UserEntity;
import com.bias_analysis.domain.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
	
	private final UserRepository userRepository;
	
	@Override
	@Transactional(readOnly = true)
	public CustomUserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		
		UserEntity userEntity = userRepository.findOneWithAuthoritiesByLoginId(username) // username = loginId
				.orElseThrow(() -> new UsernameNotFoundException("유저정보가 없습니다. LOGIN_ID : "+username));
		
		List<GrantedAuthority> grantedAuthorities = userEntity.getAuthorities().stream()
				.map(authority -> new SimpleGrantedAuthority(authority.getAuthorityName()))
				.collect(Collectors.toList());
		
		if ("DELETED".equalsIgnoreCase(userEntity.getStatus())) {
			throw new DisabledException("탈퇴한 계정입니다.");
		}
		
		if ("BLOCKED".equalsIgnoreCase(userEntity.getStatus())) {
			throw new LockedException("관리자에 의해 차단된 계정입니다.");
		}
		
		return new CustomUserDetails(
				userEntity.getId(),
				userEntity.getLoginId(), 
				userEntity.getPassword(), 
				userEntity.getUserNickName(),
				grantedAuthorities,
				userEntity.getStatus(),
				userEntity.getPasswordUpdatedAt());
	}

}
