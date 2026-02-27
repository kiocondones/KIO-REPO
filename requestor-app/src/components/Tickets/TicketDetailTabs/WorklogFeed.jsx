import React from "react";
import API from "../../../services/api";

const convertUTCToLocal = (dateString) => {
    if (!dateString) return new Date();
    
    // If the string doesn't end with Z or have timezone info, assume it's UTC
    let isoString = dateString;
    if (!dateString.endsWith('Z') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
        isoString = dateString + 'Z'; // Assume UTC if no timezone info
    }
    
    return new Date(isoString);
};

const formatDateTime = (isoOrDate) => {
    if (!isoOrDate) return "";
    const d = convertUTCToLocal(isoOrDate);
    if (Number.isNaN(d.getTime())) return String(isoOrDate);

    return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const WorklogFeed = ({ worklogs = [], ticketId, onRefresh }) => {
    if (!worklogs.length) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-3"></i>
                <p>No worklogs recorded</p>
            </div>
        );
    }

    const [editingId, setEditingId] = React.useState(null);
    const [editValue, setEditValue] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    
    // Comments state
    const [worklogComments, setWorklogComments] = React.useState({}); // { worklogId: [comments] }
    const [showCommentForm, setShowCommentForm] = React.useState(null); // worklogId or null
    const [commentText, setCommentText] = React.useState("");
    const [commentLoading, setCommentLoading] = React.useState(false);
    const [commentError, setCommentError] = React.useState("");

    const handleEditClick = (id, message) => {
        setEditingId(id);
        setEditValue(message || "");
        setError("");
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue("");
        setError("");
    };

    const handleSave = async (w) => {
        setLoading(true);
        setError("");
        try {
            await API.updateWorklog(ticketId, w.id, { message: editValue });
            setEditingId(null);
            setEditValue("");
            if (onRefresh) onRefresh();
        } catch (e) {
            setError(e.message || "Failed to update comment");
        } finally {
            setLoading(false);
        }
    };

    // Load comments for a worklog
    const loadComments = async (worklogId) => {
        try {
            const comments = await API.getWorklogComments(ticketId, worklogId);
            setWorklogComments((prev) => ({
                ...prev,
                [worklogId]: comments,
            }));
        } catch (e) {
            console.error("Failed to load comments:", e);
        }
    };

    // Toggle comment form visibility and load comments
    const toggleCommentForm = async (worklogId) => {
        if (showCommentForm === worklogId) {
            // Close the form
            setShowCommentForm(null);
            setCommentText("");
            setCommentError("");
        } else {
            // Open the form and load comments if not already loaded
            setShowCommentForm(worklogId);
            setCommentText("");
            setCommentError("");
            
            if (!worklogComments[worklogId]) {
                await loadComments(worklogId);
            }
        }
    };

    // Add a new comment
    const handleAddComment = async (worklogId) => {
        if (!commentText.trim()) {
            setCommentError("Comment cannot be empty");
            return;
        }

        setCommentLoading(true);
        setCommentError("");

        try {
            await API.addWorklogComment(ticketId, worklogId, {
                message: commentText,
                author: "Current User", // Replace with actual user from context if available
            });

            // Clear the form
            setCommentText("");
            
            // Reload comments
            await loadComments(worklogId);
        } catch (e) {
            setCommentError(e.message || "Failed to add comment");
        } finally {
            setCommentLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            {worklogs.map((w, idx) => (
                <div
                    key={w.id || idx}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold">
                                {(w.author || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {w.author || "Unknown"}
                                </div>
                                {w.role && <div className="text-xs text-gray-500">{w.role}</div>}
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDateTime(w.time)}
                        </div>
                    </div>

                    {w.title && (
                        <div className="mt-3 text-sm font-bold text-gray-900">{w.title}</div>
                    )}
                    {editingId === w.id ? (
                        <div className="mt-1">
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                rows={2}
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                disabled={loading}
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                                    onClick={() => handleSave(w)}
                                    disabled={loading || !editValue.trim()}
                                >
                                    {loading ? "Saving..." : "Save"}
                                </button>
                                <button
                                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-semibold"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >Cancel</button>
                            </div>
                            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
                        </div>
                    ) : (
                        w.message && (
                            <div className="mt-1 text-sm text-gray-600 leading-relaxed">
                                {w.message}
                            </div>
                        )
                    )}

                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                        {w.relativeTime && <span>{w.relativeTime}</span>}
                        <span
                            className="cursor-pointer hover:text-gray-600"
                            onClick={() => handleEditClick(w.id, w.message)}
                        >Edit</span>
                        <span
                            className="cursor-pointer hover:text-gray-600"
                            onClick={() => toggleCommentForm(w.id)}
                        >
                            {showCommentForm === w.id ? "Close" : "Comments"}
                        </span>
                    </div>

                    {/* Comments Section */}
                    {showCommentForm === w.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            {/* Existing Comments */}
                            <div className="mb-3 max-h-48 overflow-y-auto">
                                {worklogComments[w.id]?.length ? (
                                    <div className="space-y-2">
                                        {worklogComments[w.id].map((comment, cidx) => (
                                            <div
                                                key={comment.id || cidx}
                                                className="bg-gray-50 rounded-lg p-2 text-xs"
                                            >
                                                <div className="font-semibold text-gray-700">
                                                    {comment.author}
                                                    <span className="font-normal text-gray-500 ml-2">
                                                        {formatDateTime(comment.created_at)}
                                                    </span>
                                                </div>
                                                <div className="text-gray-600 mt-1">
                                                    {comment.message}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500 italic">No comments yet</div>
                                )}
                            </div>

                            {/* Add Comment Form */}
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                rows={2}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                disabled={commentLoading}
                            />

                            <div className="flex gap-2 mt-2">
                                <button
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                                    onClick={() => handleAddComment(w.id)}
                                    disabled={commentLoading || !commentText.trim()}
                                >
                                    {commentLoading ? "Posting..." : "Post Comment"}
                                </button>
                            </div>

                            {commentError && (
                                <div className="text-xs text-red-500 mt-2">{commentError}</div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default WorklogFeed;

