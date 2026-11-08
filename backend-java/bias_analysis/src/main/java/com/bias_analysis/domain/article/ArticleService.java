package com.bias_analysis.domain.article;

import java.util.Arrays;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.bias_analysis.domain.article_like.ArticleLikeService;
import com.bias_analysis.domain.article_like.ArticleLikeStatusDTO;
import com.bias_analysis.domain.user.UserEntity;
import com.bias_analysis.domain.user.UserRepository;
import com.bias_analysis.global.auth.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArticleService {

	private final ArticleRepository articleRepository;
	private final UserRepository userRepository;
	private final ArticleLikeService articleLikeService;
	private final AnalysisDataSyncService syncService;
	private final ObjectMapper objectMapper;
	
	private final String[] types = {
			"all", "title", "content", "author"
	};
	
	// C
	@Transactional
    public Long create(ArticleDTO dto, String loginId) {
    	
		String targetLoginId = (loginId == null || loginId.equals("anonymousUser"))
    			? "anonymousUser" : loginId;
		
    	UserEntity userEntity = userRepository.findByLoginId(targetLoginId)
    			.orElseThrow(() -> new EntityNotFoundException("유저 없음"));
    	 
    	String analysisData = "[]";
    	String llmAnalysis = null;
    	
    	if ("ANALYSIS".equalsIgnoreCase(dto.getCategory()) && dto.getPythonAnalysisId() != null) {
    		Map<String, String> syncedData = syncService.fetchPythonData(dto.getPythonAnalysisId());
    		analysisData = syncedData.get("analysisData");
    		llmAnalysis = syncedData.get("llmAnalysis");
    	 }
    	 
    	 Article article = Article.builder()
    			 .userEntity(userEntity)
    			 .subject(dto.getSubject())
    			 .content(dto.getContent())
    			 .category(dto.getCategory())
    			 .pythonAnalysisId(dto.getPythonAnalysisId())
    			 .analysisData(analysisData)
    			 .llmAnalysis(llmAnalysis)
    			 .status("ACTIVE")
    			 .hitcount(0)
    			 .build();
    	 
        return articleRepository.save(article).getId();
    }

	@Transactional(readOnly = true)
	public Page<ArticleDTO> getArticlesByCategory(String category, String type, String keyword, Pageable pageable) {
		if (category == null) {
			category = "FREE";
		}
		
		boolean isSearchValid = 
				keyword != null && !keyword.isBlank() && type != null && Arrays.asList(types).contains(type);
		
		Page<Article> articles = isSearchValid
				? articleRepository.searchArticles(category, type, keyword, pageable)
				: articleRepository.findByCategoryIgnoreCase(category, pageable);
		
		return articles.map(article -> ArticleDTO.from(article, objectMapper));
	}
	
	@Transactional(readOnly = true)
	public Page<ArticleDTO> getMyArticles(String loginId, Pageable pageable) {
		Page<Article> articles = articleRepository.findByUserEntity_LoginIdAndStatus(loginId, "ACTIVE", pageable);
		return articles.map(ArticleDTO::fromEntityForList);
	}

	@Transactional
	public ArticleDTO getArticleDetail(Long articleId, String loginId, CustomUserDetails user) {
		Article article = articleRepository.findById(articleId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글이 없습니다."));
		
		boolean isAdmin = (user != null && 
	        		user.getAuthorities().stream()
	        		.anyMatch(a -> a.getAuthority().equals("ADMIN")));
		
		if (article.getStatus().equalsIgnoreCase("DELETED") && !isAdmin) {
	        throw new EntityNotFoundException("해당 게시글은 삭제된 게시글입니다. ID: "+articleId);
	    }
		
		article.increaseHitCount();
		ArticleDTO dto = ArticleDTO.from(article, objectMapper);
			
		ArticleLikeStatusDTO likeStatus = articleLikeService.getArticleLikeStatus(articleId, loginId);
		dto.setLikedByMe(likeStatus.isLikedByMe());
		dto.setArticleLikeCount(likeStatus.getArticleLikeCount());
		return dto;
	}

	@Transactional
	public ArticleDTO update(Long articleId, ArticleDTO dto, String loginId, String role) {
		
		Article article = articleRepository.findById(articleId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "수정할 게시글이 없습니다."));
		
		if (!(article.getUserEntity().getLoginId().equals(loginId) || role.contains("ADMIN"))) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "수정 권한이 없습니다. (작성자 본인이 아님)");
		}
		
		String newStatus = (dto.getStatus() == null? article.getStatus(): dto.getStatus());
		
		article.update(dto.getSubject(), dto.getContent(), dto.getCategory(), newStatus);

		return ArticleDTO.from(article, objectMapper);
	}

	@Transactional
	public void delete(Long articleId, String loginId, String role) {
		
		Article article = articleRepository.findById(articleId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "삭제할 게시글이 없습니다."));
		
		if (!(article.getUserEntity().getLoginId().equals(loginId) || role.contains("ADMIN"))) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "삭제 권한이 없습니다. (작성자 본인이 아님)");
		}
		
		article.setStatus("DELETED");
	}
	
}
