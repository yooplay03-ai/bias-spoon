import { springApi } from './axios';

const articleApi = {
  // 1. 게시글 목록 조회 (카테고리, 페이징 등 포함 가능)
  getArticles: (
    category,
    page = 0,
    type = 'all',
    keyword = '',
    sort = 'createdAt',
    orter = 'desc',
  ) => {
    return springApi.get('/articles', {
      params: {
        category: category == 'ALL' ? '' : category,
        page: page,
        size: 10,
        sort: `${sort},${orter}`,
        type: type,
        keyword: keyword,
      },
    });
  },

  // 2. 게시글 상세 조회 (분석 데이터 포함)
  getArticleDetail: async (id, page = 0) => {
    const response = await springApi.get(`/articles/${id}`, {
      params: { page: page },
    });
    return response.data; // 상세 정보 및 analysisData 포함
  },

  createArticle: async (articleData) => {
    const response = await springApi.post('/articles', articleData);
    return response.data;
  },

  getUserAnalysis: async (loginId) => {
    // const loginId = localStorage.getItem('loginId');
    return await springApi.get(
      // `http://localhost:8000/api/analysis/my-list/${loginId}`,
      `http://${window.location.hostname}:8000/api/analysis/my-list/${loginId}`,
    );
  },

  deleteArticle: async (id) => {
    const response = await springApi.delete(`/articles/${id}`);
    return response.data;
  },

  updateArticle: async (id, data) => {
    const response = await springApi.put(`/articles/${id}`, data);
    return response.data;
  },

  addlike: async (articleId) => {
    const response = await springApi.post(`/articles/${articleId}/likes`);
    return response.data;
  },
  removelike: async (articleId) => {
    const response = await springApi.delete(`/articles/${articleId}/likes`);
    return response.data;
  },
  getLikeStatus: async (articleId) => {
    const response = await springApi.get(`/articles/${articleId}/likes`);
    return response.data;
  },

  // 댓글 목록 조회
  getComments: async (articleId, page = 0) => {
    const response = await springApi.get(`/articles/${articleId}/comments`, {
      params: { page, size: 10, sort: 'createdAt,asc' },
    });
    return response.data;
  },

  // 댓글 작성 (POST /api/articles/{articleId}/comments)
  addComment: async (articleId, data) => {
    const response = await springApi.post(
      `/articles/${articleId}/comments`,
      data,
    );
    return response.data;
  },

  // 댓글 수정 (PUT /api/comments/{commentId}) - articleId가 필요 없는 구조임
  updateComment: async (commentId, data) => {
    const response = await springApi.put(`/comments/${commentId}`, data);
    return response.data;
  },

  // 댓글 삭제 (DELETE /api/comments/{commentId})
  deleteComment: async (commentId) => {
    const response = await springApi.delete(`/comments/${commentId}`);
    return response.data;
  },

  addCommentLike: async (commentId) => {
    const response = await springApi.post(`/comments/${commentId}/likes`);
    return response.data;
  },

  removeCommentLike: async (commentId) => {
    const response = await springApi.delete(`/comments/${commentId}/likes`);
    return response.data;
  },

  getMyArticles: async (params) => {
    const response = await springApi.get(`/users/profile/articles`, {
      params,
    });
    return response.data;
  },

  getMyComments: async (params) => {
    const response = await springApi.get(`/users/profile/comments`, {
      params,
    });
    return response.data;
  },
};

export default articleApi;
