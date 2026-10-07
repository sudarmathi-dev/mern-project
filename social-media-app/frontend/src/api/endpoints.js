import api from "./axios";

export const authApi = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

export const postsApi = {
  create: (data) => api.post("/posts", data),
  feed: (page = 1) => api.get(`/posts/feed?page=${page}`),
  search: (q) => api.get(`/posts/search?q=${encodeURIComponent(q)}`),
  getOne: (id) => api.get(`/posts/${id}`),
  byUser: (userId) => api.get(`/posts/user/${userId}`),
  like: (id) => api.put(`/posts/${id}/like`),
  comment: (id, text) => api.post(`/posts/${id}/comments`, { text }),
  update: (id, data) => api.put(`/posts/${id}`, data),
  remove: (id) => api.delete(`/posts/${id}`),
};

export const usersApi = {
  profile: (username) => api.get(`/users/${username}`),
  follow: (id) => api.put(`/users/${id}/follow`),
  search: (q) => api.get(`/users/search?q=${encodeURIComponent(q)}`),
  updateMe: (data) => api.put("/users/me", data),
};

export const messagesApi = {
  inbox: () => api.get("/messages"),
  conversation: (userId) => api.get(`/messages/${userId}`),
  send: (userId, text) => api.post(`/messages/${userId}`, { text }),
};

export const notificationsApi = {
  list: (page = 1) => api.get(`/notifications?page=${page}`),
  markAllRead: () => api.put("/notifications/read"),
};

export const uploadApi = {
  image: (file, type = "post") => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", type);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const storiesApi = {
  feed: () => api.get("/stories"),
  byUser: (userId) => api.get(`/stories/user/${userId}`),
  create: (data) => api.post("/stories", data),
  view: (id) => api.put(`/stories/${id}/view`),
  remove: (id) => api.delete(`/stories/${id}`),
};
