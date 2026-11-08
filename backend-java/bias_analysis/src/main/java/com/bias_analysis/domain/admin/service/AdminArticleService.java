package com.bias_analysis.domain.admin.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.admin.dto.AdminArticleResponse;
import com.bias_analysis.domain.article.Article;
import com.bias_analysis.domain.article.ArticleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminArticleService {
	
	private final ArticleRepository articleRepository;
	
	@Transactional(readOnly = true)
	public Page<AdminArticleResponse> getDeletedArticles(Pageable pageable) {
		Page<Article> articlePage = articleRepository.findAllByStatus("DELETED", pageable);
		
		return articlePage.map(AdminArticleResponse::convertToAdminDTO);
	}
	
	@Transactional
	public void restoreArticle(Long articleId) {
		Article article = articleRepository.findById(articleId)
				.orElseThrow(() -> new IllegalArgumentException("해당 게시글을 찾을 수 없습니다."));
		
		article.setStatus("ACTIVE");
	}
	
	@Transactional
	public void restoreArticlesBulk(List<Long> ids) {
		if (ids == null || ids.isEmpty()) return;
		articleRepository.restoreArticlesByIds(ids);
	}
}
