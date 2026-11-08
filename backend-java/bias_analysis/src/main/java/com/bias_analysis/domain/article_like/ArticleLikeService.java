package com.bias_analysis.domain.article_like;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.bias_analysis.domain.article.Article;
import com.bias_analysis.domain.article.ArticleRepository;
import com.bias_analysis.domain.user.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleLikeService {

    private final ArticleLikeRepository articleLikeRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createArticleLike(Long articleId, String loginId) {

        Article article = articleRepository.findById(articleId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 없습니다."));

        Long userId = userRepository.findByLoginId(loginId)
            .orElseThrow(() -> new EntityNotFoundException("유저 없음"))
            .getId();

        boolean alreadyLiked = articleLikeRepository.existsByArticleIdAndUserId(articleId, userId);
        if (alreadyLiked) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 좋아요를 눌렀습니다.");
        }

        ArticleLikeEntity articleLikeEntity = ArticleLikeEntity.builder()
            .article(article)
            .userId(userId)
            .build();

        articleLikeRepository.saveAndFlush(articleLikeEntity);
        
        articleRepository.incrementLikeCount(articleId);
    }

    @Transactional
    public void deleteArticleLike(Long articleId, String loginId) {
    	Long userId = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new EntityNotFoundException("유저 없음"))
                .getId();
    	
        if (!articleRepository.existsById(articleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 없습니다.");
        }

        boolean alreadyLiked = articleLikeRepository.existsByArticleIdAndUserId(articleId, userId);
        if (!alreadyLiked) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "좋아요 기록이 없습니다.");
        }

        articleLikeRepository.deleteByArticleIdAndUserId(articleId, userId);
        
        articleRepository.decrementLikeCount(articleId);
    }

    @Transactional(readOnly = true)
    public ArticleLikeStatusDTO getArticleLikeStatus(Long articleId, String loginId) {
    	
    	Integer articleLikeCount = articleLikeRepository.countByArticleId(articleId);
    	
    	if (loginId == null || "anonymousUser".equals(loginId)) {
    		return ArticleLikeStatusDTO.builder()
    				.articleId(articleId)
    				.likedByMe(false)
    				.articleLikeCount(articleLikeRepository.countByArticleId(articleId))
    				.build();
    	}
    	
    	Long userId = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new EntityNotFoundException("유저 없음"))
                .getId();
    	
        if (!articleRepository.existsById(articleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 없습니다.");
        }

        boolean likedByMe = articleLikeRepository.existsByArticleIdAndUserId(articleId, userId);

        return ArticleLikeStatusDTO.builder()
            .articleId(articleId)
            .likedByMe(likedByMe)
            .articleLikeCount(articleLikeCount)
            .build();
    }

    @Transactional(readOnly = true)
    public long getArticleLikeCount(Long articleId) {

        if (!articleRepository.existsById(articleId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 없습니다.");
        }

        return articleLikeRepository.countByArticleId(articleId);
    }
}