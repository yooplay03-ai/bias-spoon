package com.bias_analysis.domain.admin.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.admin.dto.AdminCommentResponse;
import com.bias_analysis.domain.article_comment.ArticleComment;
import com.bias_analysis.domain.article_comment.ArticleCommentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCommentService {
	
	private final ArticleCommentRepository commentRepository;
	
	@Transactional(readOnly = true)
	public Page<AdminCommentResponse> getDeletedComments(Pageable pageable) {
		Page<ArticleComment> commentPage = commentRepository.findAllByStatus("DELETED", pageable);
		
		return commentPage.map(AdminCommentResponse::convertToAdminDTO);
	}
	
	@Transactional
	public void restoreComment(Long commentId) {
		ArticleComment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
		
		comment.statusChange("ACTIVE");
	}
	
	@Transactional
	public void restoreCommentsBulk(List<Long> ids) {
		if (ids == null || ids.isEmpty()) return;
		commentRepository.restoreCommentsByIds(ids);
	}
}
