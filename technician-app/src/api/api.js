// src/api/api.js

const BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000").replace(/\/+$/, "");

async function request(path, { method = "GET", body, headers, query } = {}) {
  const url = new URL(`${BASE}${path}`);

  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }

  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Try to parse JSON (even for error responses)
  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  return data;
}

function safeJson(text) {
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

const API = {
  // Dashboard
  getDashboard: () => request("/api/technician/dashboard").catch((e) => (console.error("getDashboard:", e), {})),

  // Tickets
  getTickets: (status) =>
    request("/api/technician/tickets", {
      query: status && status !== "All" ? { status } : {},
    }).catch((e) => (console.error("getTickets:", e), [])),

  getTicket: (ticketId) =>
    request(`/api/technician/tickets/${encodeURIComponent(ticketId)}`).catch((e) => (console.error("getTicket:", e), null)),

  // Used by Tickets.jsx for accept / resolve actions
  // action: "accept" | "resolve"
  // extra: optional object e.g. { resolution: "..." }
  updateTicketAction: (ticketId, action, extra = {}) =>
    request(`/api/technician/tickets/${encodeURIComponent(ticketId)}`, {
      method: "PUT",
      body: { action, ...extra },
    }).catch((e) => (console.error("updateTicketAction:", e), { success: false })),

  // Used by Tickets.jsx to save tasks + checklist together
  updateTicketItems: (ticketId, { tasks = [], checklist = [] }) =>
    Promise.all([
      tasks.length
        ? request(`/api/technician/tickets/${encodeURIComponent(ticketId)}/tasks`, {
            method: "PUT",
            body: { tasks },
          })
        : Promise.resolve({ success: true }),
      checklist.length
        ? request(`/api/technician/tickets/${encodeURIComponent(ticketId)}/checklist`, {
            method: "PUT",
            body: { checklist },
          })
        : Promise.resolve({ success: true }),
    ])
      .then(() => ({ success: true }))
      .catch((e) => (console.error("updateTicketItems:", e), { success: false })),

  // Worklogs
  addWorklog: (ticketId, message) =>
    request(`/api/technician/tickets/${encodeURIComponent(ticketId)}/worklogs`, {
      method: "POST",
      body: { message },
    }).catch((e) => (console.error("addWorklog:", e), { success: false })),

  // Notifications
  getNotifications: () =>
    request("/api/technician/notifications").catch((e) => (console.error("getNotifications:", e), { notifications: [], unreadCount: 0 })),

  markNotificationRead: (notifId) =>
    request(`/api/technician/notifications/${notifId}/read`, { method: "PATCH" })
      .catch((e) => (console.error("markNotificationRead:", e), { success: false })),
};

export default API;