package com.bias_analysis.global.auth;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.bias_analysis.domain.user.UserEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private Long userId;
	private String loginId;
	private String password;
	private String userNickName;
	private Collection<? extends GrantedAuthority> authorities;
	private String status;
	private LocalDateTime passwordUpdatedAt;

	public static CustomUserDetails from(UserEntity userEntity) {
		List<GrantedAuthority> authorities = userEntity.getAuthorities().stream()
				.map(auth -> new SimpleGrantedAuthority(auth.getAuthorityName()))
				.collect(Collectors.toList());
		
		return CustomUserDetails.builder().
				userId(userEntity.getId())
				.loginId(userEntity.getLoginId())
				.password(userEntity.getPassword())
				.userNickName(userEntity.getUserNickName())
				.authorities(authorities)
				.status(userEntity.getStatus())
				.passwordUpdatedAt(userEntity.getPasswordUpdatedAt())
				.build();
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return loginId;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}
