package com.bias_analysis.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bias_analysis.domain.admin.dto.AdminStatsDTO;
import com.bias_analysis.domain.admin.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {
	
	private final AdminService adminService;
	
	@GetMapping("/stats")
	public ResponseEntity<AdminStatsDTO> getDashboardStats() {
		AdminStatsDTO stats = adminService.getDashboardStats();
		return ResponseEntity.ok(stats);
	}
}
