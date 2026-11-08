package com.bias_analysis.domain.user;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bias_analysis.domain.user.password.PasswordChangeRequest;
import com.bias_analysis.global.auth.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "User", description = "사용자 관리 및 인증 API")
public class UserController {

	private final UserService userService;

	@Operation(summary = "회원가입", description = "새로운 사용자를 등록합니다.")
	@ApiResponses({ @ApiResponse(responseCode = "200", description = "회원가입 성공"),
			@ApiResponse(responseCode = "400", description = "잘못된 입력값 (유효성 검사 실패)") })
	@PostMapping("/users/signup")
	public ResponseEntity<UserEntity> signup(@RequestBody @Valid UserDTO userDTO) {
		return new ResponseEntity<>(userService.signup(userDTO), HttpStatus.OK);
	}
	
	@PutMapping("/users/password/change")
	public ResponseEntity<String> passwordChange(
			@RequestBody @Valid PasswordChangeRequest passwordChangRequest,
			@AuthenticationPrincipal CustomUserDetails user) {
		userService.passwordChange(user.getLoginId(), passwordChangRequest);
		
		return ResponseEntity.ok("비밀번호 변경 성공, 다시 로그인해주세요.");
	}

	@Operation(summary = "아이디 중복 체크", description = "사용 가능한 아이디인지 확인")
	@GetMapping("/users/check-loginId/{loginId}")
	public ResponseEntity<Boolean> checkLoginId(@PathVariable("loginId") String loginId) {
		boolean isDuplicate = userService.checkLoginIdDuplicate(loginId);
		return ResponseEntity.ok(isDuplicate);
	}
	
	@Operation(summary = "닉네임 중복 체크", description = "사용 가능한 닉네임인지 확인")
	@GetMapping("/users/check-nickname")
	public ResponseEntity<Boolean> checkNickName(@RequestParam("nickname") String nickname) {
		boolean isDuplicate = userService.checkNickNameDuplicate(nickname);
		return ResponseEntity.ok(isDuplicate);
	}
	
	@Operation(summary = "[관리자] 특정 유저 정보 관리", 
            description = "ADMIN 권한을 가진 관리자가 특정 유저의 정보를 조회하거나 수정합니다.",
            security = @SecurityRequirement(name = "jwtAuth"))
	@ApiResponses({
		@ApiResponse(responseCode = "200", description = "조회 성공"),
		@ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 전용)")
	})
	@PostMapping("/admin/users/{username}")
	public ResponseEntity<String> getUserInfo(@PathVariable("username") String username) {
		return ResponseEntity.ok("admin");
	}
	
}
