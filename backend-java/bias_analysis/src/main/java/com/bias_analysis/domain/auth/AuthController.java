package com.bias_analysis.domain.auth;

import java.util.Arrays;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bias_analysis.global.dto.LoginDTO;
import com.bias_analysis.global.dto.TokenDTO;
import com.bias_analysis.global.dto.TokenRequestDTO;
import com.bias_analysis.global.jwt.JwtFilter;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "인증 및 토큰 관리 API")
public class AuthController {
	private final AuthService authService;
	
	@Operation(summary = "로그인", description = "ID와 비밀번호로 인증을 진행하고 Access/Refresh 토큰을 발급합니다.")
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "로그인 성공 (헤더 및 바디에 토큰 포함)",
					 content = @Content(schema = @Schema(implementation = TokenDTO.class))),
		@ApiResponse(responseCode = "400", description = "로그인 실패 (자격 증명 불일치)")
	})
	@PostMapping("/login")
	public ResponseEntity<TokenDTO> authorize(@RequestBody @Valid LoginDTO loginDto) {
		TokenDTO tokenDto = authService.login(loginDto);
		
		long maxAge = authService.getRefreshTokenValidityInSeconds();
		
		ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", tokenDto.getRefreshToken())
				.path("/")
				.httpOnly(true)
				.secure(false)
				.maxAge(maxAge)
				.sameSite("Lax")
				.build();
		
		
		HttpHeaders httpHeaders = new HttpHeaders();
		httpHeaders.add(JwtFilter.AUTHORIZATION_HEADER, "Bearer " + tokenDto.getAccessToken());
		httpHeaders.add(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());
		
		return new ResponseEntity<>(tokenDto, httpHeaders, HttpStatus.OK);
	}
	
	@Operation(summary = "로그아웃", description = "DB에서 Refresh 토큰을 삭제하고 로그아웃을 처리합니다.")
	@PostMapping("/logout")
	public ResponseEntity<?> logout(@RequestBody TokenRequestDTO tokenRequestDTO) {
		authService.logout(tokenRequestDTO.getRefreshToken());
		return ResponseEntity.ok().build();
	}
	
	@Operation(summary = "토큰 재발급", description = "만료된 Access 토큰을 대신하여 Refresh 토큰으로 새로운 토큰을 발급받습니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "재발급 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 Refresh 토큰"),
        @ApiResponse(responseCode = "401", description = "Refresh 토큰 만료 또는 인증 실패")
    })
	@PostMapping("/reissue")
	public ResponseEntity<?> reissue(HttpServletRequest request) {
		Cookie[] cookies = request.getCookies();
		if (cookies == null) return ResponseEntity.status(401).build();
		
		String refreshToken = Arrays.stream(cookies)
				.filter(c -> "refreshToken".equals(c.getName()))
				.findFirst()
				.map(Cookie::getValue)
				.orElse(null);
		
		if (refreshToken == null) return ResponseEntity.status(401).build();
		
		try {
			TokenDTO tokenDTO = authService.reissue(refreshToken);
			return ResponseEntity.ok(tokenDTO);
		} catch (RuntimeException e) {
			return ResponseEntity.status(401).body(e.getMessage());
		}
		
	}
}
