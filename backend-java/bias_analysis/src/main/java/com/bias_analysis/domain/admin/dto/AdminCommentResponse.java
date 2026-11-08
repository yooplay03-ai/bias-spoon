package com.bias_analysis.domain.admin.dto;

import java.time.LocalDateTime;

import com.bias_analysis.domain.article_comment.ArticleComment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCommentResponse {
	private Long commentId;
	private Long articleId;
	private String loginId;
	private String content;
	private String status;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
	public static AdminCommentResponse convertToAdminDTO(ArticleComment comment) {
		return AdminCommentResponse.builder()
				.commentId(comment.getId())
				.articleId(comment.getArticle().getId())
				.loginId(comment.getUserEntity().getLoginId())
				.content(comment.getContent())
				.status(comment.getStatus())
				.createdAt(comment.getCreatedAt())
				.updatedAt(comment.getUpdatedAt())
				.build();
	}
}
