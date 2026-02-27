import React, { useState, useEffect } from 'react';
import API from '../api/api';

function timeAgo(isoString) {
    if (!isoString) return '';
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function getPerformanceLabel(pct) {
    if (pct >= 90) return 'Outstanding Work!';
    if (pct >= 75) return 'Good Job!';
    if (pct >= 50) return 'Keep it up!';
    return 'Needs Improvement';
}

function StatCard({ value, label, sub, loading }) {
    return (
        <div className="bg-white p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            <div className="text-[28px] font-bold mb-1 text-red-500">
                {loading ? <span className="text-gray-300 text-lg">—</span> : value}
            </div>
            <div className="font-medium text-gray-800">{label}</div>
            <div className="text-sm text-gray-500">{sub}</div>
        </div>
    );
}

function Stats({ tickets = [], currentUser }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.getStats().then(data => {
            setStats(data);
            setLoading(false);
        });
    }, []);

    // Fallback: derive basics from tickets prop if backend call fails
    const completedTickets = tickets.filter(t =>
        ['Resolved', 'Completed', 'Closed'].includes(t.status)
    );
    const fallbackCompleted = completedTickets.length;
    const fallbackTotal     = tickets.length;
    const fallbackPct       = fallbackTotal > 0 ? Math.round(fallbackCompleted / fallbackTotal * 100) : 0;

    const performance  = stats?.performance          ?? fallbackPct;
    const jobsThisMonth= stats?.jobsCompleted        ?? fallbackCompleted;
    const avgMinutes   = stats?.avgResolutionMinutes ?? 0;
    const avgRating    = stats?.avgRating            ?? 0;
    const recentActivity = stats?.recentActivity     ?? [];

    const performanceLabel = getPerformanceLabel(performance);

    return (
        <div className="pb-5 p-4">
            {/* Performance Hero */}
            <div className="bg-gradient-to-br from-red-600 to-red-500 text-white p-6 rounded-2xl mb-4 shadow-lg">
                <h1 className="text-2xl font-bold mb-2">Monthly Performance</h1>
                <p className="text-6xl font-bold">
                    {loading ? '—' : `${performance}%`}
                </p>
                <p className="pt-4 pb-2 text-white/90">{performanceLabel}</p>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4 pt-2">
                <StatCard
                    value={jobsThisMonth}
                    label="Jobs Completed"
                    sub="this month"
                    loading={loading}
                />
                <StatCard
                    value={avgMinutes > 0 ? avgMinutes : 'N/A'}
                    label="Avg. Time per Job"
                    sub="minutes"
                    loading={loading}
                />
                <StatCard
                    value={stats?.inProgress ?? tickets.filter(t => t.status === 'In Progress').length}
                    label="In Progress"
                    sub="active tickets"
                    loading={loading}
                />
                <StatCard
                    value={avgRating > 0 ? avgRating : 'N/A'}
                    label="Customer Rating"
                    sub="out of 5.0"
                    loading={loading}
                />
            </div>

            {/* Recent Activity */}
            <div className="p-6 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                <div className="font-semibold text-lg mb-6">Recent Activity</div>

                {loading && (
                    <div className="text-center text-gray-300 py-4">Loading...</div>
                )}

                {!loading && recentActivity.length === 0 && (
                    <div className="text-center text-gray-400 py-4 text-sm">No recent activity</div>
                )}

                {!loading && recentActivity.length > 0 && (
                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                        {recentActivity.map((item, i) => (
                            <div className="relative pl-8" key={item.id || i}>
                                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                                <div className="text-sm text-gray-400">{item.time || timeAgo(item.timestamp)}</div>
                                <div className="font-bold text-gray-800">{item.action}</div>
                                <div className="text-sm text-gray-500">
                                    {item.ticketId && <span className="font-medium">{item.ticketId} — </span>}
                                    {item.details}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Stats;