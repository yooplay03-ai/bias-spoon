package com.bias_analysis.domain.article;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.bias_analysis.domain.article_comment.ArticleCommentDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArticleDTO {

	private Long articleId;

	@NotBlank(message = "내용은 필수입니다.")
	private String content;

	@NotBlank(message = "제목은 필수입니다.")
	@Size(max = 45, message = "제목은 45자 이내여야 합니다.")
	private String subject;

	@Size(max = 45, message = "카테고리명은 45자 이내여야 합니다.")
	private String category;

	@Size(max = 45, message = "상태값은 45자 이내여야 합니다.")
	private String status;

	private Integer hitcount;
	
	private boolean likedByMe;
	private Integer articleLikeCount;
	
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	private List<ArticleCommentDTO> articleCommentDTO;
	
	private Integer commentCount;
	
	private String loginId;
	private String userNickName;
	
	private String pythonAnalysisId;
	// 파이썬 API를 통해 채워질 필드 (DB 저장 안함)
	private Object analysisData;
	private String llmAnalysis;
	
	public static ArticleDTO from(Article article, ObjectMapper objectMapper) {
		return ArticleDTO.builder()
				.articleId(article.getId())
				.loginId(article.getUserEntity() != null ? article.getUserEntity().getLoginId() : "anonymousUser")
				.userNickName(article.getUserEntity() != null ? article.getUserEntity().getUserNickName() : "탈퇴한 사용자")
				.subject(article.getSubject())
				.content(article.getContent())
				.category(article.getCategory())
				.status(article.getStatus())
				.hitcount(article.getHitcount())
				.createdAt(article.getCreatedAt())
				.updatedAt(article.getUpdatedAt())
				.pythonAnalysisId(article.getPythonAnalysisId())
				.analysisData(parseJson(article.getAnalysisData(), objectMapper))
				.llmAnalysis(article.getLlmAnalysis())
				.commentCount(article.getCommentCount())
				.articleLikeCount(article.getArticleLikeCount())
				.articleCommentDTO(
						article.getArticleComment() != null? article.getArticleComment()
								.stream()
								.map(ArticleCommentDTO::from)
								.collect(Collectors.toList()) : null)
				.build();
	}
	
	public static ArticleDTO fromEntityForList(Article article) {
	    return ArticleDTO.builder()
	            .articleId(article.getId())
	            .loginId(article.getUserEntity() != null ? article.getUserEntity().getLoginId() : "anonymousUser")
	            .userNickName(article.getUserEntity() != null ? article.getUserEntity().getUserNickName() : "탈퇴한 사용자")
	            .subject(article.getSubject())
	            .category(article.getCategory())
	            .status(article.getStatus())
	            .hitcount(article.getHitcount())
	            .createdAt(article.getCreatedAt())
	            .commentCount(article.getCommentCount())
	            .articleLikeCount(article.getArticleLikeCount())
	            .build();
	}
	
	private static Object parseJson(String json, ObjectMapper mapper) {
		try {
			return (json != null && !json.isEmpty() ? mapper.readTree(json) : null);
		} catch (Exception e) {
			return null;
		}
	}
}
