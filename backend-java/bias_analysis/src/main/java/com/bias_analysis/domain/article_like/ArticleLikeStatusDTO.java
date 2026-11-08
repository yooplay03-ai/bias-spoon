package com.bias_analysis.domain.article_like;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArticleLikeStatusDTO {

    private Long articleId;

    private boolean likedByMe;

    private Integer articleLikeCount;
}