import React, { useEffect, useRef, useState } from "react";
import API from '../api/api';

const tabs = ["Details", "Resolution", "Tasks", "Checklist", "Worklogs", "History"];

const STATUS_FILTERS = ["All", "Open", "Assigned", "In Progress", "Pending Approval", "Completed", "Resolved"];

const statusColors = {
  Assigned:          "bg-red-100 text-red-800",
  "In Progress":     "bg-orange-100 text-orange-800",
  "Pending Approval":"bg-purple-100 text-purple-800",
  Completed:         "bg-green-100 text-green-800",
  Resolved:          "bg-green-100 text-green-800",
  New:               "bg-blue-100 text-blue-800",
  Open:              "bg-blue-100 text-blue-800",
  "On Hold":         "bg-gray-100 text-gray-800",
  Closed:            "bg-gray-200 text-gray-600",
};

const priorityColors = {
  Critical: "bg-red-600 text-white",
  High:     "bg-orange-500 text-white",
  Medium:   "bg-yellow-500 text-white",
  Low:      "bg-green-600 text-white",
};

// History action → emoji icon + bg colour
const historyIcon = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("assign"))   return { icon: "👤", bg: "bg-blue-50" };
  if (a.includes("start") || a.includes("accept") || a.includes("work")) return { icon: "▶️", bg: "bg-orange-50" };
  if (a.includes("resolv"))   return { icon: "✅", bg: "bg-green-50" };
  if (a.includes("close"))    return { icon: "🔒", bg: "bg-gray-100" };
  if (a.includes("task"))     return { icon: "☑️", bg: "bg-purple-50" };
  if (a.includes("checklist"))return { icon: "📋", bg: "bg-purple-50" };
  if (a.includes("worklog") || a.includes("log")) return { icon: "📝", bg: "bg-yellow-50" };
  if (a.includes("pause") || a.includes("hold")) return { icon: "⏸️", bg: "bg-gray-100" };
  if (a.includes("creat"))    return { icon: "🎫", bg: "bg-blue-50" };
  return { icon: "📌", bg: "bg-gray-50" };
};

// Relative time from ISO string
function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-800 text-right ml-4">{value || "—"}</span>
  </div>
);

const Timeline = ({ timeline }) => (
  <div className="relative pt-5">
    <div className="text-lg font-semibold text-gray-800 mb-3">Activity Timeline</div>
    <div className="space-y-4">
      {(timeline || []).map((item, index) => {
        const isLast = index === timeline.length - 1;
        const text = item.action === "Resolved" ? "Ticket resolved." : item.details;
        return (
          <div key={item.id || index} className="relative pl-14 pb-4 last:pb-0">
            {!isLast && <span className="absolute left-[15.3px] top-6 h-full w-[3px] bg-blue-200" />}
            <span className="absolute left-[1px] top-[-1px] flex h-8 w-8 items-center justify-center">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-[3px] border-blue-600 bg-white shadow-[0_0_0_6px_rgba(37,99,235,0.12)]">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
              </span>
            </span>
            {item.time && <div className="text-[12px] font-semibold text-gray-400 mb-0.5">{item.time}</div>}
            <div className="text-sm font-semibold text-gray-900">{text}</div>
          </div>
        );
      })}
    </div>
  </div>
);

function Tickets({ isSingleView, onBack, searchQuery = "" }) {
  const [tickets, setTickets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab]       = useState("Details");
  const [showStartConfirm, setShowStartConfirm] = useState(false);

  const [localTasks, setLocalTasks]         = useState([]);
  const [localChecklist, setLocalChecklist] = useState([]);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const [showWorkLogForm, setShowWorkLogForm] = useState(false);
  const [workLogMessage, setWorkLogMessage]   = useState("");
  const [savingLog, setSavingLog]             = useState(false);

  const [resolutionText, setResolutionText] = useState("");

  // ── fetch list ─────────────────────────────────────────────────────────
  const fetchTickets = async () => {
    setLoading(true);
    const data = await API.getTickets();
    setTickets(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  // ── reset local state when ticket changes ───────────────────────────────
  useEffect(() => {
    if (selectedTicket) {
      setLocalTasks(selectedTicket.tasks || []);
      setLocalChecklist(selectedTicket.checklist || []);
      setShowStartConfirm(false);
      setShowWorkLogForm(false);
      setHasPendingChanges(false);
      setWorkLogMessage("");
      setResolutionText(
        selectedTicket.resolution?.[0]?.description || ""
      );
    }
  }, [selectedTicket?.id]);

  // ── filter ──────────────────────────────────────────────────────────────
  const filteredTickets = tickets.filter((t) => {
    const matchStatus =
      statusFilter === "All" ||
      (t.status || "").toLowerCase() === statusFilter.toLowerCase();
    const matchSearch =
      !searchQuery ||
      (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.id || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── derived flags ───────────────────────────────────────────────────────
  const isTicketStarted = selectedTicket &&
    ["In Progress", "Resolved", "Completed", "Closed"].includes(selectedTicket.status);
  const isTicketLocked = selectedTicket &&
    ["Resolved", "Closed", "Completed"].includes(selectedTicket.status);

  const statusLabel = selectedTicket?.status || "New";
  const statusClass = statusColors[statusLabel] || "bg-gray-100 text-gray-700";

  // ── handlers ───────────────────────────────────────────────────────────
  const handleAcceptTicket = async () => {
    setShowStartConfirm(false);
    const result = await API.updateTicketAction(selectedTicket.id, "accept");
    if (result?.success !== false) {
      const updated = await API.getTicket(selectedTicket.id);
      if (updated) setSelectedTicket(updated);
      fetchTickets();
    }
  };

  const handleSubmitResolution = async () => {
    if (!resolutionText.trim()) return alert("Please enter resolution details.");
    const result = await API.updateTicketAction(selectedTicket.id, "resolve", { resolution: resolutionText });
    if (result?.success !== false) {
      alert("Ticket resolved!");
      fetchTickets();
      setSelectedTicket(null);
      if (onBack) onBack();
    }
  };

  const handleSaveWorklog = async () => {
    if (!workLogMessage.trim()) return alert("Please enter a message.");
    setSavingLog(true);
    const result = await API.addWorklog(selectedTicket.id, workLogMessage);
    setSavingLog(false);
    if (result?.success !== false) {
      setWorkLogMessage("");
      setShowWorkLogForm(false);
      // Refresh ticket detail to show new worklog
      const updated = await API.getTicket(selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } else {
      alert("Failed to save worklog.");
    }
  };

  const handleSaveItems = async () => {
    const result = await API.updateTicketItems(selectedTicket.id, {
      tasks:     localTasks.map((t) => ({ id: t.id, isCompleted: !!t.isCompleted })),
      checklist: localChecklist.map((c) => ({ id: c.id, isCompleted: !!c.isCompleted })),
    });
    if (result?.success !== false) {
      setHasPendingChanges(false);
      // Refresh
      const updated = await API.getTicket(selectedTicket.id);
      if (updated) setSelectedTicket(updated);
      fetchTickets();
    } else {
      alert("Save failed.");
    }
  };

  const toggleTask = (id) => {
    if (isTicketLocked) return;
    setLocalTasks((p) => p.map((t) => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
    setHasPendingChanges(true);
  };

  const toggleChecklist = (id) => {
    if (isTicketLocked) return;
    setLocalChecklist((p) => p.map((c) => c.id === id ? { ...c, isCompleted: !c.isCompleted } : c));
    setHasPendingChanges(true);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (!selectedTicket) {
    return (
      <div className="min-h-screen bg-white text-gray-900 pb-6">
        {/* Header + Filter */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">My Tickets</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
            </p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white shadow-sm"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="text-center py-16 text-gray-400">Loading tickets...</div>
        )}

        {!loading && filteredTickets.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium text-lg">No tickets found</p>
            <p className="text-sm mt-1">Try a different filter</p>
          </div>
        )}

        <div className="px-4 pt-2 space-y-3">
          {filteredTickets.map((ticket) => {
            const sClass = statusColors[ticket.status] || "bg-gray-100 text-gray-700";
            const pClass = priorityColors[ticket.priority] || "bg-gray-500 text-white";
            return (
              <div
                key={ticket.id}
                onClick={async () => {
                  const full = await API.getTicket(ticket.id);
                  setSelectedTicket(full || ticket);
                  setActiveTab("Details");
                }}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="text-red-700 font-semibold text-sm">{ticket.id}</div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${sClass}`}>
                    {ticket.status}
                  </span>
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">{ticket.title}</h2>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{ticket.description}</p>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  {ticket.location && (
                    <span className="flex items-center gap-1 text-gray-500">📍 {ticket.location}</span>
                  )}
                  {ticket.time && (
                    <span className="flex items-center gap-1 text-gray-500">⏰ {ticket.time}</span>
                  )}
                  {ticket.priority && (
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${pClass}`}>
                      {ticket.priority}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  const attachments = selectedTicket.attachments || [];
  const mainHistory = (selectedTicket.history || []).filter(
    (h) => !["Task Accomplished", "Checklist Completed"].includes(h.action)
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-28">
      {/* Back button */}
      <div className="px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        <button
          onClick={() => { setSelectedTicket(null); if (onBack) onBack(); }}
          className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-700"
        >
          ← Back to List
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition
              ${activeTab === tab ? "bg-red-600 text-white shadow" : "bg-gray-100 text-gray-600"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-5">
        {/* Ticket header — always visible */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-red-700 font-semibold">{selectedTicket.id}</div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 leading-snug mb-2">
            {selectedTicket.title}
          </h1>
          <p className="text-gray-600 leading-relaxed text-sm">{selectedTicket.description}</p>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-600 mb-2">Attachments</div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {attachments.map((url, idx) => (
                <div key={idx} className="min-w-[120px] h-[90px] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <img src={url} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DETAILS ── */}
        {activeTab === "Details" && (
          <div>
            <DetailRow label="Ticket ID"  value={selectedTicket.id} />
            <DetailRow label="Status"     value={selectedTicket.status} />
            <DetailRow label="Priority"   value={selectedTicket.priority} />
            <DetailRow label="Type"       value={selectedTicket.ticket_type || selectedTicket.ticketType} />
            <DetailRow label="Location"   value={selectedTicket.location} />
            <DetailRow label="Requester"  value={selectedTicket.requester} />
            <DetailRow label="Reported"   value={selectedTicket.time} />
            <Timeline timeline={mainHistory} />
          </div>
        )}

        {/* ── RESOLUTION ── */}
        {activeTab === "Resolution" && (
          <div>
            {/* Show existing resolutions */}
            {(selectedTicket.resolution || []).length > 0 && (
              <div className="mb-4 space-y-3">
                {selectedTicket.resolution.map((r, i) => (
                  <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{r.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{r.created_at ? timeAgo(r.created_at) : ""}</p>
                  </div>
                ))}
              </div>
            )}
            {!isTicketLocked && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {(selectedTicket.resolution || []).length > 0 ? "Update Resolution" : "Write Resolution"}
                </label>
                <textarea
                  placeholder="Describe what was done to resolve this ticket..."
                  className="w-full h-40 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none resize-none text-sm"
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                />
              </>
            )}
            <Timeline timeline={mainHistory} />
          </div>
        )}

        {/* ── TASKS ── */}
        {activeTab === "Tasks" && (
          <div className="space-y-3">
            <div className="text-lg font-semibold text-gray-800">
              Tasks
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({localTasks.filter(t => t.isCompleted).length}/{localTasks.length} done)
              </span>
            </div>
            {localTasks.length === 0 && (
              <div className="text-gray-400 text-sm py-4 text-center">No tasks assigned.</div>
            )}
            {localTasks.map((task) => (
              <label
                key={task.id}
                className={`flex items-start gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm cursor-pointer
                  ${task.isCompleted ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200"}`}
              >
                <input
                  type="checkbox"
                  disabled={isTicketLocked}
                  className="mt-1 h-5 w-5 accent-blue-600 rounded"
                  checked={task.isCompleted || false}
                  onChange={() => toggleTask(task.id)}
                />
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${task.isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-xs text-gray-500 mt-0.5">{task.description}</div>
                  )}
                </div>
              </label>
            ))}
            <Timeline timeline={mainHistory} />
          </div>
        )}

        {/* ── CHECKLIST ── */}
        {activeTab === "Checklist" && (
          <div className="space-y-3">
            <div className="text-lg font-semibold text-gray-800">
              Checklist
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({localChecklist.filter(c => c.isCompleted).length}/{localChecklist.length} done)
              </span>
            </div>
            {localChecklist.length === 0 && (
              <div className="text-gray-400 text-sm py-4 text-center">No checklist items.</div>
            )}
            {localChecklist.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm cursor-pointer
                  ${item.isCompleted ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200"}`}
              >
                <input
                  type="checkbox"
                  disabled={isTicketLocked}
                  className="h-5 w-5 accent-blue-600 rounded"
                  checked={item.isCompleted || false}
                  onChange={() => toggleChecklist(item.id)}
                />
                <span className={`text-sm font-medium ${item.isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}>
                  {item.title}
                </span>
              </label>
            ))}
            <Timeline timeline={mainHistory} />
          </div>
        )}

        {/* ── WORKLOGS ── */}
        {activeTab === "Worklogs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-800">Work Logs</div>
              {!isTicketLocked && !showWorkLogForm && (
                <button
                  onClick={() => setShowWorkLogForm(true)}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
                >
                  + Add Log
                </button>
              )}
            </div>

            {showWorkLogForm && (
              <div className="rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3 bg-gray-50">
                <div className="text-sm font-semibold text-gray-700">New Work Log</div>
                <textarea
                  placeholder="Describe what you did..."
                  className="w-full h-28 rounded-xl border border-gray-300 px-3 py-2 text-sm resize-none outline-none"
                  value={workLogMessage}
                  onChange={(e) => setWorkLogMessage(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowWorkLogForm(false); setWorkLogMessage(""); }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveWorklog}
                    disabled={savingLog}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    {savingLog ? "Saving..." : "Save Log"}
                  </button>
                </div>
              </div>
            )}

            {(selectedTicket.worklogs || []).length === 0 && !showWorkLogForm && (
              <div className="text-gray-400 text-sm py-4 text-center">No work logs yet.</div>
            )}

            {(selectedTicket.worklogs || []).map((log, i) => (
              <div key={log.id || i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-semibold text-sm text-gray-800">{log.title || "Work Log"}</div>
                  <span className="text-xs text-gray-400">{log.created_at ? timeAgo(log.created_at) : ""}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{log.description}</p>
                {log.author && (
                  <p className="text-xs text-gray-400 mt-2">By {log.author}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === "History" && (
          <div className="space-y-3">
            <div className="text-lg font-semibold text-gray-800">History</div>
            {(selectedTicket.history || []).length === 0 && (
              <div className="text-gray-400 text-sm py-4 text-center">No history yet.</div>
            )}
            {(selectedTicket.history || []).map((item, i) => {
              const { icon, bg } = historyIcon(item.action);
              return (
                <div key={item.id || i} className="flex gap-3 border border-gray-100 p-4 rounded-2xl shadow-sm bg-white">
                  <div className={`h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-full text-xl ${bg}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{item.action}</div>
                    {item.details && (
                      <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.details}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {item.actor || item.user || ""}{item.time ? ` · ${item.time}` : ""}
                      {item.created_at && !item.time ? ` · ${timeAgo(item.created_at)}` : ""}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FIXED BOTTOM BUTTONS ── */}

      {/* Start ticket */}
      {!isTicketStarted && activeTab === "Details" && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-5 pt-2 bg-white border-t border-gray-100">
          <button
            className="w-full h-14 rounded-xl bg-blue-600 text-white font-semibold text-base shadow"
            onClick={() => setShowStartConfirm(true)}
          >
            Start Ticket
          </button>
        </div>
      )}

      {/* Save tasks / checklist */}
      {isTicketStarted && !isTicketLocked && (activeTab === "Tasks" || activeTab === "Checklist") && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-5 pt-2 bg-white border-t border-gray-100">
          <button
            className="w-full h-14 rounded-xl bg-blue-600 text-white font-semibold text-base shadow disabled:bg-gray-300 disabled:text-gray-500 transition"
            disabled={!hasPendingChanges}
            onClick={handleSaveItems}
          >
            {hasPendingChanges ? "Save Changes" : "No Changes"}
          </button>
        </div>
      )}

      {/* Submit resolution */}
      {isTicketStarted && !isTicketLocked && activeTab === "Resolution" && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 pb-5 pt-2 bg-white border-t border-gray-100">
          <button
            className="w-full h-14 rounded-xl bg-green-600 text-white font-semibold text-base shadow"
            onClick={handleSubmitResolution}
          >
            Submit Resolution & Close
          </button>
        </div>
      )}

      {/* Confirm accept modal */}
      {showStartConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowStartConfirm(false)} />
          <div className="relative w-[320px] bg-white rounded-2xl shadow-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Accept Ticket?</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              This will mark the ticket as <strong>In Progress</strong> and notify the requester.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 h-12 rounded-xl bg-gray-200 text-gray-600 font-semibold"
                onClick={() => setShowStartConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 h-12 rounded-xl bg-blue-600 text-white font-semibold shadow"
                onClick={handleAcceptTicket}
              >
                Accept & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;