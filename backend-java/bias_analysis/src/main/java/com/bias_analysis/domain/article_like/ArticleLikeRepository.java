package com.bias_analysis.domain.article_like;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface ArticleLikeRepository extends JpaRepository<ArticleLikeEntity, Long> {

	Integer countByArticleId(Long articleId);

	boolean existsByArticleIdAndUserId(Long articleId, Long userId);
	
	@Modifying
	@Transactional
	void deleteByArticleIdAndUserId(Long articleId, Long userId);
}