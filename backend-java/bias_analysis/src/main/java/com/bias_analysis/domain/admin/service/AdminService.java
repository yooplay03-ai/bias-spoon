package com.bias_analysis.domain.admin.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bias_analysis.domain.admin.dto.AdminStatsDTO;
import com.bias_analysis.domain.admin.dto.RecentActivityDTO;
import com.bias_analysis.domain.article.ArticleRepository;
import com.bias_analysis.domain.article_comment.ArticleCommentRepository;
import com.bias_analysis.domain.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

	private final UserRepository userRepository;
	private final ArticleRepository articleRepository;
	private final ArticleCommentRepository commentRepository;

	@Transactional(readOnly = true)
	public AdminStatsDTO getDashboardStats() {
		long totalUsers = userRepository.count();
		long blockedUsers = userRepository.countByStatus("BLOCKED");
		
		LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
		long todayNewUsers = userRepository.countByCreatedAtAfter(startOfToday);
		
		long totalArticles = articleRepository.count();
		long deletedArticles = articleRepository.countByStatus("DELETED"); // Enum으로 상태 관리 고려
		double articleRatio = totalArticles == 0 ? 0 :
			Math.round((double)deletedArticles / totalArticles * 1000) / 10.0;
		
		long totalComments = commentRepository.count();
		long deletedComments = commentRepository.countByStatus("DELETED");
		double commentRatio = totalComments == 0 ? 0 :
			Math.round((double)deletedComments / totalComments * 1000) / 10.0;
		
		List<RecentActivityDTO> activities = getRecentAcitivities()	;
		
		
		return AdminStatsDTO.builder()
				.totalUsers(totalUsers)
				.blockedUsersCount(blockedUsers)
				.todayNewUsers(todayNewUsers)
				.totalArticles(totalArticles)
				.deletedArticlesCount(deletedArticles)
				.articleDeleteRatio(articleRatio)
				.totalComments(totalComments)
				.deletedCommentsCount(deletedComments)
				.commentDeleteRatio(commentRatio)
				.recentActivities(activities)
				.build();
	}
	
	private List<RecentActivityDTO> getRecentAcitivities() {
		List<RecentActivityDTO> activities = new ArrayList<>();
		
		userRepository.findTop5ByOrderByCreatedAtDesc().forEach(user ->
		activities.add(RecentActivityDTO.builder()
				.type("USER")
				.status("NEW_JOIN")
				.targetTitle(user.getUserNickName())
				.performer("SYSTEM")
				.timestamp(user.getCreatedAt())
				.build())
				);
		
		articleRepository.findTop5ByStatusOrderByUpdatedAtDesc("DELETED").forEach(article ->
		activities.add(RecentActivityDTO.builder()
				.type("ARTICLE")
				.status("DELETED")
				.targetTitle(article.getSubject())
				.performer(article.getUserEntity().getLoginId())
				.timestamp(article.getUpdatedAt())
				.build())
				);
		
		commentRepository.findTop5ByStatusOrderByUpdatedAtDesc("DELETED").forEach(comment ->
		activities.add(RecentActivityDTO.builder()
				.type("COMMENT")
				.status("DELETED")
				.targetTitle(comment.getContent())
				.performer(comment.getUserEntity().getLoginId())
				.timestamp(comment.getUpdatedAt())
				.build())
				);
		
		return activities.stream()
				.sorted(Comparator.comparing(RecentActivityDTO::getTimestamp).reversed())
				.limit(5)
				.collect(Collectors.toList());
	}
}
