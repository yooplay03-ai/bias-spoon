package com.bias_analysis.domain.admin.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BulkRequestDTO {
	private List<Long> ids;
}
