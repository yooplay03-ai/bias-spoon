package com.bias_analysis.domain.article_comment_like;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.bias_analysis.global.auth.CustomUserDetails;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments")
@Tag(name = "Comment Like", description = "댓글 좋아요 관리 API")
public class CommentLikeController {
    
    private final CommentLikeService commentLikeService;
    
    @Operation(summary = "댓글 좋아요 등록", description = "댓글에 좋아요를 추가하고 최신 상태를 반환합니다.")
    @PostMapping("/{commentId}/likes")
    public ResponseEntity<CommentLikeStatusDTO> createCommentLike(
            @Parameter(description = "댓글 ID") @PathVariable("commentId") Long commentId,
            @AuthenticationPrincipal CustomUserDetails user) {
    	if (user == null) {
    	    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    	}
        log.info("[POST] CommentLike 생성 - Comment:{}, User:{}", commentId, user.getLoginId());
        commentLikeService.addLike(commentId, user.getLoginId());
        
        // 최신 상태 조회 및 201 Created 반환
        CommentLikeStatusDTO status = commentLikeService.getCommentLikeStatus(commentId, user.getLoginId());
        return ResponseEntity.status(HttpStatus.CREATED).body(status);
    }

    @Operation(summary = "댓글 좋아요 취소", description = "등록된 댓글 좋아요를 삭제하고 최신 상태를 반환합니다.")
    @DeleteMapping("/{commentId}/likes")
    public ResponseEntity<CommentLikeStatusDTO> deleteCommentLike(
            @Parameter(description = "댓글 ID") @PathVariable("commentId") Long commentId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
    	if (user == null) {
    	    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    	}
        log.info("[DELETE] CommentLike 삭제 - Comment:{}, User:{}", commentId, user.getLoginId());
        commentLikeService.removeLike(commentId, user.getLoginId());
        
        // 삭제 후 변동된 상태 반환 (200 OK)
        CommentLikeStatusDTO status = commentLikeService.getCommentLikeStatus(commentId, user.getLoginId());
        return ResponseEntity.ok(status);
    }

    @Operation(summary = "댓글 좋아요 여부 및 개수 확인", description = "사용자의 댓글 좋아요 여부와 해당 댓글의 총 좋아요 수를 조회합니다.")
    @GetMapping("/{commentId}/likes")
    public ResponseEntity<CommentLikeStatusDTO> getCommentLikeStatus(
            @Parameter(description = "댓글 ID") @PathVariable("commentId") Long commentId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        log.info("[GET] CommentLike 상태 조회 - commentId={}, likedUserId={}", commentId, user.getLoginId());
        
        CommentLikeStatusDTO status = commentLikeService.getCommentLikeStatus(commentId, user.getLoginId());
        return ResponseEntity.ok(status);
    }
}
