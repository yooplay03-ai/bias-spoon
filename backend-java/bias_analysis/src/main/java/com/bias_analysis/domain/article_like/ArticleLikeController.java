package com.bias_analysis.domain.article_like;

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
@RequestMapping("/api/articles")
@Tag(name = "Article Like", description = "게시글 좋아요 관리 API")
public class ArticleLikeController {

    private final ArticleLikeService articleLikeService;
    
    @Operation(summary = "좋아요 등록", description = "특정 게시글에 좋아요를 추가합니다.")
    @PostMapping("/{articleId}/likes")
    public ResponseEntity<ArticleLikeStatusDTO> createArticleLike(
        @Parameter(description = "게시글 ID") @PathVariable("articleId") Long articleId,
        @AuthenticationPrincipal CustomUserDetails user
    ) {
        log.info("[POST] ArticleLike 생성 요청 - articleId={}, loginId={}",
            articleId, user.getLoginId());

        articleLikeService.createArticleLike(articleId, user.getLoginId());
        
        ArticleLikeStatusDTO status = articleLikeService.getArticleLikeStatus(articleId, user.getLoginId());
        
        // 자원이 생성되었으므로 201 Created 반환
        return ResponseEntity.status(HttpStatus.CREATED).body(status);
    }
    
    @Operation(summary = "좋아요 취소", description = "특정 게시글에 등록한 좋아요를 삭제합니다.")
    @DeleteMapping("/{articleId}/likes")
    public ResponseEntity<ArticleLikeStatusDTO> deleteArticleLike(
        @Parameter(description = "게시글 ID") @PathVariable("articleId") Long articleId,
        @AuthenticationPrincipal CustomUserDetails user
    ) {
        log.info("[DELETE] ArticleLike 삭제 - Article:{}, User:{}", articleId, user.getLoginId());
        articleLikeService.deleteArticleLike(articleId, user.getLoginId());
        
        ArticleLikeStatusDTO status = articleLikeService.getArticleLikeStatus(articleId, user.getLoginId());
        
        // 상태가 변경된 정보를 리턴하므로 200 OK 반환
        return ResponseEntity.ok(status);
    }
    
    @Operation(summary = "좋아요 여부 확인", description = "특정 사용자가 이 게시글에 좋아요를 눌렀는지 확인합니다.")
    @GetMapping("/{articleId}/likes")
    public ResponseEntity<ArticleLikeStatusDTO> getArticleLikeStatus(
        @Parameter(description = "게시글 ID") @PathVariable("articleId") Long articleId,
        @AuthenticationPrincipal CustomUserDetails user
    ) {
        log.info("[GET] ArticleLike 상태 조회 - articleId={}, loginId={}",
            articleId, user.getLoginId());

        ArticleLikeStatusDTO status = articleLikeService.getArticleLikeStatus(articleId, user.getLoginId());
        return ResponseEntity.ok(status);
    }
    
    @Operation(summary = "좋아요 총 개수", description = "게시글의 전체 좋아요 개수를 조회합니다.")
    @GetMapping("/{articleId}/likes/count")
    public ResponseEntity<Long> getArticleLikeCount(
        @Parameter(description = "게시글 ID") @PathVariable("articleId") Long articleId) {
        log.info("[GET] ArticleLike 개수 조회 - articleId={}", articleId);
        
        long count = articleLikeService.getArticleLikeCount(articleId);
        return ResponseEntity.ok(count);
    }
}
