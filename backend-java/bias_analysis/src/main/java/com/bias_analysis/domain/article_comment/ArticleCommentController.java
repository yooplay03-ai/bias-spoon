package com.bias_analysis.domain.article_comment;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.bias_analysis.domain.response.PageResponse;
import com.bias_analysis.global.auth.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Comment", description = "게시글 댓글 관리 API")
public class ArticleCommentController {

    private final ArticleCommentService articleCommentService;

    @Operation(summary = "댓글 작성", description = "특정 게시글에 새로운 댓글을 등록합니다.")
    @PostMapping("/articles/{articleId}/comments") // 경로에 articleId 추가
    public ResponseEntity<Long> create(
            @Parameter(description = "게시글 ID") @PathVariable("articleId") Long articleId,
            @Valid @RequestBody ArticleCommentDTO dto,
            @AuthenticationPrincipal CustomUserDetails user) {
    	String loginId = (user != null) ? user.getLoginId() : "anonymousUser";
        Long commentId = articleCommentService.saveComment(articleId, dto, loginId);
        return ResponseEntity.status(HttpStatus.CREATED).body(commentId);
    }

    @Operation(summary = "댓글 목록 조회", description = "해당 게시글에 작성된 모든 댓글을 조회합니다.")
    @GetMapping("/articles/{articleId}/comments")
    public ResponseEntity<PageResponse<ArticleCommentDTO>> getComments(
    		@Parameter(description = "게시글 ID") @PathVariable("articleId") Long articleId,
    		@PageableDefault(size = 10, sort = "createdAt", direction = Direction.ASC) Pageable pageable,
    		@AuthenticationPrincipal CustomUserDetails user) {
    	String loginId = (user != null) ? user.getLoginId() : "anonymousUser";
    	Page<ArticleCommentDTO> commentPage = articleCommentService.getCommentsByArticle(articleId, pageable, loginId);
    	return ResponseEntity.ok(new PageResponse<>(commentPage));
    }
    
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    @Operation(summary = "댓글 수정", description = "기존에 작성한 댓글의 내용을 수정합니다.")
    @PutMapping("/comments/{commentId}") // 불필요한 articleId 경로 제거
    public ResponseEntity<Long> update(
            @Parameter(description = "댓글 ID") @PathVariable("commentId") Long commentId,
            @Valid @RequestBody ArticleCommentDTO dto,
            @AuthenticationPrincipal CustomUserDetails user) {
    	String loginId = (user != null) ? user.getLoginId() : "anonymousUser";
    	String role = user.getAuthorities().toString();
        Long updatedId = articleCommentService.updateComment(commentId, dto, loginId, role);
        return ResponseEntity.ok(updatedId);
    }
    
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    @Operation(summary = "댓글 삭제", description = "댓글을 삭제합니다.")
    @DeleteMapping("/comments/{commentId}") // 불필요한 articleId 경로 제거
    public ResponseEntity<Void> delete(
            @Parameter(description = "댓글 ID") @PathVariable("commentId") Long commentId,
            @AuthenticationPrincipal CustomUserDetails user) {
    	String loginId = (user != null) ? user.getLoginId() : "anonymousUser";
    	String role = user.getAuthorities().toString();
        articleCommentService.deleteComment(commentId, loginId, role);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
