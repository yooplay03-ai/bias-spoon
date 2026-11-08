package com.bias_analysis.domain.article;

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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
@Tag(name = "Article", description = "게시글 관리 API")
public class ArticleController {

    private final ArticleService articleService;

    @Operation(summary = "게시글 등록", description = "새로운 게시글을 등록합니다.")
    @PostMapping
    public ResponseEntity<Long> create(
    		@Valid @RequestBody ArticleDTO dto, 
    		@AuthenticationPrincipal CustomUserDetails user) {
        log.info("[POST] Article 생성 요청 - User: {}, NickName: {}", user.getLoginId(), user.getUserNickName());
        String loginId = (user != null) ? user.getLoginId() : "anonymousUser";
        Long id = articleService.create(dto, loginId);
        // 생성 성공 시 201 Created 반환
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }
    
    @Operation(summary = "게시글 목록 조회", description = "등록된 모든 게시글을 조회합니다. category = \"free\"가 기본값, null이 들어와도 서비스 로직에서 free로 변경됨")
    @GetMapping
    public ResponseEntity<PageResponse<ArticleDTO>> getArticles(
    	@RequestParam(value = "category", required = false) String category,
    	@RequestParam(value = "type", required = false) String type,
    	@RequestParam(value = "keyword", required = false) String keyword,
    	@PageableDefault(size = 10, sort = "createdAt", direction = Direction.DESC) Pageable pageable,
    	@AuthenticationPrincipal CustomUserDetails user) {
    	log.info("[GET] Article 카테고리별 목록 조회 페이징처리 요청 category={}", category);
    	log.info("[GET] 검색 타입, 키워드 type={}, keyword={}",type, keyword);
    	Page<ArticleDTO> page = articleService.getArticlesByCategory(category, type, keyword, pageable);
    	
    	return ResponseEntity.ok(new PageResponse<>(page));
    }
    
    @Operation(summary = "게시글 상세 조회", description = "ID를 통해 특정 게시글을 상세 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ArticleDTO> detail(
        @Parameter(description = "게시글 ID", example = "1") @PathVariable("id") Long id,
        @AuthenticationPrincipal CustomUserDetails user) {
        log.info("[GET] Article 상세 조회 요청 - ID: {}", id);
        String loginId = (user != null) ? user.getLoginId() : "anonymousUser";
        ArticleDTO article = articleService.getArticleDetail(id, loginId, user);
        return ResponseEntity.ok(article);
    }
    
    
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    @Operation(summary = "게시글 수정", description = "기존 게시글의 내용을 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<ArticleDTO> update(
        @Parameter(description = "게시글 ID", example = "1") @PathVariable("id") Long id, 
        @Valid @RequestBody ArticleDTO dto,
        @AuthenticationPrincipal CustomUserDetails user) {
    	String loginId = (user != null) ? user.getLoginId() : "anonymousUser";
    	String role = user.getAuthorities().toString();
        log.info("[PUT] Article 수정 요청 - ID: {}, Data: {}, LoginId: {}, Role: {}", id, dto, loginId, role);
        ArticleDTO updated = articleService.update(id, dto, loginId, role);
        return ResponseEntity.ok(updated);
    }
    
    @PreAuthorize("hasAnyAuthority('USER','ADMIN')")
    @Operation(summary = "게시글 삭제", description = "특정 게시글을 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @Parameter(description = "게시글 ID", example = "1") @PathVariable("id") Long id,
        @AuthenticationPrincipal CustomUserDetails user) {
    	String loginId = (user != null) ? user.getLoginId() : "anonymousUser";
    	String role = user.getAuthorities().toString();
        log.info("[DELETE] Article 삭제 요청 - ID: {}, LoginId: {}, Role: {}", id, loginId, role);
        articleService.delete(id, loginId, role);
        // 삭제 성공 시 204 No Content 반환
        return ResponseEntity.noContent().build();
    }
}
