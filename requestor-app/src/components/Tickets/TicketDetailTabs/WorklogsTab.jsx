import React, { useState } from "react";
import API from "../../../services/api";

const StatusPill = ({ status }) => {
    const s = (status || "").toLowerCase();
    const cls =
        s === "new"
            ? "bg-blue-600 text-white"
            : s === "assigned"
                ? "bg-yellow-100 text-yellow-700"
                : s === "completed"
                    ? "bg-green-100 text-green-700"
                    : s === "closed"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-blue-600 text-white";

    const label =
        s === "new"
            ? "NEW"
            : s === "assigned"
                ? "ASSIGNED"
                : s === "completed"
                    ? "COMPLETED"
                    : s === "closed"
                        ? "CLOSED"
                        : status
                            ? status.toUpperCase()
                            : "NEW";

    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
};

const WorklogsTab = ({ ticket, onRefresh, renderWorklogs, renderTimeline }) => {
    const [message, setMessage] = useState("");
    const [minutes, setMinutes] = useState("");

    const handleAddWorklog = async () => {
        if (!message.trim()) return;

        await API.addWorklog(ticket.id, {
            message,
            author: ticket.assignedTo || "Requester",
            minutes: Number(minutes) || 0,
        });

        setMessage("");
        setMinutes("");

        // reload ticket so the new DB row appears
        onRefresh?.();
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-6">
            {/* Ticket header */}
            <div className="bg-white px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="text-blue-600 font-semibold text-sm">{ticket?.id}</div>
                    <StatusPill status={ticket?.status} />
                </div>

                <div className="mt-2 text-lg font-extrabold text-gray-900">
                    {ticket?.title || "Untitled ticket"}
                </div>

                {ticket?.description && (
                    <div className="mt-2 text-sm text-gray-600 leading-relaxed">{ticket.description}</div>
                )}
            </div>

            {/* Add Worklog */}
            <div className="px-5 mt-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Add Worklog</div>

                    <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What work was done?"
                    />

                    <div className="flex gap-3 mt-3">
                        <input
                            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            value={minutes}
                            onChange={(e) => setMinutes(e.target.value)}
                            placeholder="Minutes"
                            inputMode="numeric"
                        />

                        <button
                            onClick={handleAddWorklog}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

            {/* Work Logs section */}
            <div className="px-5 mt-4">
                <div className="text-base font-bold text-gray-900">Work Logs</div>
                <div className="mt-3">{renderWorklogs}</div>
            </div>

            {/* Activity Timeline section */}
            <div className="px-5 mt-6">
                <div className="text-base font-bold text-gray-900">Activity Timeline</div>
                <div className="mt-3">{renderTimeline}</div>
            </div>
        </div>
    );
};

export default WorklogsTab;
