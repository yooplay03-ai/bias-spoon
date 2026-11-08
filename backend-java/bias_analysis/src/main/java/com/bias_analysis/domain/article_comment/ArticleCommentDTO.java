package com.bias_analysis.domain.article_comment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

//API 응답으로 데이터를 보낼 때 사용자에게 댓글 목록을 보여줄 때 사용하는 전송용 객체 

@Builder
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class ArticleCommentDTO {
	private Long id;

	private Long articleId;
	
	private Long userId;
	private String loginId;
	private String userNickName;

	private Long parentId; // = parentCommentId

	private String content;

	@Builder.Default
	private List<ArticleCommentDTO> replies = new ArrayList<>();

	private Integer commentLikeCount;
	
	private boolean likedByMe;
	
	private Integer reportCount;
	private boolean isAnonymous;
	private boolean isSecret;

	private String status;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
	private String articleSubject;

	public static ArticleCommentDTO from(ArticleComment entity) {
		String content = entity.getContent();
		if ("DELETE".equals(entity.getStatus())) {
			content = "삭제된 댓글입니다.";
		}

		return ArticleCommentDTO.builder()
			.id(entity.getId())
			.content(content)
			.articleId(entity.getArticle() != null ? entity.getArticle().getId() : null)
			.userId(entity.getUserEntity() != null ? entity.getUserEntity().getId() : null)
			.loginId(entity.getUserEntity() != null ? entity.getUserEntity().getLoginId() : null)
			.userNickName(entity.getUserEntity() != null ? entity.getUserEntity().getUserNickName() : null)
			.parentId(entity.getParent() != null ? entity.getParent().getId() : null)
			.commentLikeCount(entity.getCommentLikeCount() != null ? entity.getCommentLikeCount() : 0)
			.likedByMe(false)
			.reportCount(entity.getReportCount())
			.isAnonymous(entity.isAnonymous())
			.isSecret(entity.isSecret())
			.status(entity.getStatus())
			.createdAt(entity.getCreatedAt())
			.updatedAt(entity.getUpdatedAt())
			.build();
	}
	
	public static ArticleCommentDTO fromEntityForList(ArticleComment entity) {
	    return ArticleCommentDTO.builder()
	        .id(entity.getId())
	        .content(entity.getContent())
	        .articleId(entity.getArticle() != null ? entity.getArticle().getId() : null)
	        .articleSubject(entity.getArticle() != null ? entity.getArticle().getSubject() : "삭제된 게시글") 
	        .status(entity.getStatus())
	        .createdAt(entity.getCreatedAt())
	        .commentLikeCount(entity.getCommentLikeCount())
	        .build();
	}
}