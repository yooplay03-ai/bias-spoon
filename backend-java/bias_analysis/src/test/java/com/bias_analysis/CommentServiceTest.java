package com.bias_analysis;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.bias_analysis.domain.article.Article;
import com.bias_analysis.domain.article.ArticleRepository;
import com.bias_analysis.domain.article_comment.ArticleComment;
import com.bias_analysis.domain.article_comment.ArticleCommentDTO;
import com.bias_analysis.domain.article_comment.ArticleCommentRepository;
import com.bias_analysis.domain.article_comment.ArticleCommentService;
import com.bias_analysis.domain.article_comment_like.CommentLikeRepository;
import com.bias_analysis.domain.auth.AuthorityEntity;
import com.bias_analysis.domain.user.UserEntity;
import com.bias_analysis.domain.user.UserRepository;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {
	
	@Mock
	private UserRepository userRepository;
	
	@Mock
	private ArticleRepository articleRepository;
	
	@Mock
	private ArticleCommentRepository commentRepository;
	
	@Mock
	private CommentLikeRepository commentLikeRepository;
	
	@InjectMocks
	private ArticleCommentService commentService;
	
	private String content;
	private Long articleId;
	private String loginId;
	private UserEntity dummyUser;
	private Article dummyArticle;
	
	@BeforeEach
	void setup() {
		content = "새로운 댓글 내용";
		articleId = 1L;
		loginId = "testUser";
		
		AuthorityEntity mockAuthority = mock(AuthorityEntity.class);
		
		lenient().when(mockAuthority.getAuthorityName()).thenReturn("ROLE_USER");
		
		dummyUser = UserEntity.builder().id(1L).loginId(loginId).authorities(Collections.singleton(mockAuthority)).build();
		dummyArticle = Article.builder().id(articleId).build();
		
		lenient().when(articleRepository.findById(articleId)).thenReturn(Optional.of(dummyArticle));
		lenient().when(userRepository.findByLoginId(loginId)).thenReturn(Optional.of(dummyUser));
	}
	
	@Nested
	@DisplayName("댓글 생성")
	class SaveComment {
		
		@Nested
		@DisplayName("정상 케이스")
		class SuccessCase {
			@Test
			@DisplayName("새로운 일반 댓글 생성")
			void saveCommentSuccess1() {
				ArticleComment savedComment = ArticleComment.builder().id(100L).build();
				
				when(commentRepository.save(any(ArticleComment.class))).thenReturn(savedComment);
				
				ArticleCommentDTO dto = new ArticleCommentDTO();
				dto.setContent(content);
				
				Long commentId = commentService.saveComment(articleId, dto, loginId);
				
				assertEquals(100L, commentId);
			}
			
			@Test
			@DisplayName("새로운 대댓글 생성")
			void saveReplySuccess1() {
				ArticleComment savedComment = ArticleComment.builder().id(100L).build();
				
				ArticleComment dummyParent = ArticleComment.builder().id(50L).article(dummyArticle).build();
				when(commentRepository.findById(50L)).thenReturn(Optional.of(dummyParent));
				
				when(commentRepository.save(any(ArticleComment.class))).thenReturn(savedComment);
				
				ArticleCommentDTO dto = new ArticleCommentDTO();
				dto.setParentId(50L);
				dto.setContent(content);
				
				Long commentId = commentService.saveComment(articleId, dto, loginId);
				
				assertEquals(100L, commentId);
			}
		}
		
		@Nested
		@DisplayName("실패 케이스")
		class FailureCase {
			@Test
			@DisplayName("대댓글에 답글을 달 수 없음")
			void saveReplyFailure_DeepLevel() {
				ArticleComment grandParent = ArticleComment.builder().id(1L).build();
				ArticleComment parent = ArticleComment.builder()
						.id(2L)
						.parent(grandParent)
						.build();
				
				ArticleCommentDTO dto = new ArticleCommentDTO();
				dto.setParentId(parent.getId());
				
				when(commentRepository.findById(2L)).thenReturn(Optional.of(parent));
				
				IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
					commentService.saveComment(articleId, dto, loginId);
				});
				
				assertEquals("대댓글에는 답글을 달 수 없습니다.", exception.getMessage());
			}
			
			@Test
			@DisplayName("다른 게시글의 댓글에 답글을 달 수 없음")
			void saveReplyFailure_DifferentArticle() {
				ArticleComment parent = ArticleComment.builder()
						.id(1L)
						.article(dummyArticle)
						.build();
				
				Article otherArticle = Article.builder().id(2L).build();
				
				when(articleRepository.findById(otherArticle.getId())).thenReturn(Optional.of(otherArticle));
				
				when(commentRepository.findById(1L)).thenReturn(Optional.of(parent));
				
				ArticleCommentDTO dto = new ArticleCommentDTO();
				dto.setArticleId(otherArticle.getId());
				dto.setParentId(parent.getId());
				
				IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
					commentService.saveComment(otherArticle.getId(), dto, loginId);
				});
				
				assertEquals("다른 게시글의 댓글에 답글을 달 수 없습니다.", exception.getMessage());
			}
		}
	}
	
	@Nested
	@DisplayName("댓글 조회")
	class getComments {
		private Pageable pageable;
		private LocalDateTime createdAtNow;
		private LocalDateTime createdAtYesterday;
		private ArticleComment parent;
		private ArticleComment child1;
		private ArticleComment child2;
		
		@BeforeEach
		void getCommentsSetUp() {
			pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
			createdAtNow = LocalDateTime.now();
			createdAtYesterday = LocalDateTime.now().minusDays(1);
			parent = ArticleComment.builder().id(1L).content("부모 댓글").build();
			child1 = ArticleComment.builder().id(2L).content("대댓글1").parent(parent).createdAt(createdAtYesterday).build();
			child2 = ArticleComment.builder().id(3L).content("대댓글2").parent(parent).createdAt(createdAtNow).build();
		}
		
		@Nested
		@DisplayName("성공 케이스")
		class SuccessCase {
			
			@Test
			@DisplayName("댓글 / 대댓글 조회 성공 테스트")
			void getCommentsSuccess1() {
				Page<ArticleComment> parentPage = new PageImpl<>(List.of(parent), pageable, 1);
				when(commentRepository.findByArticleIdAndParentIdIsNull(articleId, pageable)).thenReturn(parentPage);
				
				List<ArticleComment> children = List.of(child1, child2);
				
				when(commentRepository.findByParentIdInOrderByCreatedAtAsc(any())).thenReturn(children);
				
				Page<ArticleCommentDTO> result = commentService.getCommentsByArticle(articleId, pageable, loginId);
				
				assertThat(result.getContent()).hasSize(1);
				
				ArticleCommentDTO parentDTO = result.getContent().get(0);
				assertThat(parentDTO.getReplies()).hasSize(2);
				
				assertThat(parentDTO.getReplies().get(0).getId()).isEqualTo(2L);
				assertThat(parentDTO.getReplies().get(1).getId()).isEqualTo(3L);
				
				assertThat(parentDTO.getReplies().get(0).getCreatedAt())
					.isBefore(parentDTO.getReplies().get(1).getCreatedAt());
			}
		}
	}
}

