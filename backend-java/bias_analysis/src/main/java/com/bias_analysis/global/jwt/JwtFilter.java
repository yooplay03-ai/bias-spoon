package com.bias_analysis.global.jwt;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.bias_analysis.global.auth.CustomUserDetails;
import com.bias_analysis.global.auth.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
	private static final Logger logger = LoggerFactory.getLogger(JwtFilter.class);
	public static final String AUTHORIZATION_HEADER = "Authorization";
	private final JwtTokenProvider jwtTokenProvider;
	private final CustomUserDetailsService customUserDetailsService;

	@Override
	protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse,
			FilterChain filterChain) throws ServletException, IOException {
		String jwt = resolveToken(httpServletRequest);
		String requestURI = httpServletRequest.getRequestURI();

		if (isWhiteList(requestURI)) {
			filterChain.doFilter(httpServletRequest, httpServletResponse);
			return;
		}
		try {
			if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
				String loginId = jwtTokenProvider.getLoginId(jwt);
				
				CustomUserDetails userDetails = customUserDetailsService.loadUserByUsername(loginId); 
				
				if (jwtTokenProvider.isTokenExpiredByPasswordUpdatedAt(jwt, userDetails.getPasswordUpdatedAt())) {
					httpServletResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Password has been changed, Please login again");
					return;
				}
				
				Authentication authentication = jwtTokenProvider.getAuthentication(jwt, userDetails);
				
				SecurityContextHolder.getContext().setAuthentication(authentication);
				logger.debug("Security Context에 '{}' 인증정보를 저장했습니다, uri: {}", authentication.getName(), requestURI);
			} else {
				logger.debug("유효한 JWT 토큰이 없습니다, uri: {}", requestURI);
			}
		} catch (Exception e) {
			logger.info("JWT Filter Exception [{}]: {}", requestURI, e.getMessage());
		}

		filterChain.doFilter(httpServletRequest, httpServletResponse);

	}

	private String resolveToken(HttpServletRequest httpServletRequest) {
		String bearerToken = httpServletRequest.getHeader(AUTHORIZATION_HEADER);

		if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7);
		}

		return null;
	}

	private boolean isWhiteList(String requestURI) {
		return requestURI.contains("swagger") || requestURI.contains("api-docs");
	}
}
