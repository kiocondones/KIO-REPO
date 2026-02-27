// src/services/api.js

const BASE_URL = "http://127.0.0.1:5000";
const INVALID_TOKEN_VALUES = new Set(["undefined", "null", ""]);
const isBrowser = typeof window !== "undefined";

function getStoredToken() {
  if (!isBrowser) {
    return null;
  }
  const token = window.localStorage.getItem("token");
  if (!token || INVALID_TOKEN_VALUES.has(token.trim())) {
    clearStoredToken();
    return null;
  }
  return token.trim();
}

function setStoredToken(token) {
  if (!isBrowser || !token) {
    return;
  }
  window.localStorage.setItem("token", token);
}

function clearStoredToken() {
  if (!isBrowser) {
    return;
  }
  window.localStorage.removeItem("token");
}

async function requestJson(url, options = {}) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const headers = { ...(options.headers ?? {}) };
  const token = getStoredToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.message ?? `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

const API = {
  login: async (credentials) => {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Invalid email or password",
        };
      }

      if (data.accessToken) {
        setStoredToken(data.accessToken);
      }

      return {
        ...data,
        success: data.success ?? true,
      };
    } catch (error) {
      return {
        success: false,
        message: "An error occurred during login. Please try again.",
      };
    }
  },

  sendOTP: async (phone) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: "OTP sent to " + phone };
  },

  verifyOTP: async (phone, otp) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (otp === "123456") {
      return {
        success: true,
        user: {
          id: 2,
          name: "Mobile User",
          phone: phone,
          role: "requestor",
          department: "Operations",
        },
        accessToken: "mock_token_" + Date.now(),
      };
    }
    return { success: false, message: "Invalid OTP" };
  },

  // Dashboard (still mock)
  getDashboardStats: async () => {
    try {
      const stats = await requestJson("/api/requestor/dashboard");
      return {
        total: stats?.total ?? 0,
        open: stats?.open ?? 0,
        openTickets: stats?.open ?? 0,
        inProgress: stats?.in_progress ?? 0,
        completed: stats?.resolved ?? 0,
        resolved: stats?.resolved ?? 0,
        closed: stats?.closed ?? 0,
        totalSpent: stats?.totalSpent ?? 0,
        ytdExpenses: stats?.ytdExpenses ?? 0,
        mtdExpenses: stats?.mtdExpenses ?? 0,
        avgRating: stats?.avgRating ?? 0,
      };
    } catch (err) {
      console.warn("getDashboardStats backend failed, using fallback data:", err);
      return {
        openTickets: 5,
        inProgress: 3,
        completed: 12,
        totalSpent: 45250.0,
        ytdExpenses: 125000.0,
        mtdExpenses: 18500.0,
        avgRating: 4.5,
      };
    }
  },

  // ✅ Tickets (NOW BACKEND-FIRST, WITH MOCK FALLBACK)

  getTickets: async (status = "all") => {
    try {
      const params = new URLSearchParams();
      if (status && status !== "all") {
        params.set("status", status);
      }
      const accountId = getStoredAccountId();
      if (accountId) {
        params.set("account_id", accountId);
      }
      const queryString = params.toString();
      const rows = await requestJson(
        `/api/requestor/tickets${queryString ? `?${queryString}` : ""}`,
      );
      return (rows ?? []).map(normalizeTicketSummary);
    } catch (err) {
      console.warn("getTickets backend failed, returning empty list:", err);
      return [];
    }
  },

  getTicket: async (id) => {
    try {
      const row = await requestJson(`/api/requestor/tickets/${encodeURIComponent(id)}`);
      return normalizeTicketDetail(row);
    } catch (err) {
      console.warn("getTicket backend failed:", err);
      return null;
    }
  },

  addWorklog: async (ticketId, payload) => {
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/worklogs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
  },

  updateWorklog: async (ticketId, worklogId, payload) => {
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/worklogs/${encodeURIComponent(worklogId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
  },

  getWorklogComments: async (ticketId, worklogId) => {
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/worklogs/${encodeURIComponent(worklogId)}/comments`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  },

  addWorklogComment: async (ticketId, worklogId, payload) => {
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/worklogs/${encodeURIComponent(worklogId)}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
  },

  createTicket: async (ticketData) => {
    const payload = { ...ticketData };
    const accountId = getStoredAccountId();
    if (accountId) {
      payload.account_id = accountId;
    }
    return requestJson("/api/requestor/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  createTask: async (ticketId, taskData) => {
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/tasks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      },
    );
  },

  updateTask: async (ticketId, taskId, taskData) => {
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      },
    );
  },

  deleteTask: async (ticketId, taskId) => {
    console.log('Starting delete request for task:', taskId);
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: "DELETE",
      },
    );
  },

  createChecklistItem: async (ticketId, itemData) => {
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/checklist`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      },
    );
  },

  updateChecklistItem: async (ticketId, itemId, completed) => {
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/checklist`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, completed }),
      },
    );
  },

  rateTicket: async (ticketId, rating, review) => {
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/rating`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comments: review }),
      },
    );
  },

  // Chat (still mock)
  getChatMessages: async (ticketId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (ticketId !== "TKT-2025-001") return [];
    return [
      {
        id: 1,
        sender: "Mark Johnson",
        text: "Hello! I've been assigned to your ticket. I'll check on this issue right away.",
        time: "09:15",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        text: "Thank you! I really need this fixed ASAP.",
        time: "09:17",
        isOwn: true,
      },
      {
        id: 3,
        sender: "Mark Johnson",
        text: "I understand. I'm heading to your location now. Should be there in 5 minutes.",
        time: "09:20",
        isOwn: false,
      },
    ];
  },

  sendMessage: async (ticketId, sender, text) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: Date.now(),
      sender: "You",
      text: text,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      isOwn: true,
    };
  },

  // Dropdown mocks (still mock)
  getServiceProviders: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [
      { id: "IT", name: "IT Support" },
      { id: "FAC", name: "Facilities" },
    ];
  },

  getIssueTypes: async (providerId) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (providerId === "IT") {
      return [
        { id: "NET", name: "Network Issue" },
        { id: "EQP", name: "Equipment" },
        { id: "SW", name: "Software" },
      ];
    } else if (providerId === "FAC") {
      return [
        { id: "HVAC", name: "HVAC" },
        { id: "FURN", name: "Furniture" },
        { id: "PLUMB", name: "Plumbing" },
      ];
    }
    return [];
  },

  // Notifications (still mock)
  getNotifications: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const params = new URLSearchParams();
    const accountId = getStoredAccountId();
    if (accountId) {
      params.set("account_id", accountId);
    }
    const queryString = params.toString();
    return requestJson(`/api/requestor/notifications${queryString ? `?${queryString}` : ""}`);
  },

  getNotificationCount: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const notifications = await API.getNotifications();
    return notifications.filter((n) => n.isNew).length;
  },

  markNotificationRead: async (notificationId) => {
    return requestJson(`/api/requestor/notifications/${notificationId}`, {
      method: "POST",
    });
  },

  toggleNotificationRead: async (notificationId) => {
    return requestJson(`/api/requestor/notifications/${notificationId}`, {
      method: "PATCH",
    });
  },

  deleteNotification: async (notificationId) => {
    return requestJson(`/api/requestor/notifications/${notificationId}`, {
      method: "DELETE",
    });
  },

  markAllNotificationsRead: async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { success: true };
  },

  updateTicketStatus: async (ticketId, status) => {
    return requestJson(
      `/api/requestor/tickets/${encodeURIComponent(ticketId)}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
  },

  getLocations: async (accountId) => {
    if (!accountId) {
      return { locations: [], default: null };
    }

    return requestJson("/api/requestor/locations");
  },

  // Service Configuration API endpoints
  getServiceProviders: async () => {
    try {
      const response = await requestJson("/api/service-config/providers");
      return response;
    } catch (err) {
      console.warn("getServiceProviders failed:", err);
      return { success: false, providers: [] };
    }
  },

  getServiceCategories: async (providerId) => {
    try {
      if (!providerId) {
        return { success: false, categories: [] };
      }
      const response = await requestJson(`/api/service-config/providers/${providerId}/categories`);
      return response;
    } catch (err) {
      console.warn("getServiceCategories failed:", err);
      return { success: false, categories: [] };
    }
  },

  getServiceTemplates: async (categoryId) => {
    try {
      if (!categoryId) {
        return { success: false, templates: [] };
      }
      const response = await requestJson(`/api/service-config/categories/${categoryId}/templates`);
      return response;
    } catch (err) {
      console.warn("getServiceTemplates failed:", err);
      return { success: false, templates: [] };
    }
  },

  getServiceTemplateDetail: async (templateId) => {
    try {
      if (!templateId) {
        return { success: false, template: null };
      }
      const response = await requestJson(`/api/service-config/templates/${encodeURIComponent(templateId)}`);
      return response;
    } catch (err) {
      console.warn("getServiceTemplateDetail failed:", err);
      return { success: false, template: null };
    }
  },
};

API.loginWithCredentials = API.login;

function getStoredAccountId() {
  if (!isBrowser) {
    return null;
  }
  let stored = window.localStorage.getItem("accountId");
  if (stored && stored !== "null") {
    return stored;
  }
  
  // Fallback: try to get account_id from stored user object
  try {
    const userStr = window.localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.account_id) {
        // Store it for future use
        window.localStorage.setItem("accountId", user.account_id);
        return user.account_id;
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }
  
  return null;
}

function normalizeTicketSummary(ticket = {}) {
  return ticket;
}

function normalizeTicketDetail(ticket = {}) {
  return ticket;
}

export default API;