package com.bias_analysis.domain.response;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PageResponse<T> {
	private List<T> content;
	private int currentPage;
	private long totalElements;
	private int totalPage;
	private boolean hasNext;
	
	public PageResponse(Page<T> page){
		this(page.getContent(), page.getNumber(), page.getTotalElements(), page.getTotalPages(), page.hasNext());
	}
}
