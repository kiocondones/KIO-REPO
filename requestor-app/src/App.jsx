// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import TicketList from './components/Tickets/TicketList';
import CreateTicket from './components/Tickets/CreateTicket';
import TicketDetail from './components/Tickets/TicketDetail';
import Notifications from './components/Notifications/Notifications';
import Toast from './components/common/Toast';
import SideMenu from './components/Layout/SideMenu';
import TotalExpenses from './components/Expenses/TotalExpenses';
import API from './services/api';


const App = () => {
    // Authentication State
    const [user, setUser] = useState(null);

    // Navigation State
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tickets', 'create-ticket', 'ticket-detail'
    const [selectedTicket, setSelectedTicket] = useState(null); // ID of the ticket being viewed
    const [sideMenuOpen, setSideMenuOpen] = useState(false);

    // UI/Utility State
    const [toast, setToast] = useState(null); // { message, type }
    const [openTicketsCount, setOpenTicketsCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [ticketListRefresh, setTicketListRefresh] = useState(0); // Force refresh ticket list

    // Load open tickets count for the badge
    const loadOpenTicketsCount = useCallback(async () => {
        try {
            const stats = await API.getDashboardStats();
            setOpenTicketsCount(stats.openTickets);
        } catch (err) {
            console.error('Failed to load stats for badge', err);
        }
    }, []);

    // Load notification count for the badge
    const loadNotificationCount = useCallback(async () => {
        try {
            const count = await API.getNotificationCount();
            setNotificationCount(count);
        } catch (err) {
            console.error('Failed to load notification count', err);
        }
    }, []);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            // Ensure accountId is stored if user object has it  
            if (userData && userData.account_id) {
                localStorage.setItem('accountId', userData.account_id);
            } else {
                // If no accountId found, clear it to avoid stale data
                localStorage.removeItem('accountId');
            }
            loadOpenTicketsCount();
            loadNotificationCount();
        }
    }, [loadOpenTicketsCount, loadNotificationCount]);

    // Refresh notification count when returning to dashboard
    useEffect(() => {
        if (currentView === 'dashboard') {
            loadNotificationCount();
        }
    }, [currentView, loadNotificationCount]);

    useEffect(() => {
        if (!user) {
            setNotificationCount(0);
            return;
        }
        loadNotificationCount();
    }, [loadNotificationCount, user]);

    // --- Authentication Handlers ---
    const handleLogin = (userData) => {
        setUser(userData);
        setCurrentView('dashboard');
        loadOpenTicketsCount();
        showToast('Login successful!', 'success');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('accountId');
        setUser(null);
        setSideMenuOpen(false);
        setNotificationCount(0);
        showToast('You have been logged out.', 'success');
    };

    // --- Navigation Handlers ---
    const handleNavClick = (view) => {
        if (view) {
            setCurrentView(view);
            setSelectedTicket(null);
        }
        setSideMenuOpen(false); // Close menu after click
    };

    const handleSelectTicket = (ticketId) => {
        setSelectedTicket(ticketId);
        setCurrentView('ticket-detail');
    };

    const handleTicketCreated = (newTicket) => {
        setCurrentView('tickets');
        showToast(`Ticket ${newTicket.id} created!`, 'success');
        loadOpenTicketsCount(); // Update badge
        setTicketListRefresh(prev => prev + 1); // Trigger reload of ticket list
    };
    
    // Function to handle the actual view logic change
    const getHeaderContent = () => {
        switch (currentView) {
            case 'tickets':
                return { title: 'Job Requests', icon: 'fas fa-list-alt', showMenu: true };
            case 'create-ticket':
                return { title: 'New Ticket', icon: 'fas fa-plus-circle', showMenu: false, showBack: true, backAction: () => setCurrentView('tickets') };
            case 'ticket-detail':
                return { title: selectedTicket, icon: 'fas fa-ticket-alt', showMenu: false, showBack: true, backAction: () => setCurrentView('tickets') };
            case 'notifications':
                return { title: 'Notifications', icon: 'fas fa-bell', showMenu: false, showBack: true, backAction: () => setCurrentView('dashboard') };
            case 'profile':
                 return { title: 'My Profile', icon: 'fas fa-user', showMenu: true };
            case 'total-expenses':
                return { title: 'Total Expenses', icon: 'fas fa-flag', showMenu: false, showBack: true, backAction: () => setCurrentView('dashboard') };
            case 'dashboard':
            default:
                return { title: 'Dashboard', icon: 'fas fa-home', showMenu: true };
        }
    };

    // --- UI/Utility Handlers ---
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    const header = getHeaderContent();

    return (
        <div className="max-w-[480px] mx-auto bg-white min-h-screen relative overflow-x-hidden shadow-2xl">
            {/* Header Component Logic - Hidden for ticket-detail and notifications as they have their own headers */}
            {currentView !== 'ticket-detail' && currentView !== 'notifications' && (
                <header className="bg-blue-600 text-white px-5 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
                    {header.showMenu && (
                         <button className="bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 active:bg-white/30 text-base relative" onClick={() => setSideMenuOpen(true)}>
                            <i className="fas fa-bars"></i>
                        </button>
                    )}
                     {header.showBack && (
                         <button className="bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 active:bg-white/30 text-base" onClick={header.backAction}>
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    )}
                    
                    <div className="text-lg font-semibold flex items-center gap-2">
                        <i className={header.icon}></i> {header.title}
                    </div>
                    
                    <div className="flex gap-3">
                        {header.title === 'Dashboard' && (
                            <button className="bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95 active:bg-white/30 text-base relative" onClick={() => handleNavClick('notifications')}>
                                <i className="fas fa-bell"></i>
                                {notificationCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">{notificationCount}</span>}
                            </button>
                        )}
                    </div>
                </header>
            )}

            {/* Side Menu Component */}
             <SideMenu 
                user={user} 
                navActive={sideMenuOpen ? currentView : null}
                onNavClick={handleNavClick}
                onLogout={handleLogout}
                openTicketsCount={openTicketsCount}
            />

            {/* Content Router */}
            <div className="pb-5 min-h-[calc(100vh-60px)] bg-gray-50">
                {currentView === 'total-expenses' && (
                    <TotalExpenses onSelectTicket={handleSelectTicket} />
                )}
                {currentView === 'dashboard' && (
                    <Dashboard
                        user={user}
                        onOpenTotalExpenses={() => setCurrentView('total-expenses')}
                    />
                )}
                {currentView === 'tickets' && (
                    <TicketList 
                        onSelectTicket={handleSelectTicket} 
                        onNewTicket={() => setCurrentView('create-ticket')}
                        refreshKey={ticketListRefresh}
                    />
                )}
                {currentView === 'create-ticket' && (
                    <CreateTicket 
                        onBack={() => setCurrentView('tickets')} 
                        onSubmit={handleTicketCreated} 
                    />
                )}
                {currentView === 'ticket-detail' && selectedTicket && (
                    <TicketDetail 
                        ticketId={selectedTicket} 
                        onBack={() => setCurrentView('tickets')} 
                        user={user} //added for user info
                        onRateSuccess={() => { loadOpenTicketsCount(); handleSelectTicket(selectedTicket); }}
                        onMenuToggle={() => setSideMenuOpen(true)}
                    />
                )}
                {currentView === 'notifications' && (
                    <Notifications 
                        onBack={() => setCurrentView('dashboard')}
                        onMenuToggle={() => setSideMenuOpen(true)}
                        onSelectTicket={(ticketId) => {
                            loadNotificationCount();
                            handleSelectTicket(ticketId);
                        }}
                        onNotificationCountChange={loadNotificationCount}
                    />
                )}
                {/* Profile View */}
                {currentView === 'profile' && (
                    <div className="min-h-screen bg-gray-50 pb-6">
                        {/* Profile Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-8">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold mb-4 border-4 border-white/30">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
                                <p className="text-blue-100 text-sm">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</p>
                            </div>
                        </div>

                        {/* Profile Information Card */}
                        <div className="px-5 -mt-4">
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                        <i className="fas fa-info-circle text-blue-600"></i>
                                        Profile Information
                                    </h2>
                                </div>
                                
                                <div className="px-5 py-4 space-y-4">
                                    <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <i className="fas fa-user text-blue-600"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</div>
                                            <div className="text-base font-semibold text-gray-800">{user.name}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <i className="fas fa-envelope text-green-600"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email Address</div>
                                            <div className="text-base font-semibold text-gray-800 break-all">{user.email || 'Not provided'}</div>
                                        </div>
                                    </div>

                                    {user.phone && (
                                        <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                <i className="fas fa-phone text-purple-600"></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone Number</div>
                                                <div className="text-base font-semibold text-gray-800">{user.phone}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                            <i className="fas fa-building text-orange-600"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Department</div>
                                            <div className="text-base font-semibold text-gray-800">{user.department || 'Not assigned'}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                            <i className="fas fa-id-badge text-indigo-600"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">User ID</div>
                                            <div className="text-base font-semibold text-gray-800">#{user.id || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default App;