package com.bias_analysis.domain.article_comment;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.article.Article;
import com.bias_analysis.domain.article.ArticleRepository;
import com.bias_analysis.domain.article_comment_like.CommentLikeRepository;
import com.bias_analysis.domain.user.UserEntity;
import com.bias_analysis.domain.user.UserRepository;

import jakarta.persistence.EntityNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ArticleCommentService {
	
    private final ArticleCommentRepository articleCommentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    public Long saveComment(Long articleId, ArticleCommentDTO dto, String loginId) {
    	Article article = articleRepository.findById(articleId)
    			.orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다. ID : "+articleId));
    	
    	String targetLoginId = (loginId == null || loginId.equals("anonymousUser"))
    			? "anonymousUser" : loginId;
    	
    	UserEntity userEntity = userRepository.findByLoginId(targetLoginId)
    				.orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
    	
    	
        ArticleComment.ArticleCommentBuilder builder = ArticleComment.builder()
                .article(article)
                .userEntity(userEntity)
                .content(dto.getContent())
                .isAnonymous(targetLoginId.equals("anonymousUser") || dto.isAnonymous())
                .isSecret(dto.isSecret())
                .status("ACTIVE");
        
        if (dto.getParentId() != null) {
        	ArticleComment parent = articleCommentRepository.findById(dto.getParentId())
        			.orElseThrow(() -> new EntityNotFoundException("부모 댓글을 찾을 수 없습니다. ID: "+dto.getParentId()));
        	if (parent.getParent() != null) {
        		throw new IllegalArgumentException("대댓글에는 답글을 달 수 없습니다.");
        	}
        	if (!parent.getArticle().getId().equals(articleId)) {
        	    throw new IllegalArgumentException("다른 게시글의 댓글에 답글을 달 수 없습니다.");
        	}
        	builder.parent(parent);
        }
        
        article.addCommentCount();
        articleRepository.save(article);
        return articleCommentRepository.save(builder.build()).getId();
    }
    
    @Transactional(readOnly = true)
    public Page<ArticleCommentDTO> getCommentsByArticle(Long articleId, Pageable pageable, String loginId) {
    	
    	UserEntity user = userRepository.findByLoginId(loginId)
				.orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));
    	
    	Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글이 존재하지 않습니다. ID: " + articleId));
    	
    	if(article.getStatus().equals("DELETED") && !isAdmin(user)) {
    		throw new EntityNotFoundException("해당 게시글은 삭제된 게시글입니다. ID: "+articleId);
    	}
    	
    	Page<ArticleComment> parents = 
    			articleCommentRepository.findByArticleIdAndParentIdIsNull(articleId, pageable);
    	
    	if (parents.isEmpty()) {
    		return Page.empty(pageable);
    	}
    	
    	List<Long> parentIds = getParentIds(parents);
    	
    	final Long userId = user.getId();
    	Map<Long, List<ArticleCommentDTO>> repliesMap = repliesToMap(parentIds, userId);
    	
    	return getAllComments(parents, userId, repliesMap);
    }
    
    @Transactional(readOnly = true)
    public Page<ArticleCommentDTO> getMyComments(String loginId, Pageable pageable) {
    	Page<ArticleComment> comments = articleCommentRepository.findByUserEntity_LoginId(loginId, pageable);
    	
    	return comments.map(ArticleCommentDTO::fromEntityForList);
    }
    
    public Long updateComment(Long commentId, ArticleCommentDTO dto, String loginId, String role) {
        ArticleComment comment = articleCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 댓글이 존재하지 않습니다. id=" + commentId));
        
        // 권한 확인: 작성자 본인인지 체크
        if (!(comment.getUserEntity().getLoginId().equals(loginId) || role.contains("ADMIN"))) {
            throw new IllegalStateException("본인이 작성한 댓글만 수정할 수 있습니다.");
        }
        
        if (comment.getStatus().equals("DELETED")) {
        	throw new IllegalStateException("삭제된 댓글은 수정할 수 없습니다.");
        }
        
        comment.commentUpdate(dto.getContent(), dto.isAnonymous(), dto.isSecret());
        
        return comment.getId();
    }

    public void deleteComment(Long commentId, String loginId, String role) {
        ArticleComment comment = articleCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 댓글이 존재하지 않습니다. id=" + commentId));
        
        
        if (!(comment.getUserEntity().getLoginId().equals(loginId) || role.contains("ADMIN"))) {
        	throw new IllegalStateException("본인이 작성한 댓글만 삭제할 수 있습니다.");
        }
        
        if (comment.getStatus().equals("DELETED")) {
        	throw new IllegalStateException("이미 삭제된 댓글입니다.");
        }
        
        Article article = comment.getArticle();
        article.subCommentCount();
        comment.statusChange("DELETED");
    }
    
    private Map<Long, List<ArticleCommentDTO>> repliesToMap(List<Long> parentIds, Long userId) {
    	return articleCommentRepository.findByParentIdInOrderByCreatedAtAsc(parentIds).stream()
    			.map(comment -> {
    				ArticleCommentDTO dto = ArticleCommentDTO.from(comment);
    				dto.setLikedByMe(commentLikeRepository.existsByArticleCommentIdAndUserId(dto.getId(), userId));
    				dto.setCommentLikeCount(commentLikeRepository.countByArticleCommentId(dto.getId()));
    				return dto;
    			})
    			.collect(Collectors.groupingBy(ArticleCommentDTO::getParentId));
    }
    
    private Page<ArticleCommentDTO> getAllComments(Page<ArticleComment> parents, Long userId, Map<Long, List<ArticleCommentDTO>> repliesMap) {
    	return parents.map(parent -> {
    		ArticleCommentDTO dto = ArticleCommentDTO.from(parent);
    		dto.setLikedByMe(commentLikeRepository.existsByArticleCommentIdAndUserId(dto.getId(), userId));
    		dto.setCommentLikeCount(commentLikeRepository.countByArticleCommentId(dto.getId()));
    		List<ArticleCommentDTO> replies = repliesMap.getOrDefault(dto.getId(), new ArrayList<>());
    		dto.setReplies(replies);
    		return dto;
    	});
    }
    
    private List<Long> getParentIds(Page<ArticleComment> parents) {
    	return parents.getContent()
    			.stream()
    			.map(ArticleComment::getId)
    			.toList();
    }
    
    private boolean isAdmin(UserEntity user) {
    	return (user != null && user.getAuthorities().stream()
    			.anyMatch(a -> a.getAuthorityName().equals("ADMIN")));
    }
}