package com.bias_analysis.global.jwt;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException, ServletException {
		String exception = (String) request.getAttribute("exception");
		
		response.setContentType("application/json;charset=UTF-8");
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		
		String message = "";
		if ("EXPIRED_TOKEN".equals(exception)) {
			message = "토큰이 만료되었습니다.";
		} else if ("INVALID_TOKNE".equals(exception)) {
			message = "유효하지 않은 토큰입니다.";
		} else {
			message = "로그인이 필요한 서비스입니다.";
		}
		
		response.getWriter().print("{\"status\": 401, \"message\": \""+message+"\"}");
	}

}
