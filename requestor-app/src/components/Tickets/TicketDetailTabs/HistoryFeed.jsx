import React from "react";

const formatDate = (evt) => {
    const raw = evt.timestamp || evt.created_at || evt.time || "";
    if (!raw) return "";
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
        return d.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    }
    return raw;
};

const Badge = ({ children }) => (
    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-600 text-white">
        {children}
    </span>
);

const iconFor = (evt) => {
    const type = evt.type;
    const action = (evt.action || "").toLowerCase();

    // Check for various action keywords
    if (type === "status_change" || action.includes("status")) {
        return { icon: "fas fa-exchange-alt", bubble: "bg-blue-100 text-blue-700" };
    }
    if (type === "assignment" || action.includes("assign")) {
        return { icon: "fas fa-user-check", bubble: "bg-green-100 text-green-700" };
    }
    if (type === "priority_change" || action.includes("priority")) {
        return { icon: "fas fa-exclamation-triangle", bubble: "bg-yellow-100 text-yellow-700" };
    }
    if (type === "comment" || action.includes("comment")) {
        return { icon: "fas fa-comment-dots", bubble: "bg-indigo-100 text-indigo-700" };
    }
    if (type === "worklog" || action.includes("worklog") || action.includes("work")) {
        return { icon: "fas fa-clipboard-list", bubble: "bg-sky-100 text-sky-700" };
    }
    if (type === "checklist" || action.includes("check")) {
        return { icon: "fas fa-tasks", bubble: "bg-orange-100 text-orange-700" };
    }
    if (type === "task" || action.includes("task")) {
        return { icon: "fas fa-list-check", bubble: "bg-cyan-100 text-cyan-700" };
    }
    if (type === "created" || action.includes("created")) {
        return { icon: "fas fa-sparkles", bubble: "bg-purple-100 text-purple-700" };
    }
    if (action.includes("accepted")) {
        return { icon: "fas fa-thumbs-up", bubble: "bg-emerald-100 text-emerald-700" };
    }
    if (action.includes("started")) {
        return { icon: "fas fa-play", bubble: "bg-sky-100 text-sky-700" };
    }
    if (action.includes("complete")) {
        return { icon: "fas fa-check-circle", bubble: "bg-lime-100 text-lime-700" };
    }
    if (action.includes("closed")) {
        return { icon: "fas fa-lock", bubble: "bg-gray-200 text-gray-700" };
    }

    return { icon: "fas fa-receipt", bubble: "bg-gray-100 text-gray-700" };
};

const titleFor = (evt) => {
    const action = (evt.action || "").toLowerCase();

    if (evt.type === "status_change" && evt.from && evt.to) {
        return (
            <div className="flex flex-wrap items-center gap-2">
                <span>Status changed from</span>
                <Badge>{evt.from}</Badge>
                <span>to</span>
                <Badge>{evt.to}</Badge>
            </div>
        );
    }

    if (evt.type === "assignment" && evt.to) {
        return (
            <span>
                Request assigned to <span className="font-bold">{evt.to}</span>
            </span>
        );
    }

    if (evt.type === "priority_change" && evt.from && evt.to) {
        return (
            <div className="flex flex-wrap items-center gap-2">
                <span>Priority changed from</span>
                <Badge>{evt.from}</Badge>
                <span>to</span>
                <Badge>{evt.to}</Badge>
            </div>
        );
    }

    if (evt.type === "comment" || action.includes("comment")) return <span>Comment added</span>;
    if (evt.type === "worklog" || action.includes("worklog") || action.includes("work")) return <span>Worklog recorded</span>;
    if (evt.type === "checklist" || action.includes("checklist") || action.includes("check")) return <span>Checklist updated</span>;
    if (evt.type === "task" || action.includes("task added") || action.includes("task created")) return <span>Task created</span>;
    if (evt.type === "created" || action.includes("ticket created")) return <span>Ticket created</span>;

    // Use action or details for custom messages
    if (evt.action) return <span>{evt.action}</span>;
    if (evt.details) return <span>{evt.details}</span>;

    return <span>Update</span>;
};

const HistoryFeed = ({ events }) => {
    const list = events || [];

    if (!list || list.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                <i className="fas fa-history text-3xl text-gray-300 mb-2"></i>
                <p className="text-sm">No history yet</p>
            </div>
        );
    }

    // newest first if timestamps exist; otherwise keep order
    const sorted = [...list].sort((a, b) => {
        const ta = new Date(a.timestamp || a.created_at || a.time || 0).getTime();
        const tb = new Date(b.timestamp || b.created_at || b.time || 0).getTime();
        if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
        if (Number.isNaN(ta)) return 1;
        if (Number.isNaN(tb)) return -1;
        return tb - ta;
    });

    return (
        <div className="space-y-3">
            {sorted.map((evt, idx) => {
                const { icon, bubble } = iconFor(evt);
                const who = evt.actor || evt.user?.name || "System";
                const when = formatDate(evt);

                return (
                    <div
                        key={evt.id || `${idx}-${evt.action}`}
                        className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow"
                    >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bubble} flex-col justify-center`}>
                            <i className={`${icon} text-sm`}></i>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900">
                                {titleFor(evt)}
                            </div>

                            {(who || when) && (
                                <div className="text-xs text-gray-500 mt-1.5">
                                    {who}{when && <span> · {when}</span>}
                                </div>
                            )}

                            {evt.message && (
                                <div className="mt-2 text-sm text-gray-600 italic">
                                    "{evt.message}"
                                </div>
                            )}

                            {evt.details && !evt.message && (
                                <div className="mt-2 text-xs text-gray-600">
                                    {evt.details}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default HistoryFeed;
