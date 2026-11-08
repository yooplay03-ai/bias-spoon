package com.bias_analysis.domain.auth;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.user.UserEntity;
import com.bias_analysis.domain.user.UserRepository;
import com.bias_analysis.global.auth.CustomUserDetails;
import com.bias_analysis.global.auth.RefreshToken;
import com.bias_analysis.global.auth.RefreshTokenRepository;
import com.bias_analysis.global.dto.LoginDTO;
import com.bias_analysis.global.dto.TokenDTO;
import com.bias_analysis.global.jwt.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
	private final JwtTokenProvider jwtTokenProvider;
	private final AuthenticationManagerBuilder authenticationManagerBuilder;
	private final RefreshTokenRepository refreshTokenRepository;
	private final UserRepository userRepository;
	
	@Transactional
	public TokenDTO login(LoginDTO loginDto) {
		UserEntity user = userRepository.findByLoginId(loginDto.getLoginId())
	            .orElseThrow(() -> new RuntimeException("존재하지 않는 아이디입니다.")); // 메시지 구체화

	    if ("DELETED".equals(user.getStatus())) {
	        throw new RuntimeException("탈퇴된 계정입니다. 고객센터에 문의하세요."); // 이 메시지가 우선임
	    }
		
	    try {
	    	UsernamePasswordAuthenticationToken token =
	    			new UsernamePasswordAuthenticationToken(loginDto.getLoginId(), loginDto.getPassword());
	    	
	    	Authentication authentication = authenticationManagerBuilder.getObject().authenticate(token);
	    	SecurityContextHolder.getContext().setAuthentication(authentication);
	    	
	    	String accessToken = jwtTokenProvider.createToken(authentication);
	    	String refreshToken = jwtTokenProvider.createRefreshToken(authentication);
	    	
	    	refreshTokenRepository.save(new RefreshToken(authentication.getName(), refreshToken));
	    	
	    	return TokenDTO.builder()
	    			.accessToken(accessToken)
	    			.refreshToken(refreshToken)
	    			.build();
	    } catch (BadCredentialsException e) {
	    	throw new RuntimeException("비밀번호가 일치하지 않습니다.");
	    }
	}
	
	@Transactional
	public TokenDTO reissue(String oldRefreshToken) {
		log.info("Reissue start");
		if(!jwtTokenProvider.validateToken(oldRefreshToken)) {
			throw new RuntimeException("Refresh Token이 유효하지 않습니다.");
		}
		
		String loginId = jwtTokenProvider.getLoginId(oldRefreshToken);
		
		UserEntity user = userRepository.findByLoginId(loginId)
	            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
		
		if("DELETED".equalsIgnoreCase(user.getStatus())) {
			refreshTokenRepository.deleteById(loginId);
			throw new RuntimeException("탈퇴한 회원입니다.");
		}
		
		CustomUserDetails userDetails = CustomUserDetails.from(user);
		
		Authentication authentication = jwtTokenProvider.getAuthentication(oldRefreshToken, userDetails);
		
		RefreshToken savedRefreshToken = refreshTokenRepository.findById(loginId)
				.orElseThrow(() -> new RuntimeException("로그아웃된 사용자입니다."));
		
		if (!savedRefreshToken.getToken().equals(oldRefreshToken)) {
			throw new RuntimeException("토큰 정보가 일치하지 않습니다.");
		}
		
		String newAccessToken = jwtTokenProvider.createToken(authentication);
		String newRefreshToken = jwtTokenProvider.createRefreshToken(authentication);
		
		savedRefreshToken.updateToken(newRefreshToken);
		
		return TokenDTO.builder()
				.accessToken(newAccessToken)
				.refreshToken(newRefreshToken)
				.build();
	}
	
	@Transactional
	public void logout(String refreshToken) {
		if(!jwtTokenProvider.validateToken(refreshToken)) {
			throw new RuntimeException("토큰이 유효하지 않습니다.");
		}
		
		String loginId = jwtTokenProvider.getAuthentication(refreshToken).getName();
		
		refreshTokenRepository.deleteById(loginId);
	}
	
	public long getRefreshTokenValidityInSeconds() {
		return jwtTokenProvider.getRefreshTokenValidityInSeconds();
	}
}
