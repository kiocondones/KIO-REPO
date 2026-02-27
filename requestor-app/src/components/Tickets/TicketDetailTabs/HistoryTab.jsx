import React from "react";
import ActivityTimeline from "./ActivityTimeline";

const StatusPill = ({ status }) => {
  const s = (status || "").toLowerCase();
  const cls =
      s === "new" ? "bg-blue-600 text-white" :
          s === "assigned" ? "bg-yellow-100 text-yellow-700" :
              s === "in-progress" || s === "in_progress" ? "bg-blue-100 text-blue-700" :
              s === "completed" ? "bg-green-100 text-green-700" :
                  s === "closed" ? "bg-gray-200 text-gray-700" :
                      "bg-blue-600 text-white";

  const label =
      s === "new" ? "NEW" :
          s === "assigned" ? "ASSIGNED" :
              s === "in-progress" || s === "in_progress" ? "IN PROGRESS" :
              s === "completed" ? "COMPLETED" :
                  s === "closed" ? "CLOSED" :
                      (status ? status.toUpperCase() : "NEW");

  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
};

const HistoryTab = ({ ticket, renderTimeline, renderHistory }) => {
  return (
      <div className="bg-gray-50 min-h-screen pb-6">

        {/* Ticket header (ID, status, title, description) */}
        <div className="bg-white px-4 sm:px-5 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="text-blue-600 font-semibold text-sm break-words">{ticket?.id}</div>
            <StatusPill status={ticket?.status} />
          </div>

          <div className="mt-2 text-lg font-extrabold text-gray-900 break-words">
            {ticket?.title || "Untitled ticket"}
          </div>

          {ticket?.description && (
              <div className="mt-2 text-sm text-gray-600 leading-relaxed break-words">
                {ticket.description}
              </div>
          )}
        </div>

        {/* History section with yellow label */}
        <div className="px-4 sm:px-5 mt-6">
          <div className="inline-block bg-yellow-300 text-black text-xs font-bold px-3 py-1 rounded mb-4">
            History
          </div>

          <div className="mt-4">
            {/* We pass the history UI in to avoid coupling */}
            {renderHistory}
          </div>
        </div>

        {/* Activity Timeline section */}
        <div className="px-4 sm:px-5 mt-8">
          <div className="text-base font-bold text-gray-900 mb-4">Activity Timeline</div>
          <div>
            <ActivityTimeline events={ticket?.history || []} />
          </div>
        </div>
      </div>
  );
};

export default HistoryTab;
