package com.bias_analysis.domain.article_comment_like;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentLikeStatusDTO {
	private Long commentId;
	
	private boolean likedByMe;
	
	private Integer commentLikeCount;
}
