// src/components/Tickets/TicketList.jsx
import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, getStatusClass, getStatusLabel } from '../../utils/helpers';

// Extracted Component: TicketCard
const TicketCard = ({ ticket, onSelect }) => {
    const statusClass = getStatusClass(ticket.status);
    const statusLabel = getStatusLabel(ticket.status);

    return (
        <div className="bg-white rounded-xl p-4 mb-3 shadow-md cursor-pointer transition active:translate-y-0.5 active:shadow-sm" onClick={() => onSelect(ticket.id)}>
            <div className="flex justify-between items-start mb-3">
                <div className="text-sm font-semibold text-blue-600">{ticket.id}</div>
                <div className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase ${statusClass}`}>{statusLabel}</div>
            </div>
            <div className="text-base font-semibold text-gray-800 mb-2">{ticket.title}</div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <i className="fas fa-tags"></i> {ticket.issueType}
                </div>
                <div className="flex items-center gap-1">
                    <i className="fas fa-map-marker-alt"></i> {ticket.location}
                </div>
                <div className="flex items-center gap-1">
                    <i className="fas fa-clock"></i> {formatDate(ticket.createdAt)}
                </div>
                {ticket.cost > 0 && (
                    <div className="flex items-center gap-1">
                        ₱{ticket.cost.toLocaleString('en-US')}
                    </div>
                )}
            </div>
        </div>
    );
};


const TicketList = ({ onSelectTicket, onNewTicket, refreshKey }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadTickets();
    }, [filter, refreshKey]);

    const toApiStatus = (uiStatus) => {
        // Map UI tab keys to whatever your backend expects
        const map = {
            'in-progress': 'in_progress',
            'on-hold': 'on_hold',
        };
        return map[uiStatus] || uiStatus;
    };

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await API.getTickets(toApiStatus(filter));
            setTickets(data);
        } catch (err) {
            console.error('Failed to load tickets', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const filters = ['all', 'new', 'assigned', 'in-progress', 'on-hold', 'completed'];

    return (
        <div className="px-5 py-4">
            <div className="mb-4 -mx-5 px-5 overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex gap-2 min-w-max">
                    {filters.map(f => (
                        <button
                            key={f}
                            className={`px-4 py-2 rounded-full text-sm border transition whitespace-nowrap ${
                                filter === f
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-200'
                            }`}
                            onClick={() => setFilter(f)}
                        >
                            {getStatusLabel(f)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pb-4">
                 <button 
                    className="w-full bg-blue-600 text-white py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98]"
                    onClick={onNewTicket}
                >
                    <i className="fas fa-plus-circle"></i> Create New Request
                </button>
            </div>

            {tickets.length === 0 ? (
                <div className="text-center py-14 px-4">
                    <div className="text-6xl text-gray-300 mb-4 opacity-70"><i className="fas fa-list-alt"></i></div>
                    <div className="text-lg text-gray-500 mb-1">No tickets found.</div>
                    <div className="text-sm text-gray-400">Try another filter or create a new ticket.</div>
                </div>
            ) : (
                tickets.map(ticket => (
                    <TicketCard 
                        key={ticket.id} 
                        ticket={ticket} 
                        onSelect={onSelectTicket} 
                    />
                ))
            )}
        </div>
    );
};

export default TicketList;