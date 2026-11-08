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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bias_analysis.domain.admin.dto.AdminUserReponse;
import com.bias_analysis.domain.admin.service.AdminUserService;
import com.bias_analysis.domain.response.PageResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminUserController {
	
	private final AdminUserService adminUserService;
	
	@GetMapping
	public ResponseEntity<PageResponse<AdminUserReponse>> getUsers(
			@PageableDefault(size = 20, sort = "createdAt", direction = Direction.DESC) Pageable pageable) {
		Page<AdminUserReponse> page = adminUserService.getUsers(pageable);
		return ResponseEntity.ok(new PageResponse<>(page));
	}
	
	@PatchMapping("/{loginId}/status")
	public ResponseEntity<String> updateUserStatus(
			@PathVariable("loginId") String loginId,
			@RequestParam("status") String status) {
		adminUserService.updateStatus(loginId, status);
		return ResponseEntity.ok("회원 상태가 "+status+"(으)로 변경되었습니다.");
	}
	
	@PatchMapping("/{loginId}/role")
	public ResponseEntity<String> updateUserRole(
			@PathVariable("loginId") String loginId,
			@RequestParam("role") String role) {
		adminUserService.updateRole(loginId, role);
		return ResponseEntity.ok("회원 권한이 "+role+"(으)로 변경되었습니다.");
	}
}
