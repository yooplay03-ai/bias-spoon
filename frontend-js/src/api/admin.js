import { springApi } from './axios'; // 기존 인스턴스를 springApi로 사용

const adminApi = {
  // 1. 사용자 관리 (User Management)
  // 필드명: userNickName, loginId, status 등 UserEntity 기준
  getUsers: async (page = 0, size = 10) => {
    // baseURL에 /api가 있으므로 /admin/members로 호출
    const response = await springApi.get(`/admin/users`, {
      params: { page, size },
    });
    return response.data;
  },

  updateUserStatus: async (loginId, status) => {
    // @RequestParam으로 status를 받으므로 params에 담아 보냄
    return await springApi.patch(`/admin/users/${loginId}/status`, null, {
      params: { status },
    });
  },

  updateUserRole: async (loginId, role) => {
    // @RequestParam으로 role을 받으므로 params에 담아 보냄
    return await springApi.patch(`/admin/users/${loginId}/role`, null, {
      params: { role: role },
    });
  },

  // 2. 게시글 관리 (Article Management)
  getDeletedArticles: async (page = 0, size = 10) => {
    const response = await springApi.get(`/admin/articles/deleted`, {
      params: { page, size },
    });
    return response.data;
  },

  restoreArticle: async (id) => {
    return await springApi.patch(`/admin/articles/${id}/restore`);
  },

  restoreArticlesBulk: async (ids) => {
    return await springApi.patch(`/admin/articles/restore-bulk`, ids);
  },

  // 3. 댓글 관리 (Comment Management)
  getDeletedComments: async (page = 0, size = 10) => {
    const response = await springApi.get(`/admin/comments/deleted`, {
      params: { page, size },
    });
    return response.data;
  },

  restoreComment: async (id) => {
    return await springApi.patch(`/admin/comments/${id}/restore`);
  },

  restoreCommentsBulk: async (ids) => {
    return await springApi.patch(`/admin/comments/restore-bulk`, ids);
  },

  getDashboardStats: async () => {
    return await springApi.get(`/admin/stats`);
  },
};

export default adminApi;
