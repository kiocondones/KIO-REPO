import { useState, useEffect } from "react";
import React from 'react';
import API from '../api/api';

const getBadgeClass = (type, value) => {
    const statusClasses = {
        'assigned': 'bg-red-100 text-red-800',
        'inprogress': 'bg-orange-100 text-orange-800',
        'progress': 'bg-orange-100 text-orange-800',
        'pending': 'bg-purple-100 text-purple-800',
        'pendingapproval': 'bg-purple-100 text-purple-800',
        'completed': 'bg-green-100 text-green-800',
        'resolved': 'bg-green-100 text-green-800'
    };
    const priorityClasses = {
        'critical': 'bg-red-600 text-white',
        'high': 'bg-orange-500 text-white',
        'medium': 'bg-yellow-500 text-white',
        'low': 'bg-green-600 text-white'
    };
    if (type === 'status') {
        return statusClasses[value.toLowerCase().replace(' ', '')] || 'bg-gray-100 text-gray-800';
    }
    return priorityClasses[value.toLowerCase()] || 'bg-gray-500 text-white';
};

const icons = {
    ANNOUNCEMENT: (
        <div className="bg-blue-100 p-2 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
            </svg>
        </div>
    ),
    REMINDER: (
        <div className="bg-gray-200 p-2 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
        </div>
    ),
    URGENT: (
        <div className="bg-red-100 p-2 rounded-full">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        </div>
    )
};

// Format today's date nicely
function formatToday() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function Dashboard({ mockTickets, handleShowPage, handleOpenTicket, currentUser }) {
    const [isOnDuty, setIsOnDuty] = useState(currentUser?.isOnDuty || false);
    const [dashStats, setDashStats] = useState(null);
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        // Fetch dashboard stats from backend
        API.getDashboard().then(data => {
            if (data && Object.keys(data).length > 0) setDashStats(data);
        });

        // Fetch announcements/reminders from notifications
        API.getNotifications().then(data => {
            if (!data?.notifications) return;
            // Show the 3 most recent unread as announcements
            const items = data.notifications
                .filter(n => !n.is_read)
                .slice(0, 3)
                .map(n => ({
                    title: n.type?.toUpperCase() || 'ANNOUNCEMENT',
                    message: n.description || n.title,
                }));
            if (items.length > 0) setAnnouncements(items);
        });
    }, []);

    // Derive counts from real ticket data (passed as prop from App.jsx)
    const newCount      = dashStats?.open       ?? mockTickets.filter(t => t.status === 'Open' || t.status === 'Assigned').length;
    const progressCount = dashStats?.in_progress ?? mockTickets.filter(t => t.status === 'In Progress').length;
    const resolvedCount = dashStats?.resolved    ?? mockTickets.filter(t => t.status === 'Resolved' || t.status === 'Completed').length;
    const urgentCount   = mockTickets.filter(t => (t.priority || '').toLowerCase() === 'critical').length;

    // Fallback announcements if nothing from backend
    const displayAnnouncements = announcements.length > 0 ? announcements : [
        { title: 'ANNOUNCEMENT', message: 'No new announcements at this time.' },
    ];

    const name = currentUser?.name || 'Technician';

    const handleDutyToggle = async () => {
        const newStatus = !isOnDuty;
        setIsOnDuty(newStatus);
        // Persist duty status to backend (UserService.patch)
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/user/duty', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (e) {
            console.error('duty toggle:', e);
        }
    };

    return (
        <div className="pb-5">
            <div className="bg-gradient-to-b from-red-500 to-red-700 text-white p-6 pb-16 mb-[-60px] relative z-10">
                <div className='flex items-center justify-between'>
                    <p className="text-lg">Hello,</p>
                    <p className="text-[13px] opacity-90">{formatToday()}</p>
                </div>

                <div className='flex items-end justify-between mt-1'>
                    <h1 className='text-3xl font-bold'>{name}</h1>

                    <div
                        onClick={handleDutyToggle}
                        className="flex items-center bg-black/20 rounded-full p-1 cursor-pointer select-none border border-white/10 backdrop-blur-sm relative"
                    >
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${isOnDuty ? 'bg-[#4ade80] shadow-md' : 'opacity-50'}`}>
                            <span className="text-[11px] font-bold text-white">On Duty</span>
                            {isOnDuty && (
                                <div className="bg-white rounded-full p-0.5 shadow-inner">
                                    <svg className="w-3.5 h-3.5 text-[#4ade80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${!isOnDuty ? 'bg-gray-500 shadow-md' : 'opacity-50'}`}>
                            {!isOnDuty && (
                                <div className="bg-white rounded-full p-0.5 shadow-inner">
                                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            )}
                            <span className="text-[11px] font-bold text-white">Off Duty</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="px-4 pt-5 relative z-20">
                <div className='flex justify-between gap-2 text-white'>

                    <div className="bg-gradient-to-tr from-blue-400 to-blue-700 rounded-3xl p-4 flex-1 aspect-square flex flex-col justify-between shadow-lg">
                        <div className="flex flex-col gap-1">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line>
                                <circle cx="3" cy="6" r="1" fill="currentColor"></circle><circle cx="3" cy="12" r="1" fill="currentColor"></circle><circle cx="3" cy="18" r="1" fill="currentColor"></circle>
                            </svg>
                            <span className="text-xs font-bold">New</span>
                        </div>
                        <span className="text-4xl font-bold self-end">{newCount}</span>
                    </div>

                    <div className="bg-gradient-to-tr from-orange-400 to-orange-600 rounded-3xl p-4 flex-1 aspect-square flex flex-col justify-between shadow-lg">
                        <div className="flex flex-col gap-1">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                                <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
                            </svg>
                            <span className="text-xs font-bold">In Progress</span>
                        </div>
                        <span className="text-4xl font-bold self-end">{progressCount}</span>
                    </div>

                    <div className="bg-gradient-to-tr from-green-400 to-green-600 rounded-3xl p-4 flex-1 aspect-square flex flex-col justify-between shadow-lg">
                        <div className="flex flex-col gap-1">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="16 9 11 14 8 11" stroke="currentColor" fill="none"></polyline>
                            </svg>
                            <span className="text-xs font-bold">Completed</span>
                        </div>
                        <span className="text-4xl font-bold self-end">{resolvedCount}</span>
                    </div>

                    <div className="bg-gradient-to-tr from-red-500 to-red-900 rounded-3xl p-4 flex-1 aspect-square flex flex-col justify-between shadow-lg">
                        <div className="flex flex-col gap-1">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13" strokeWidth="3"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3"></line>
                            </svg>
                            <span className="text-xs font-bold">Urgent</span>
                        </div>
                        <span className="text-4xl font-bold self-end">{urgentCount}</span>
                    </div>
                </div>
            </div>

            {/* Announcements */}
            <div className="px-4 py-4">
                <h3 className="text-lg font-bold">Announcement &amp; Reminders</h3>
                <hr className="mb-4"/>
                <div className="space-y-3">
                    {displayAnnouncements.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-md border border-gray-50">
                            <div className="flex-shrink-0">
                                {icons[item.title] || icons.ANNOUNCEMENT}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm leading-tight text-slate-800">
                                    <span className="font-bold uppercase tracking-tight">{item.title}: </span>
                                    {item.message}
                                </p>
                            </div>
                            {item.title !== 'ANNOUNCEMENT' && (
                                <button className="ml-2 px-3 py-1 bg-gray-200 text-gray-500 text-xs font-bold rounded shadow-sm">
                                    View
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Assignments */}
            <div className="px-4">
                <div className="flex justify-between items-center mb-4 pt-4">
                    <h3 className="text-lg font-bold">Pending Assignments</h3>
                    <span className="text-red-600 text-sm font-medium cursor-pointer" onClick={() => handleShowPage('tickets')}>View All</span>
                </div>

                {mockTickets.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <p className="font-medium">No tickets assigned yet</p>
                    </div>
                )}

                {mockTickets.slice(0, 5).map(ticket => (
                    <div className="bg-white p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] mb-3 cursor-pointer transition-transform duration-200 active:scale-[0.98]" key={ticket.id} onClick={() => handleOpenTicket(ticket)}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <div className="font-medium text-gray-500 text-sm">{ticket.number}</div>
                                <h4 className="font-bold text-base mb-2">{ticket.title}</h4>
                            </div>
                            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${getBadgeClass('priority', ticket.priority || 'low')}`}>{ticket.priority}</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-normal line-clamp-2">{ticket.description}</p>
                        <div className="flex gap-2 mt-3">
                            <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${getBadgeClass('status', ticket.status || 'open')}`}>{ticket.status}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                                <span>{ticket.location}</span>
                            </div>
                            <span className="text-gray-500 text-sm">{ticket.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;