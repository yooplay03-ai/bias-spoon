package com.bias_analysis.domain.scheduler;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.article.Article;
import com.bias_analysis.domain.article.ArticleRepository;
import com.bias_analysis.domain.article_comment.ArticleComment;
import com.bias_analysis.domain.article_comment.ArticleCommentRepository;
import com.bias_analysis.domain.article_comment_like.CommentLikeRepository;
import com.bias_analysis.domain.article_like.ArticleLikeRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CountBatchScheduler {
	
	private final ArticleRepository articleRepository;
	private final ArticleLikeRepository articleLikeRepository;
	private final ArticleCommentRepository articleCommentRepository;
	private final CommentLikeRepository commentLikeRepository;
	
	// 데이터가 많아지면 페이징 처리
	@Scheduled(cron = "0 0 12 * * *")
	@Transactional
	public void syncLikeCount() {
		syncArticleLikes();
		syncCommentLikes();
		syncArticleCommentCount();
	}
	
	private void syncArticleLikes() {
		List<Article> articles = articleRepository.findAll();
		
		for (Article article : articles) {
			Integer realCount = articleLikeRepository.countByArticleId(article.getId());
			if (!article.getArticleLikeCount().equals(realCount)) {
				articleRepository.updateLikeCountManually(article.getId(), realCount);
			}
		}
	}
	
	private void syncCommentLikes() {
		List<ArticleComment> comments = articleCommentRepository.findAll();
		
		for (ArticleComment comment : comments) {
			Integer realCount = commentLikeRepository.countByArticleCommentId(comment.getId());
			if (!comment.getCommentLikeCount().equals(realCount)) {
				articleCommentRepository.updateLikeCountManually(comment.getId(), realCount);
			}
		}
	}
	
	private void syncArticleCommentCount() {
		List<Article> articles = articleRepository.findAll();
		
		for (Article article : articles) {
			Integer realCommentCount = articleCommentRepository.countByArticleIdAndStatusNot(article.getId(), "DELETED");
			
			if (!article.getCommentCount().equals(realCommentCount)) {
				articleRepository.updateCommentCountManually(article.getId(), realCommentCount);
			}
		}
	}
}
