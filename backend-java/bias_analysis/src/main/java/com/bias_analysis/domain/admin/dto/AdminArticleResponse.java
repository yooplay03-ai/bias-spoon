package com.bias_analysis.domain.admin.dto;

import java.time.LocalDateTime;

import com.bias_analysis.domain.article.Article;

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
public class AdminArticleResponse {
	private Long articleId;
	private String subject;
	private String loginId;
	private String status;
	private Integer hitcount;
	private Integer articleLikeCount;
	private Integer commentCount;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
	public static AdminArticleResponse convertToAdminDTO(Article article) {
		return AdminArticleResponse.builder()
				.articleId(article.getId())
				.subject(article.getSubject())
				.loginId(article.getUserEntity().getLoginId())
				.status(article.getStatus())
				.hitcount(article.getHitcount())
				.articleLikeCount(article.getArticleLikeCount())
				.commentCount(article.getCommentCount())
				.createdAt(article.getCreatedAt())
				.updatedAt(article.getUpdatedAt())
				.build();
	}
}
