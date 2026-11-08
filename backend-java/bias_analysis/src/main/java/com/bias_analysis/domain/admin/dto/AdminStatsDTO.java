package com.bias_analysis.domain.admin.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminStatsDTO {
    private long totalUsers;
    private long todayNewUsers;
    private long blockedUsersCount;
    
    private long totalArticles;
    private long deletedArticlesCount;
    private double articleDeleteRatio;

    private long totalComments;
    private long deletedCommentsCount;
    private double commentDeleteRatio;

    private List<RecentActivityDTO> recentActivities;
}
