import React from "react";

const getTimelineLabel = (evt) => {
    const action = (evt.action || "").toLowerCase().replace(/_/g, " ");
    const eventType = (evt.type || "").toLowerCase().replace(/_/g, " ");
    const message = (evt.message || "").toLowerCase().replace(/_/g, " ");

    // Direct action mappings - clean text without underscores
    if (action.includes("ticket created")) return "Ticket Created";
    if (action.includes("assigned")) return "Technician Assigned";
    if (action.includes("accepted")) return "Technician Accepted Your Ticket";
    if (action.includes("comment added") || action.includes("comment") && eventType.includes("comment")) return "Comment Added";
    if (action.includes("work started") || action.includes("started")) return "Work Started";
    if (action.includes("work complete") || action.includes("completed")) return "Work Completed";
    if (action.includes("ticket closed") || action.includes("closed")) return "Ticket Closed";
    if (action.includes("worklog") || action.includes("work recorded")) return "Work Recorded";
    if (action.includes("checklist")) return "Checklist Updated";
    if (action.includes("task")) return "Task Created";
    if (action.includes("resolved")) return "Ticket Resolved";
    if (action.includes("reopened")) return "Ticket Reopened";
    if (action.includes("reassigned")) return "Ticket Reassigned";
    if (action.includes("priority")) return "Priority Changed";
    if (action.includes("status") && action.includes("progress")) return "Work Started";
    
    // Fallback - clean text and capitalize properly
    if (message) {
        return message
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
    if (evt.action) {
        const cleanAction = evt.action.replace(/_/g, " ");
        return cleanAction
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
    
    return "Update";
};

const ActivityTimeline = ({ events }) => {
    const list = events || [];

    if (!list || list.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                <i className="fas fa-clock text-3xl text-gray-300 mb-2"></i>
                <p className="text-sm">No activity yet</p>
            </div>
        );
    }

    // Sort events - newest first
    const sorted = [...list].sort((a, b) => {
        const ta = new Date(a.timestamp || a.created_at || a.time || 0).getTime();
        const tb = new Date(b.timestamp || b.created_at || b.time || 0).getTime();
        if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
        if (Number.isNaN(ta)) return 1;
        if (Number.isNaN(tb)) return -1;
        return tb - ta;
    });

    const formatTime = (evt) => {
        if (evt.timestamp) {
            const date = new Date(evt.timestamp);
            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            }
        }
        if (evt.created_at) {
            const date = new Date(evt.created_at);
            if (!Number.isNaN(date.getTime())) {
                return date.toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
            }
        }
        if (evt.time) return evt.time;
        return null;
    };

    return (
        <div className="space-y-0">
            {sorted.map((evt, idx) => {
                const label = getTimelineLabel(evt);
                const isFirst = idx === 0;
                const timeStr = formatTime(evt);

                return (
                    <div key={evt.id || `timeline-${idx}`} className="flex gap-3 pb-5 relative">
                        {/* Vertical line */}
                        {idx < sorted.length - 1 && (
                            <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-300"></div>
                        )}

                        {/* Circle indicator - smaller */}
                        <div className="flex-shrink-0 pt-0.5">
                            {isFirst ? (
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center border-3 border-blue-100">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white"></div>
                            )}
                        </div>

                        {/* Text content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            {timeStr && (
                                <p className="text-xs text-gray-500 font-medium mb-1">
                                    {timeStr}
                                </p>
                            )}
                            <p className={`text-sm leading-relaxed ${isFirst ? "font-semibold text-gray-900" : "font-normal text-gray-700"}`}>
                                {label}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ActivityTimeline;
