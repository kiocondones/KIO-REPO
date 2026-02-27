import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const formatPesoNoDecimals = (n) => {
    const num = Number(n || 0);
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(num);
};

const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
};

const TotalExpenses = ({ onSelectTicket }) => {
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState([]);

    const [providerFilter, setProviderFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const rows = await API.getTickets("all");
                setTickets(rows || []);
            } catch (e) {
                console.error("Failed to load tickets for expenses:", e);
                setTickets([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const providers = useMemo(() => {
        const set = new Set();
        tickets.forEach((t) => t?.serviceProvider && set.add(t.serviceProvider));
        return Array.from(set).sort();
    }, [tickets]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const normalizeStatus = (s) => (s || "").toLowerCase().replace(/_/g, "-");
        const selectedStatus = normalizeStatus(statusFilter);

        return tickets.filter((t) => {
            const okProvider = providerFilter === "all" || t.serviceProvider === providerFilter;
            const okStatus = selectedStatus === "all" || normalizeStatus(t.status) === selectedStatus;

            const hay = `${t.id} ${t.title} ${t.issueType} ${t.serviceProvider} ${t.status}`.toLowerCase();
            const okSearch = !q || hay.includes(q);

            return okProvider && okStatus && okSearch;
        });
    }, [tickets, providerFilter, statusFilter, search]);

    const totalFilteredCost = useMemo(
        () => filtered.reduce((sum, t) => sum + Number(t?.cost || 0), 0),
        [filtered],
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="px-4 py-4 space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="text-sm font-semibold text-gray-900">Total Expenses</div>
                <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-gray-500">Current Filters Total</div>
                    <div className="text-lg font-extrabold text-blue-600">
                        {formatPesoNoDecimals(totalFilteredCost)}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <select
                        value={providerFilter}
                        onChange={(e) => setProviderFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Providers</option>
                        {providers.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="assigned">Assigned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tickets..."
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setProviderFilter("all");
                            setStatusFilter("all");
                            setSearch("");
                        }}
                        className="rounded-lg bg-blue-50 text-blue-700 px-3 py-2 text-sm font-semibold hover:bg-blue-100"
                    >
                        Reset
                    </button>
                </div>

                <div className="text-xs text-gray-500">
                    Showing <span className="font-semibold text-blue-600">{filtered.length}</span> of{" "}
                    <span className="font-semibold">{tickets.length}</span> records
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900">Tickets</div>
                    <div className="text-xs text-gray-500">
                        Sum: <span className="font-bold text-gray-900">{formatPesoNoDecimals(totalFilteredCost)}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold">Ticket</th>
                                <th className="px-4 py-3 text-left font-semibold">Provider</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-left font-semibold">Date</th>
                                <th className="px-4 py-3 text-right font-semibold">Cost</th>
                                <th className="px-4 py-3 text-right font-semibold">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-900">{t.id}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[260px]">
                                            {t.title || "-"}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 text-gray-700">{t.serviceProvider || "-"}</td>

                                    <td className="px-4 py-3">
                                        <span className="inline-flex rounded-full bg-blue-50 text-blue-700 px-2 py-1 text-xs font-semibold">
                                            {t.status || "-"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-gray-700">{formatDate(t.createdAt)}</td>

                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                        {formatPesoNoDecimals(t.cost || 0)}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <button
                                            className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700"
                                            onClick={() => onSelectTicket?.(t.id)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                                        No tickets found for the selected filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TotalExpenses;
