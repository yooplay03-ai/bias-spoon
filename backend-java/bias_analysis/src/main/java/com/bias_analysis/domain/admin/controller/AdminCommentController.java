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

import com.bias_analysis.domain.admin.dto.AdminCommentResponse;
import com.bias_analysis.domain.admin.dto.BulkRequestDTO;
import com.bias_analysis.domain.admin.service.AdminCommentService;
import com.bias_analysis.domain.response.PageResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/comments")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminCommentController {
	
	private final AdminCommentService adminCommentService;
	
	@GetMapping("/deleted")
	public ResponseEntity<PageResponse<AdminCommentResponse>> getDeletedComments(
			@PageableDefault(size = 10, sort = "updatedAt", direction = Direction.DESC) Pageable pageable) {
		Page<AdminCommentResponse> page = adminCommentService.getDeletedComments(pageable);
		return ResponseEntity.ok(new PageResponse<>(page));
	}
	
	@PatchMapping("/{id}/restore")
	public ResponseEntity<String> restoreComment(
			@PathVariable("id") Long id) {
		adminCommentService.restoreComment(id);
		return ResponseEntity.ok("댓글이 복구되었습니다.");
	}
	
	@PatchMapping("/restore-bulk")
	public ResponseEntity<Void> restoreCommentsBulk(
			@RequestBody BulkRequestDTO dto) {
		adminCommentService.restoreCommentsBulk(dto.getIds());
		return ResponseEntity.ok().build();
	}
}
