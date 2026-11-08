package com.bias_analysis.global.jwt;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import com.bias_analysis.global.auth.CustomUserDetails;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider implements InitializingBean{

	private final Logger logger = (Logger) LoggerFactory.getLogger(JwtTokenProvider.class);
	private static final String AUTHORITIES_KEY = "role";
	private final String secret;
	private SecretKey key;
	private final long tokenValidityInMilliseconds;
	private final long refreshTokenValidityInMilliseconds;
	
	public JwtTokenProvider(@Value("${jwt.secret}") String secret,
			@Value("${jwt.token-validity-in-seconds}") long tokenValidityInSeconds,
			@Value("${jwt.refresh-token-validity-in-seconds}") long refreshTokenValidityInSeconds) {
		this.secret = secret;
		this.tokenValidityInMilliseconds = tokenValidityInSeconds * 1000;
		this.refreshTokenValidityInMilliseconds = refreshTokenValidityInSeconds * 1000;
	}
	
	@Override
	public void afterPropertiesSet() throws Exception {
		byte[] keyBytes = Decoders.BASE64.decode(secret);
		this.key = Keys.hmacShaKeyFor(keyBytes);
	}
	
	public String createToken(Authentication authentication) {
		return createToken(authentication, this.tokenValidityInMilliseconds);
	}
	
	public String createRefreshToken(Authentication authentication) {
		return createToken(authentication, this.refreshTokenValidityInMilliseconds);
	}
	
	public String createToken(Authentication authentication, long validityTime) {
		
		String authorities = authentication.getAuthorities().stream()
				.map(GrantedAuthority :: getAuthority)
				.collect(Collectors.joining(","));
		
		String userNickName = "";
		if (authentication.getPrincipal() instanceof CustomUserDetails) {
			userNickName = ((CustomUserDetails) authentication.getPrincipal()).getUserNickName();
		}
		
		long now = (new Date()).getTime();
		Date validity = new Date(now + validityTime);
		
		return Jwts.builder()
				.subject(authentication.getName())
				.claim(AUTHORITIES_KEY, authorities)
				.claim("userNickName", userNickName)
				.issuedAt(new Date())
				.signWith(key)
				.expiration(validity)
				.compact();
	}
	
	public Authentication getAuthentication(String token) {
		Claims claims = Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload();
		
		Collection<? extends GrantedAuthority> authorities =
				Arrays.stream(claims.get(AUTHORITIES_KEY).toString().split(","))
				.map(SimpleGrantedAuthority::new)
				.collect(Collectors.toList());
		
		return new UsernamePasswordAuthenticationToken(claims.getSubject(), token, authorities);
	}
	
	public Authentication getAuthentication(String token, CustomUserDetails userDetails) {
		return new UsernamePasswordAuthenticationToken(userDetails, token, userDetails.getAuthorities());
//		String userNickName = claims.get("userNickName", String.class);
//		
//		CustomUserDetails principal = CustomUserDetails.builder()
//				.loginId(claims.getSubject())
//				.password("")
//				.userNickName(userNickName)
//				.authorities(authorities)
//				.build();
//		
//		return new UsernamePasswordAuthenticationToken(principal, token, authorities);
	}
	
	public boolean validateToken(String token) {
		try {
			Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
			return true;
		} catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
			logger.info("잘못된 JWT 서명입니다.");
		} catch (ExpiredJwtException e) {
			logger.info("만료된 JWT 토큰입니다.");
		} catch (UnsupportedJwtException e) {
			logger.info("지원되지 않는 JWT 토큰입니다.");
		} catch (IllegalArgumentException e) {
			logger.info("JWT 토큰이 잘못되었습니다.");
		}
		return false;
	}
	
	public long getRefreshTokenValidityInSeconds() {
		return this.refreshTokenValidityInMilliseconds / 1000;
	}
	
	public String getLoginId(String token) {
		return Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload()
				.getSubject();
	}
	
	public boolean isTokenExpiredByPasswordUpdatedAt(String token, LocalDateTime passwordUpdatedAt) {
		Claims claims = Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload();
		
		Date issuedAt = claims.getIssuedAt();
		LocalDateTime tokenIat = issuedAt.toInstant()
										 .atZone(ZoneId.systemDefault())
										 .toLocalDateTime();
		
		return passwordUpdatedAt.isAfter(tokenIat.plusSeconds(1));
	}
}
