// src/components/Dashboard/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

// Helpers
const formatPesoCompact = (n) => {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-PH", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

const formatPesoNoDecimals = (n) => {
  const num = Number(n || 0);
  return new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 0,
  }).format(num);
};

// Stat Card (tuned to Dash1)
const StatCard = ({ iconClass, iconBg, iconColor, value, label, onClick }) => {
  const clickable = typeof onClick === "function";

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      className={[
        "bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-start gap-2",
        clickable
          ? "cursor-pointer hover:shadow-md hover:border-blue-200 transition"
          : "",
      ].join(" ")}
    >
      <div className={`h-10 w-10 rounded-xl grid place-items-center ${iconBg}`}>
        <i className={`${iconClass} ${iconColor}`} />
      </div>
      <div className="text-2xl font-bold text-gray-900 leading-none">
        {value}
      </div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
    </div>
  );
};

const Dashboard = ({ user, onOpenTotalExpenses }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Announcement dropdown state
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const announceBtnRef = useRef(null);
  const announcePanelRef = useRef(null);

  // ✅ Reminder dropdown state
  const [showReminders, setShowReminders] = useState(false);
  const reminderBtnRef = useRef(null);
  const reminderPanelRef = useRef(null);

  // ✅ Get current date & time
  const now = new Date();

  const formattedTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDateTop = now.toLocaleDateString([], {
    month: "short",
    day: "2-digit",
  });

  const formattedDateBottom = now.getFullYear();

  const formattedTimeLabel = now.toLocaleDateString([], {
    weekday: "long",
  });

  // ✅ Announcements with real time
  const announcements = [
    {
      id: 1,
      title: "SUBMIT CLEAR REQUESTS",
      body: "Submitting clear and complete requests helps improve overall processing efficiency.",
      timeLabel: formattedTimeLabel,
      time: formattedTime,
    },
  ];

  // ✅ Reminders with real date
  const reminders = [
    {
      id: 1,
      dateTop: formattedDateTop,
      dateBottom: formattedDateBottom,
      title: "REQUEST IN PROGRESS",
      body: "Your request is now in progress and is being handled by the assigned technician. Please check the app for status updates.",
    },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  // ✅ Close dropdowns on outside click + Esc
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowAnnouncements(false);
        setShowReminders(false);
      }
    };

    const onMouseDown = (e) => {
      // If neither open, do nothing
      if (!showAnnouncements && !showReminders) return;

      const aBtn = announceBtnRef.current;
      const aPanel = announcePanelRef.current;
      const rBtn = reminderBtnRef.current;
      const rPanel = reminderPanelRef.current;

      // Click inside any button/panel → ignore
      if (aBtn && aBtn.contains(e.target)) return;
      if (aPanel && aPanel.contains(e.target)) return;
      if (rBtn && rBtn.contains(e.target)) return;
      if (rPanel && rPanel.contains(e.target)) return;

      // Otherwise close both
      setShowAnnouncements(false);
      setShowReminders(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [showAnnouncements, showReminders]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await API.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-lg mt-10 mx-4">
        <div className="text-5xl text-red-500 mb-4">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <div className="text-xl font-semibold text-gray-700">
          Failed to load data.
        </div>
      </div>
    );
  }

  const {
    openTickets = 0,
    inProgress = 0,
    completed = 0,
    totalSpent = 0,
    ytdExpenses = 0,
    mtdExpenses = 0,
  } = stats;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Welcome Back Section */}
      <div className="bg-blue-600">
        <div className="px-4 pt-4 pb-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs opacity-90">Welcome back,</div>
              <div className="text-2xl font-bold leading-tight">
                {user?.name || "User"}
              </div>
              <div className="text-[11px] opacity-80 mt-1">{today}</div>
            </div>

            {/* Action buttons - Reminders and Announcements only */}
            <div className="flex items-center gap-2">
              {/* ✅ Reminders button + dropdown */}
              <div className="relative">
                <button
                  ref={reminderBtnRef}
                  type="button"
                  className="h-10 w-10 rounded-full bg-white/15 grid place-items-center"
                  aria-label="Reminders"
                  aria-expanded={showReminders}
                  onClick={() => {
                    setShowReminders((v) => !v);
                    // optional: close announcements if opening reminders
                    setShowAnnouncements(false);
                  }}
                >
                  <i className="fas fa-exclamation-triangle" />
                </button>

                {showReminders && (
                  <div
                    ref={reminderPanelRef}
                    className="absolute right-0 mt-3 w-[320px] rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden z-50"
                  >
                    {reminders.map((r) => (
                      <div key={r.id} className="p-3">
                        <div className="flex gap-3">
                          {/* Left date column */}
                          <div className="w-14 text-center shrink-0">
                            <div className="text-[11px] text-gray-500">
                              {r.dateTop}
                            </div>
                            <div className="text-[11px] font-semibold text-gray-700">
                              {r.dateBottom}
                            </div>
                          </div>

                          {/* Reminder content card */}
                          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="flex items-start gap-2">
                              <div className="h-6 w-6 rounded-md bg-emerald-600 text-white grid place-items-center text-xs shrink-0">
                                <i className="fas fa-check" />
                              </div>

                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-gray-900">
                                  <span className="text-red-500">
                                    [REMINDER]
                                  </span>{" "}
                                  {r.title}
                                </div>
                                <div className="text-[11px] text-gray-600 mt-1 leading-snug">
                                  {r.body}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ✅ Announcement button + dropdown */}
              <div className="relative">
                <button
                  ref={announceBtnRef}
                  type="button"
                  className="h-10 w-10 rounded-full bg-white/15 grid place-items-center"
                  aria-label="Announcements"
                  aria-expanded={showAnnouncements}
                  onClick={() => {
                    setShowAnnouncements((v) => !v);
                    // optional: close reminders if opening announcements
                    setShowReminders(false);
                  }}
                >
                  <i className="fas fa-bullhorn" />
                </button>

                {showAnnouncements && (
                  <div
                    ref={announcePanelRef}
                    className="absolute right-0 mt-3 w-[320px] rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden z-50"
                  >
                    {announcements.map((a) => (
                      <div key={a.id} className="p-3">
                        <div className="flex gap-3">
                          {/* Left time column */}
                          <div className="w-14 text-center shrink-0">
                            <div className="text-[11px] text-gray-500">
                              {a.timeLabel}
                            </div>
                            <div className="text-[11px] font-semibold text-gray-700">
                              {a.time}
                            </div>
                          </div>

                          {/* Announcement content card */}
                          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="flex items-start gap-2">
                              <div className="h-6 w-6 rounded-md bg-blue-600 text-white grid place-items-center text-xs shrink-0">
                                <i className="fas fa-info" />
                              </div>

                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-gray-900">
                                  <span className="text-red-500">
                                    [ANNOUNCEMENT]
                                  </span>{" "}
                                  {a.title}
                                </div>
                                <div className="text-[11px] text-gray-600 mt-1 leading-snug">
                                  {a.body}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* ✅ end announcement */}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="-mt-3 px-4 pb-6 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            iconClass="fas fa-folder"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            value={openTickets}
            label="Open Tickets"
          />
          <StatCard
            iconClass="fas fa-clock"
            iconBg="bg-yellow-50"
            iconColor="text-yellow-600"
            value={inProgress}
            label="In Progress"
          />
          <StatCard
            iconClass="fas fa-check-circle"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            value={completed}
            label="Completed"
          />
          <StatCard
            iconClass="fas fa-flag"
            iconBg="bg-red-50"
            iconColor="text-red-500"
            value={`₱${formatPesoNoDecimals(totalSpent)}`}
            label="Total Spent"
            onClick={onOpenTotalExpenses}
          />
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
            <i className="fas fa-chart-line text-gray-700" />
            <span>Financial Summary</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">Year-to-Date (YTD)</div>
              <div className="font-semibold text-gray-900">
                ₱{formatPesoNoDecimals(ytdExpenses)}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">Month-to-Date (MTD)</div>
              <div className="font-semibold text-gray-900">
                ₱{formatPesoNoDecimals(mtdExpenses)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
