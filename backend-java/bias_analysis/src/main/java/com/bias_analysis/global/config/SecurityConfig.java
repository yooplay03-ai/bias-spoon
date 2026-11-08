package com.bias_analysis.global.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.bias_analysis.global.auth.CustomUserDetailsService;
import com.bias_analysis.global.jwt.JwtAccessDeniedHandler;
import com.bias_analysis.global.jwt.JwtAuthenticationEntryPoint;
import com.bias_analysis.global.jwt.JwtExceptionFilter;
import com.bias_analysis.global.jwt.JwtFilter;
import com.bias_analysis.global.jwt.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
	private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
	private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
	private final JwtTokenProvider jwtTokenProvider;
	private final CustomUserDetailsService customUserDetailsService;
	
	private static final String[] AUTH_WHITELIST = {
		"/api-docs/**",
		"/v3/api-docs/**",
		"/swagger-ui/**",
		"/swagger-ui.html"
	};
	
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.csrf(AbstractHttpConfigurer::disable)
				
				.logout(logout -> logout
						.disable())
				
				.sessionManagement(session -> 
					session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				
				.authorizeHttpRequests(request -> request
						.requestMatchers(AUTH_WHITELIST).permitAll()
						.requestMatchers(HttpMethod.GET, "/api/articles/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
						.requestMatchers("/api/articles").permitAll()
						.requestMatchers("/api/users/signup").permitAll()
						.requestMatchers("/api/auth/login").permitAll()
						.requestMatchers("/api/auth/reissue").permitAll()
						.requestMatchers("/api/users/check-loginId/{loginId}").permitAll()
						.requestMatchers("/api/users/check-nickname").permitAll()
						.requestMatchers("/api/users/send-code").permitAll()
						.requestMatchers("/api/users/password/reset").permitAll()
						.requestMatchers("/api/users/find-loginId/verify").permitAll()
						.requestMatchers("/api/users/profile/**").hasAnyAuthority("USER", "ADMIN")
						.requestMatchers("/api/admin/**").hasAnyAuthority("ADMIN")
						.requestMatchers("/api/auth/logout").authenticated()
						.anyRequest().authenticated())
				
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				
				
				.exceptionHandling(exception -> exception
						.accessDeniedHandler(jwtAccessDeniedHandler)
						.authenticationEntryPoint(jwtAuthenticationEntryPoint))
				
				.addFilterBefore(new JwtFilter(jwtTokenProvider, customUserDetailsService), UsernamePasswordAuthenticationFilter.class)
				.addFilterBefore(new JwtExceptionFilter(), JwtFilter.class)
		;
		
		return http.build();
	}
	
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		
		configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://192.168.0.66:5173", "http://127.0.0.1:5173")); // vite 설치하여서 포트 다름
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);
		configuration.setExposedHeaders(List.of("Authorization"));
		configuration.setMaxAge(3600L);
		
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}
