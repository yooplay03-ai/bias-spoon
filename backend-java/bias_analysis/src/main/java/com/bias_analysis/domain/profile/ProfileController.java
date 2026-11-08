package com.bias_analysis.domain.profile;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bias_analysis.domain.article.ArticleDTO;
import com.bias_analysis.domain.article.ArticleService;
import com.bias_analysis.domain.article_comment.ArticleCommentDTO;
import com.bias_analysis.domain.article_comment.ArticleCommentService;
import com.bias_analysis.domain.user.UserResponseDTO;
import com.bias_analysis.domain.user.UserService;
import com.bias_analysis.domain.user.password.PasswordConfirm;
import com.bias_analysis.global.auth.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users/profile")
@RequiredArgsConstructor
public class ProfileController {
	
	private final ArticleService articleService;
	private final ArticleCommentService articleCommentService;
	private final UserService userService;
	private final ProfileService profileService;
	
	@Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 정보를 처리합니다.")
	@GetMapping
	public ResponseEntity<UserResponseDTO> getMyUserInfo(
			@AuthenticationPrincipal CustomUserDetails user) {
		
		UserResponseDTO userProfile = profileService.getUserInfo(user.getLoginId());
		return ResponseEntity.ok(userProfile);
	}
	
	@Operation(summary = "내가 쓴 글 목록 조회", description = "페이징 처리 된 글 목록을 반환합니다.")
	@GetMapping("/articles")
	public ResponseEntity<Page<ArticleDTO>> getMyArticles(
			@AuthenticationPrincipal CustomUserDetails user,
			@PageableDefault(size = 10, sort = "createdAt", direction = Direction.DESC) Pageable pageable) {
		
		Page<ArticleDTO> myArticles = articleService.getMyArticles(user.getLoginId(), pageable);
		return ResponseEntity.ok(myArticles);
	}
	
	@Operation(summary = "내가 쓴 댓글 목록 조회", description = "페이징 처리 된 댓글 목록을 반환합니다.")
	@GetMapping("/comments")
	public ResponseEntity<Page<ArticleCommentDTO>> getMyComments(
			@AuthenticationPrincipal CustomUserDetails user,
			@PageableDefault(size = 10, sort = "createdAt", direction = Direction.DESC) Pageable pageable) {	
		
		Page<ArticleCommentDTO> myComments = articleCommentService.getMyComments(user.getLoginId(), pageable);
		return ResponseEntity.ok(myComments);
	}
	
	@PutMapping("/edit")
	public ResponseEntity<UserResponseDTO> userUpdate(
			@Valid @RequestBody ProfileEditRequestDTO requestDTO,
			@AuthenticationPrincipal CustomUserDetails user) {
		
		UserResponseDTO userUpdated = userService.userUpdate(user.getLoginId(), requestDTO);
		
		return ResponseEntity.ok(userUpdated);
	}
	
	@DeleteMapping("/delete")
	public ResponseEntity<Void> deleteUser(
			@Valid @RequestBody PasswordConfirm passwordConfirm,
			@AuthenticationPrincipal CustomUserDetails user) {
		
		userService.userDelete(user.getLoginId(), passwordConfirm);
		return ResponseEntity.noContent().build();
	}
}
