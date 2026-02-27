// src/components/Tickets/TicketDetail.jsx
import React, { useState, useEffect } from "react";
import API from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import { getStatusClass, getStatusLabel, formatDate } from "../../utils/helpers";
import RatingModal from "../common/RatingModal";
import HistoryTab from "./TicketDetailTabs/HistoryTab";
import HistoryFeed from "./TicketDetailTabs/HistoryFeed";
import WorklogsTab from "./TicketDetailTabs/WorklogsTab";
import WorklogFeed from "./TicketDetailTabs/WorklogFeed";
import ActivityTimeline from "./TicketDetailTabs/ActivityTimeline";

// Helper to convert UTC ISO string to local time
const convertUTCToLocal = (dateString) => {
  if (!dateString) return new Date();
  
  // If the string doesn't end with Z or have timezone info, assume it's UTC
  let isoString = dateString;
  if (!dateString.endsWith('Z') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
    isoString = dateString + 'Z'; // Assume UTC if no timezone info
  }
  
  return new Date(isoString);
};

// Sub-Component: Timeline
const Timeline = ({ timeline }) => {
  const timelineData = timeline || [];
  
  return (
    <div className="relative pl-6 space-y-5">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

      {timelineData.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <i className="fas fa-clock text-3xl text-gray-300 mb-2"></i>
          <p className="text-sm">No activity recorded</p>
        </div>
      ) : (
        timelineData.map((item, index) => {
          // Extract time text
          let timeText = "";
          if (item.time) {
            timeText = item.time;
          } else if (item.timestamp) {
            const d = new Date(item.timestamp);
            if (!Number.isNaN(d.getTime())) {
              timeText = d.toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });
            }
          }

          // Extract action text
          let actionText = item.action || "";
          if (!actionText) {
            if (item.type === "status_change") {
              actionText = `Status changed from ${item.from} to ${item.to}`;
            } else if (item.type === "assignment") {
              actionText = `Assigned to ${item.to}`;
            } else if (item.type === "priority_change") {
              actionText = `Priority changed from ${item.from} to ${item.to}`;
            } else if (item.type === "comment") {
              actionText = "Comment added";
            } else if (item.type === "worklog") {
              actionText = "Worklog recorded";
            } else if (item.type === "created") {
              actionText = "Ticket created";
            } else if (item.message) {
              actionText = item.message;
            }
          }

          return (
            <div key={item.id || `timeline-${index}`} className="relative flex items-start gap-3">
              {/* Circle indicator */}
              <span
                className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 ${
                  index === 0
                    ? "bg-blue-600 border-blue-600"
                    : "bg-white border-gray-300"
                }`}
              ></span>
              <div className="flex-1">
                {timeText && (
                  <div className="text-sm text-gray-600 font-medium">{timeText}</div>
                )}
                {actionText && (
                  <div className="text-sm text-gray-700">{actionText}</div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// Tab Button Component
const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
      active ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {label}
  </button>
);

const TicketDetail = ({ ticketId, onBack, onRateSuccess, onMenuToggle }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [isTask1Done, setIsTask1Done] = useState(false);
  const [isTask2Done, setIsTask2Done] = useState(false);
  const [isMenuClicked, setIsMenuClicked] = useState(false);

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState("");
  const [taskTypeError, setTaskTypeError] = useState("");

  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskFiles, setTaskFiles] = useState([]);

  const [checklistItems, setChecklistItems] = useState([]);
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);
  const [checklistForm, setChecklistForm] = useState({
    title: "",
    assignedTo: "",
    dueDate: "",
  });
  const [checklistError, setChecklistError] = useState("");

  const [taskMenuOpen, setTaskMenuOpen] = useState(null); // for 3-dots menu
  const [editingTask, setEditingTask] = useState(null); // for edit mode

  // Handler to open Add Task with pre-filled values for editing
  const handleEditTask = (task) => {
    setEditingTask(task);
    setSelectedTaskType(task.type || "");
    setSelectedProvider(task.provider || "");
    setSelectedService(task.service || "");
    setSelectedIssue(task.issue || "");
    setTaskDescription(task.description || task.title || "");
    setTaskFiles([]); // optional: reset attachments
    setIsAddingTask(true);
  };

  // Handler to delete task
  const handleDeleteTask = async (taskId) => {
    try {
      // Optimistically update UI
      setTicket((prev) => prev ? { ...prev, tasks: (prev.tasks || []).filter((t) => t.id !== taskId) } : prev);
      setTaskMenuOpen(null); // Close the menu
      await API.deleteTask(ticketId, taskId);
      // Optionally reload from backend for consistency
      loadTicket();
    } catch (err) {
      console.error("Failed to delete task", err);
      // Silently fail - task is already deleted from database
    }
  };

  const providerOptions = [
    "BIG - Business Intelligence Group",
    "IT Department",
    "Facilities Management",
  ];
  const issueOptions = ["Incident Request", "Service Request"];
  const serviceOptions = [
    "Feasibility Study Preparation",
    "Data Analysis",
    "Report Generation",
  ];

  const tabs = [
    { id: "details", label: "Details" },
    { id: "tasks", label: "Tasks" },
    { id: "checklist", label: "Checklist" },
    { id: "worklogs", label: "Worklogs" },
    { id: "history", label: "History" },
  ];

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const data = await API.getTicket(ticketId);
      setTicket(data);
      setChecklistItems(data.checklist || []);
    } catch (err) {
      console.error("Failed to load ticket", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (status) => {
    try {
      const result = await API.updateTicketStatus(ticketId, status);
      // Update the ticket state immediately with the response
      if (result && result.ticket) {
        setTicket(result.ticket);
      }
      // Then refresh from backend to ensure consistency
      await loadTicket();
      
      // Auto-open rating modal when status is changed to "completed"
      if (status === "completed") {
        setTimeout(() => {
          setShowRatingModal(true);
        }, 500);
      }
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  const handleOpenAddTask = () => {
    setIsAddingTask(true);
    setTaskTypeError("");
  };

  const handleCancelAddTask = () => {
    setIsAddingTask(false);
    setTaskTypeError("");
    setSelectedTaskType("");
    setSelectedProvider("");
    setSelectedService("");
    setSelectedIssue("");
    setTaskDescription("");
    setTaskFiles([]);
    setEditingTask(null); // reset editing state
  };

  const handleConfirmAddTask = async () => {
    if (!selectedTaskType) {
      setTaskTypeError("Please select a ticket type to continue.");
      return;
    }

    if (!selectedProvider) {
      setTaskTypeError("Please select a service provider.");
      return;
    }

    if (!selectedService) {
      setTaskTypeError("Please select a service.");
      return;
    }

    if (!selectedIssue) {
      setTaskTypeError("Please select an issue type.");
      return;
    }

    if (!taskDescription.trim()) {
      setTaskTypeError("Please enter a task description.");
      return;
    }

    const taskData = {
      type: selectedTaskType,
      provider: selectedProvider,
      service: selectedService,
      issue: selectedIssue,
      description: taskDescription.trim(),
      status: "pending",
    };

    try {
      if (editingTask) {
        // Update existing task
        await API.updateTask(ticketId, editingTask.id, taskData);
      } else {
        // Create new task
        await API.createTask(ticketId, taskData);
      }

      // Refresh the ticket to get the updated tasks from database
      await loadTicket();

      handleCancelAddTask();
    } catch (err) {
      console.error("Failed to save task", err);
      alert("Failed to save task. Please try again.");
    }
  };

  const handleOpenAddChecklistItem = () => {
    setIsAddingChecklistItem(true);
    setChecklistError("");
  };

  const handleCancelAddChecklistItem = () => {
    setIsAddingChecklistItem(false);
    setChecklistError("");
    setChecklistForm({
      title: "",
      assignedTo: "",
      dueDate: "",
    });
  };

  const handleConfirmAddChecklistItem = async () => {
    setChecklistError("");

    if (!checklistForm.title.trim()) {
      setChecklistError("Title is required.");
      return;
    }
    if (!checklistForm.assignedTo.trim()) {
      setChecklistError("Assigned to is required.");
      return;
    }
    if (!checklistForm.dueDate) {
      setChecklistError("Due date is required.");
      return;
    }

    try {
      const payload = {
        title: checklistForm.title.trim(),
        assignedTo: checklistForm.assignedTo.trim(),
        dueDate: checklistForm.dueDate,
      };

      await API.createChecklistItem(ticketId, payload);
      await loadTicket();
      handleCancelAddChecklistItem();
    } catch (err) {
      console.error("Failed to create checklist item", err);
      setChecklistError("Failed to save item.");
    }
  };

  const handleToggleChecklistItem = async (itemId, newCompleted) => {
    try {
      await API.updateChecklistItem(ticketId, itemId, newCompleted);
      setChecklistItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, completed: newCompleted } : item,
        ),
      );
    } catch (err) {
      console.error("Failed to update checklist item", err);
    }
  };

  const handleRatingSubmit = async (rating, review) => {
    await API.rateTicket(ticketId, rating, review);
    setShowRatingModal(false);
    onRateSuccess();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!ticket) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <div className="empty-text">Ticket not found.</div>
      </div>
    );
  }

  const statusClass = getStatusClass(ticket.status);
  const statusLabel = getStatusLabel(ticket.status);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="text-white hover:bg-blue-700 p-2 rounded-lg transition"
          >
            <i className="fas fa-bars text-lg"></i>
          </button>
          <div className="flex items-center gap-2">
            <i className="fas fa-envelope text-lg"></i>
            <span className="font-semibold text-lg">Job Requests</span>
          </div>
        </div>
        <button
          onClick={onBack}
          className="text-white hover:bg-blue-700 p-2 rounded-lg transition"
        >
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "details" && (
        <div className="bg-white">
          {/* Ticket Info Section */}
          <div className="px-5 py-5 border-b border-gray-200">
            {/* Ticket ID and Status */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-600 font-semibold text-base">
                {ticket.id}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusClass}`}
              >
                {statusLabel}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {ticket.title}
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {ticket.description}
            </p>
          </div>

          <div className="flex justify-center gap-2 flex-wrap mb-4 px-5">
            {[
              { key: "new", label: "New" },
              { key: "assigned", label: "Assigned" },
              { key: "in-progress", label: "In Progress" },
              { key: "on-hold", label: "On Hold" },
              { key: "completed", label: "Completed" },
            ].map((s) => {
              // Normalize both values for comparison
              const ticketStatusNormalized = (ticket.status || "").replace(/[_-]/g, "").toLowerCase();
              const statusKeyNormalized = s.key.replace(/[_-]/g, "").toLowerCase();
              const isActive = ticketStatusNormalized === statusKeyNormalized;

              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => handleChangeStatus(s.key)}
                  className={`px-3 py-2 rounded-lg text-sm border transition whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:border-blue-200"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Details Section */}
          <div className="px-5 py-5 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-4">Details</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Service Provider</span>
                <span className="text-sm font-medium text-gray-900">
                  {ticket.serviceProvider}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Issue Type</span>
                <span className="text-sm font-medium text-gray-900">
                  {ticket.issueType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Service Code</span>
                <span className="text-sm font-medium text-gray-900">
                  {ticket.serviceCode || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">SLA</span>
                <span className="text-sm font-medium text-gray-900">
                  {ticket.sla || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Priority</span>
                <span className="text-sm font-medium text-gray-900">
                  {ticket.priority
                    ? ticket.priority.charAt(0).toUpperCase() +
                      ticket.priority.slice(1)
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Location</span>
                <span className="text-sm font-medium text-gray-900">
                  {ticket.location}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Assigned To</span>
                <span className="text-sm font-medium text-gray-900">
                  {ticket.assignedTo || "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Created At</span>
                <span className="text-sm font-medium text-gray-900">
                  {ticket.createdAt ? convertUTCToLocal(ticket.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  }) : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Timeline Section */}
          <div className="px-5 py-5">
            <h3 className="text-base font-bold text-gray-900 mb-4">
              Activity Timeline
            </h3>
            <ActivityTimeline events={ticket.history || ticket.timeline || []} />
          </div>

          {/* Rating Section */}
          {ticket.status === "completed" && !ticket.rating && (
            <div className="px-5 pb-5">
              <button
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md transition active:scale-[0.99]"
                onClick={() => setShowRatingModal(true)}
              >
                <i className="fas fa-star"></i> Rate Service
              </button>
            </div>
          )}

          {ticket.rating && (
            <div className="px-5 pb-5">
              <div className="text-center text-green-600 font-medium">
                <i className="fas fa-check-circle"></i> You rated this{" "}
                {ticket.rating} stars.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab Content */}
      {activeTab === "tasks" && (
        <div className="bg-white min-h-[calc(100vh-140px)]">
          <div className="px-5 py-5 flex items-center justify-between border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900">Tasks</h3>

            {!isAddingTask ? (
              <button
                onClick={handleOpenAddTask}
                className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition"
              >
                + Create Task
              </button>
            ) : (
              <button
                onClick={handleCancelAddTask}
                className="text-gray-600 font-semibold text-sm hover:text-gray-800 transition"
              >
                Cancel
              </button>
            )}
          </div>

          {!isAddingTask && (
            <div className="px-5 py-5 space-y-3">
              {(ticket.tasks || []).length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <i className="fas fa-tasks text-4xl text-gray-300 mb-3"></i>
                  <p>No tasks yet</p>
                </div>
              ) : (
                (ticket.tasks || []).map((t) => (
                  <div
                    key={t.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative space-y-1"
                  >
                    {/* Three dots menu */}
                    <div className="absolute top-3 right-3">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setTaskMenuOpen((prev) =>
                              prev === t.id ? null : t.id,
                            )
                          }
                          className="p-2 rounded-full hover:bg-gray-200 transition"
                        >
                          <i className="fas fa-ellipsis-v text-gray-500"></i>
                        </button>
                        {taskMenuOpen === t.id && (
                          <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 rounded shadow-lg z-10">
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => handleEditTask(t)}
                            >
                              Edit
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => handleDeleteTask(t.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description as the title */}
                    <div className="font-semibold text-gray-900">
                      {t.description || t.title || "No Description"}
                    </div>

                    {/* Each attribute on a separate line */}
                    <div className="text-xs text-gray-500">
                      <strong>Provider:</strong> {t.provider || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Service:</strong> {t.service || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Issue:</strong> {t.issue || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Type:</strong> {t.type || "-"}
                    </div>
                    <div className="text-xs text-gray-500">
                      <strong>Status:</strong> {t.status || "pending"}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {isAddingTask && (
            /* Add/Edit Task Form (same as before) */
            <div className="px-5 py-6 space-y-5">
              <div className="text-base font-semibold text-gray-800">
                Select Ticket Type <span className="text-red-500">*</span>
              </div>

              {taskTypeError && (
                <div className="text-sm text-red-500 font-medium">
                  {taskTypeError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "incident",
                    title: "Incident Report",
                    desc: "Unexpected issues or emergencies",
                    icon: "fas fa-bell",
                  },
                  {
                    id: "service",
                    title: "Service Report",
                    desc: "Planned service requests",
                    icon: "fas fa-wrench",
                  },
                ].map((opt) => {
                  const isActive = selectedTaskType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedTaskType(opt.id);
                        setTaskTypeError("");
                      }}
                      className={`border rounded-2xl p-5 text-left transition ${
                        isActive
                          ? "border-blue-500 ring-2 ring-blue-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                          <i
                            className={`${opt.icon} text-xl text-gray-700`}
                          ></i>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {opt.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {/* Service Provider */}
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-700">
                    Service Provider <span className="text-red-500">*</span>
                  </div>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300"
                    value={selectedProvider}
                    onChange={(e) => {
                      setSelectedProvider(e.target.value);
                      setSelectedService("");
                    }}
                  >
                    <option value="">Select Service Provider</option>
                    {providerOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service */}
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-700">
                    Service <span className="text-red-500">*</span>
                  </div>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300"
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    <option value="">Select Service</option>
                    {serviceOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issue */}
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-700">
                    Issue / Item Type <span className="text-red-500">*</span>
                  </div>
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-300"
                    value={selectedIssue}
                    onChange={(e) => setSelectedIssue(e.target.value)}
                  >
                    <option value="">Select Issue / Item Type</option>
                    {issueOptions.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </div>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 min-h-[120px]"
                    placeholder="Provide detailed description of the request..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-700">
                    Attachments
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setTaskFiles(Array.from(e.target.files || []))
                    }
                  />
                  {taskFiles.length > 0 && (
                    <div className="space-y-2">
                      {taskFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700"
                        >
                          <span className="truncate">{file.name}</span>
                          <span className="text-gray-500 text-xs">
                            {Math.ceil(file.size / 1024)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-100 text-gray-800 font-semibold"
                    onClick={handleCancelAddTask}
                  >
                    Back
                  </button>
                  <button
                    className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold"
                    onClick={handleConfirmAddTask}
                  >
                    {editingTask ? "Update Task" : "Create Task"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checklist Tab Content */}
      {activeTab === "checklist" &&
        (() => {
          const checklist = checklistItems;

          const formatDueDate = (dateString) => {
            if (!dateString) return "-";
            const parsed = new Date(dateString);
            return parsed.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          };

          return (
            <>
              <div className="px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-blue-600">
                    {ticket.id}
                  </div>
                  {ticket.status === "new" && (
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      NEW
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-gray-900 mt-1">
                  {ticket.title}
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  {ticket.description}
                </p>
              </div>
              <div className="px-5 py-6 border-b-8 border-gray-100">
                <div className="flex items-center justify-between px-1 pb-4">
                  <div className="text-lg font-semibold text-gray-900">
                    Checklist
                  </div>
                  <button
                    onClick={handleOpenAddChecklistItem}
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm transition hover:bg-blue-700 active:translate-y-[1px]"
                  >
                    + Add Item
                  </button>
                </div>

                {checklist.length === 0 ? (
                  <div className="text-sm text-gray-600 leading-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    No checklist items available for this ticket.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {checklist.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className="w-full text-left"
                        onClick={() =>
                          handleToggleChecklistItem(item.id, !item.completed)
                        }
                      >
                        <div className="flex items-start gap-3 px-4 py-4 rounded-2xl bg-white border border-gray-200 shadow-[0_10px_22px_rgba(16,24,40,0.08)] hover:border-blue-200 hover:shadow-[0_12px_26px_rgba(59,130,246,0.18)] transition">
                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${item.completed ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-300"}`}
                          >
                            {item.completed && (
                              <i className="fas fa-check text-xs"></i>
                            )}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div
                              className={`text-[15px] font-semibold leading-6 ${item.completed ? "text-gray-500 line-through" : "text-gray-900"}`}
                            >
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500 flex flex-wrap gap-3">
                              <span>
                                Assigned to:{" "}
                                <span className="text-gray-700 font-medium">
                                  {item.assignedTo || "-"}
                                </span>
                              </span>
                              <span>
                                Due:{" "}
                                <span className="text-gray-700 font-medium">
                                  {formatDueDate(item.dueDate)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-5 pb-6 border-b-8 border-gray-100">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  Activity Timeline
                </div>
                <ActivityTimeline events={ticket.history || ticket.timeline || []} />
              </div>

              {isAddingChecklistItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                  <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
                    <h3 className="text-base font-bold text-gray-900 mb-4">
                      Add New Item
                    </h3>

                    {checklistError && (
                      <div className="mb-3 text-sm text-red-600 font-medium">
                        {checklistError}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={checklistForm.title}
                          onChange={(e) =>
                            setChecklistForm((p) => ({ ...p, title: e.target.value }))
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm"
                          placeholder="Enter title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Assigned to <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={checklistForm.assignedTo}
                          onChange={(e) =>
                            setChecklistForm((p) => ({ ...p, assignedTo: e.target.value }))
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm"
                          placeholder="Assigned to"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={checklistForm.dueDate}
                          onChange={(e) =>
                            setChecklistForm((p) => ({ ...p, dueDate: e.target.value }))
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleCancelAddChecklistItem}
                          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleConfirmAddChecklistItem}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                        >
                          Save Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}

      {/* Worklogs Tab Content */}
      {activeTab === "worklogs" && (
        <WorklogsTab
          ticket={ticket}
          onRefresh={loadTicket}
          renderWorklogs={<WorklogFeed worklogs={ticket.worklogs || []} ticketId={ticket.id} onRefresh={loadTicket} />}
          renderTimeline={<ActivityTimeline events={ticket.history || ticket.timeline || []} />}
        />
      )}

      {/* History Tab Content */}
      {activeTab === "history" && (
        <HistoryTab
          ticket={ticket}
          renderHistory={<HistoryFeed events={ticket.history || []} />}
          renderTimeline={<HistoryFeed events={ticket.history || []} />}
        />
      )}

      {showRatingModal && (
        <RatingModal
          ticket={ticket}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};

export default TicketDetail;
