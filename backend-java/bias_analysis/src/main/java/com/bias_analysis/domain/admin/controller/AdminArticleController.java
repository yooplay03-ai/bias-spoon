package com.bias_analysis.domain.admin.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bias_analysis.domain.admin.dto.AdminArticleResponse;
import com.bias_analysis.domain.admin.dto.BulkRequestDTO;
import com.bias_analysis.domain.admin.service.AdminArticleService;
import com.bias_analysis.domain.response.PageResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/articles")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminArticleController {
	
	private final AdminArticleService adminArticleService;
	
	@GetMapping("/deleted")
	public ResponseEntity<PageResponse<AdminArticleResponse>> getDeletedArticles(
		@PageableDefault(size = 10, sort = "updatedAt", direction = Direction.DESC) Pageable pageable) {
		Page<AdminArticleResponse> page = adminArticleService.getDeletedArticles(pageable);
		return ResponseEntity.ok(new PageResponse<>(page));
		
	}
	
	@PatchMapping("/{id}/restore")
	public ResponseEntity<String> restoreArticle(
			@PathVariable("id") Long id) {
		adminArticleService.restoreArticle(id);
		return ResponseEntity.ok("게시글이 성공적으로 복구되었습니다.");
	}
	
	@PatchMapping("/restore-bulk")
	public ResponseEntity<Void> restoreArticlesBulk(
			@RequestBody BulkRequestDTO dto) {
		adminArticleService.restoreArticlesBulk(dto.getIds());
		return ResponseEntity.ok().build();
	}
	
}
