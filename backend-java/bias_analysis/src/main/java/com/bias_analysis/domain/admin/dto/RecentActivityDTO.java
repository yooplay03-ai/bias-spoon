package com.bias_analysis.domain.admin.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecentActivityDTO {
	private String type;
	private String status;
	private String targetTitle;
	private String performer;
	private LocalDateTime timestamp;
}
