import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard";
import Tickets from "./components/Tickets";
import Stats from "./components/Stats";
import Notifications from "./components/Notifications";
import Profile from "./components/Profile";
import Reports from "./components/Reports";
import logo from "./assets/gcg_logo.png";

// 1. DEFINE API BASE URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

function App() {
  // --- State Management ---

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [createAccountModal, setCreateAccountModal] = useState(false);

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [accountForm, setAccountForm] = useState({ name: "", mail: "", contact_number: "", id_number: "", role: "", department: "",});

  // Data State (Replaces the old mockTickets constant)
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Navigation State
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Tickets Page State
  const [currentFilter, setCurrentFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Backend Integration Logic ---

  // Function to fetch all tickets from Backend
  const fetchTickets = async (tok = token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/technician/tickets`, {
        headers: {
          Authorization: `Bearer ${tok}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        console.error("Failed to fetch tickets", response.status);
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    }
  };

  // Auto-refresh tickets when navigating to dashboard or tickets page
  useEffect(() => {
    if (
      isLoggedIn &&
      (currentPage === "dashboard" || currentPage === "tickets")
    ) {
      fetchTickets();
    }
  }, [currentPage, isLoggedIn]);

  // Fetch unread notification count whenever logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchUnread = async () => {
      try {
        const { default: API } = await import("./api/api");
        const data = await API.getNotifications();
        setUnreadNotifications(data.unreadCount || 0);
      } catch (e) {
        console.error("fetchUnread:", e);
      }
    };
    fetchUnread();
  }, [isLoggedIn, currentPage]);

  // --- Authentication Logic (Offline/Simple for now) ---

  // --- Login ---
  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError("Email and password are required");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // ✅ safe JSON parse
      const text = await response.text();
      const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};

      // ✅ if unregistered, show error
      if (!response.ok) {
        setLoginError(data?.message || data?.error || "Invalid credentials");
        return;
      }

      // ✅ success
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        setToken(data.accessToken);

        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setCurrentUser(data.user);
        }

        setIsLoggedIn(true);
        setLoginError("");
        setCurrentPage("dashboard");

        fetchTickets(data.accessToken);
        return;
      }

      setLoginError("Invalid credentials");
    } catch (error) {
      console.error(error);
      setLoginError("Error connecting to server");
    }
  };

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      setIsLoggedIn(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
      setCurrentUser(null);
      setEmail("");
      setPassword("");
      setTickets([]);
      setIsMenuOpen(false);
      setSelectedTicket(null);
      setCurrentPage("dashboard");
    }
  };

  const handleCreateAccount = async () => {
    // simple required check
    if (
      !accountForm.name ||
      !accountForm.email ||
      !accountForm.contact_number ||
      !accountForm.id_number ||
      !accountForm.role ||
      !accountForm.department
    ) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/technician/account-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });

      const text = await response.text();
      const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};

      if (!response.ok) {
        alert(data?.message || data?.error || "Failed to submit request.");
        return;
      }

      alert(data?.message || "Request submitted. Please wait for admin verification.");
      setCreateAccountModal(false);

      // reset form
      setAccountForm({
        name: "",
        email: "",
        contact_number: "",
        id_number: "",
        role: "",
        department: "",
      });
    } catch (e) {
      console.error(e);
      alert("Error connecting to server.");
    }
  };

  // --- Navigation Logic ---

  const toggleMenu = (open) => {
    setIsMenuOpen((prev) => (open === undefined ? !prev : open));
  };

  const handleOpenTicket = async (ticketSummary) => {
    // 1. Optimistic update (show what we have immediately)
    setSelectedTicket(ticketSummary);
    setCurrentPage("ticket-detail");

    try {
      // 2. Fetch full details (History, Tasks, Logs) from Backend
      const response = await fetch(
        `${API_BASE_URL}/api/technician/tickets/${ticketSummary.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        // backend returns ONE merged object already
        setSelectedTicket(data);
      }
    } catch (error) {
      console.error("Error fetching ticket details:", error);
    }
  };

  const handleShowPage = (page, filter) => {
    setCurrentPage(page);
    setSelectedTicket(null);
    if (isMenuOpen) {
      toggleMenu(false);
    }
    if (page === "tickets") {
      if (filter) {
        setCurrentFilter(filter);
        setSearchQuery("");
      } else {
        setCurrentFilter("All");
        setSearchQuery("");
      }
    } else {
      setCurrentFilter("All");
      setSearchQuery("");
    }
  };

  // Utility function to get status counts
  const getStatusCounts = useCallback(() => {
    if (!tickets) return {};

    return {
      All: tickets.length,
      Assigned: tickets.filter((t) => t.status === "Assigned").length,
      "In Progress": tickets.filter((t) => t.status === "In Progress").length,
      "Pending Approval": tickets.filter((t) => t.status === "Pending Approval")
        .length,
      Resolved: tickets.filter((t) => t.status === "Resolved").length,
      Open: tickets.filter((t) => t.status === "Open").length,
    };
  }, [tickets]);

  // --- Render Functions (Switching Pages) ---

  const renderPageContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            mockTickets={tickets} // Passing real state
            handleShowPage={handleShowPage}
            handleOpenTicket={handleOpenTicket}
          />
        );
      case "tickets":
        return (
          <Tickets
            mockTickets={tickets} // Passing real state
            currentFilter={currentFilter}
            setCurrentFilter={setCurrentFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            getStatusCounts={getStatusCounts}
            handleOpenTicket={handleOpenTicket}
            ticket={selectedTicket}
            isSingleView={selectedTicket !== null}
            onBack={() => {
              setSelectedTicket(null);
              setCurrentPage("tickets");
            }}
          />
        );
      case "ticket-detail":
        return (
          <Tickets
            ticket={selectedTicket}
            isSingleView={true}
            onBack={() => {
              fetchTickets();
              setCurrentPage("dashboard");
            }} // Refresh on back
          />
        );
      case "stats":
        return <Stats />;
      case "notifications":
        return <Notifications />;
      case "profile":
        return <Profile currentUser={currentUser} />;
      case "reports":
        return <Reports mockTickets={tickets} />;
      default:
        return (
          <Dashboard mockTickets={tickets} handleShowPage={handleShowPage} />
        );
    }
  };

  const pageConfigs = {
    dashboard: { title: "Home" },
    notifications: { title: "Notifications" },
    tickets: { title: "Requests" },
    profile: { title: "Profile" },
    reports: { title: "Reports" },
    stats: { title: "Performance" },
  };

  // --- JSX Return ---

  return (
    <div
      className="max-w-[500px] mx-auto bg-white min-h-screen relative pb-[70px] container-main"
      id="app"
    >
      {/* Login Screen */}
      {!isLoggedIn && (
        <div
          className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-5"
          id="loginScreen"
        >
          <div className="w-full max-w-[400px]">
            <div className="flex justify-center items-center">
              <img 
                src={logo} 
                alt="GCG Logo" 
                className="bg-white rounded-full w-40 h-40 object-contain p-4"
              />
            </div>
            <div className="text-center text-white mb-2.5">
              <h1 className="text-[28px] font-bold mb-2">GCGC ServiceDesk</h1> {/* From "GCG" to GCGC */}
              <p className="text-white/90 text-sm">
                Technician Mobile Interface
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 mt-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              {/* Credentials changed to email and pass */}
              {/* Credentials Input */}
              <div>
                <h2 className="text-2xl mb-2">Welcome Back</h2>
                <p className="text-gray-500 mb-6">
                  Enter your credentials to login
                </p>

                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-6 h-6"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" 
                        />
                      </svg>
                    </div>
                    <input type="email" placeholder="email@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full py-3 px-4 pl-11 border border-gray-300 rounded-lg text-base"/>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="w-6 h-6"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" 
                        />
                      </svg>
                    </div>
                    <input type="password" placeholder="****************" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full py-3 px-4 pl-11 border border-gray-300 rounded-lg text-base"/>
                  </div>
                </div>

                <button
                  className="w-full py-3 px-6 border-none rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  onClick={handleLogin}
                >
                  Login
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  {/* OTP removed----------- You will receive a 6-digit code via SMS*/}
                </p>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    No account?{' '}
                    <span className="text-red-500 font-semibold cursor-pointer hover:underline" onClick={() => setCreateAccountModal(true)}>
                      Create Account
                    </span>
                  </p>
                </div>

              </div>
            </div>

            <div className="text-center text-white text-xs mt-6">
              © 2025 Global Comfort Group. All rights reserved.
            </div>
          </div>
        </div>
      )}

      {/* Main App (HEADER/MENU) */}
      {isLoggedIn && (
        <div id="mainApp">
          {/* Top Header */}
          <div className="bg-red-500 py-3 px-4 flex items-center justify-between sticky top-0 z-[100]">
            <div className="flex items-center gap-2">
              <button
                className="w-10 h-10 border-none bg-transparent rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200 relative hover:bg-gray-300"
                onClick={() => toggleMenu()}
              >
                <svg
                  className="w-6 h-6 stroke-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="font-bold text-base flex items-center gap-2">
                <p className="text-white">
                  {pageConfigs[currentPage]?.title || "Home"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-10 h-10 border-none bg-transparent rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-200 relative hover:bg-gray-300"
                onClick={() => handleShowPage("notifications")}
              >
                <svg
                  className="w-6 h-6 stroke-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span
                  className="absolute top-1 right-1 bg-gray-400 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-[9px] flex items-center justify-center px-1"
                  id="notifBadge"
                >
                  {unreadNotifications > 0 ? unreadNotifications : null}
                </span>
              </button>
            </div>
          </div>

          {/* Side Menu */}
          <div id="sideMenu" className={isMenuOpen ? "" : "hidden"}>
            <div className="fixed inset-0 z-[200] flex justify-center">
              <div
                className="fixed inset-0 bg-black/50 animate-fadeIn"
                onClick={() => toggleMenu(false)}
              ></div>
              <div className="relative w-full max-w-[500px] h-full">
                <div className="absolute left-0 top-0 bottom-0 w-80 bg-white z-[201] flex flex-col shadow-[2px_0_10px_rgba(0,0,0,0.1)] animate-slideInLeft">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                          <svg
                            className="w-8 h-8 stroke-red-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold mb-1">
                            {currentUser?.name || "Technician"}
                          </h3>
                          <p className="text-sm text-white/90">
                            {currentUser?.role || "Technician"}
                          </p>
                          <p className="text-xs mt-1">{currentUser?.department || ""}</p>
                        </div>
                      </div>
                      <button
                        className="w-8 h-8 bg-white/20 border-none rounded-lg flex items-center justify-center cursor-pointer"
                        onClick={() => toggleMenu(false)}
                      >
                        <svg
                          className="w-5 h-5 stroke-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4">
                    

                    {/* Dashboard */}
                    <button
                      className={`flex items-center gap-3 py-3 px-6 cursor-pointer transition-colors duration-200 border-none bg-transparent w-full text-left text-base hover:bg-gray-100 ${currentPage === "dashboard" ? "text-red-600" : "text-gray-700"}`}
                      onClick={() => handleShowPage("dashboard")}
                    >
                      <svg
                        className={`w-5 h-5 ${currentPage === "dashboard" ? "fill-red-600" : "fill-gray-500"}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                      </svg>
                      Dashboard
                    </button>

                    {/* Requests (My Tickets) */}
                    <button
                      className={`flex items-center gap-3 py-3 px-6 cursor-pointer transition-colors duration-200 border-none bg-transparent w-full text-left text-base hover:bg-gray-100 ${currentPage === "tickets" ? "text-red-600" : "text-gray-700"}`}
                      onClick={() => handleShowPage("tickets")}
                    >
                      <svg
                        className={`w-6 h-6 ${currentPage === "tickets" ? "fill-red-600" : "fill-gray-500"}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h7.17c-.11-.64-.17-1.31-.17-2s.06-1.36.17-2H6v-2h10v-1.17c.7-.35 1.44-.84 2-1.46V8l-6-6zm-1 7V3.5L18.5 9H13z" />
                        <path d="M18 12c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1.25 9L14.5 18.75l1.06-1.06 1.19 1.19 3.19-3.19 1.06 1.06L16.75 21z" />
                      </svg>
                      Requests
                    </button>

                    {/* Notifications */}
                    <button
                      className={`flex items-center gap-3 py-3 px-6 cursor-pointer transition-colors duration-200 border-none bg-transparent w-full text-left text-base hover:bg-gray-100 ${currentPage === "notifications" ? "text-red-600" : "text-gray-700"}`}
                      onClick={() => handleShowPage("notifications")}
                    >
                      <svg
                        className={`w-5 h-5 ${currentPage === "notifications" ? "fill-red-600" : "fill-gray-500"}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                      </svg>
                      Notifications
                      {unreadNotifications > 0 && (
                        <span className="ml-auto bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-[9px] flex items-center justify-center px-1">
                          {unreadNotifications}
                        </span>
                      )}
                    </button>

                    {/* Performance */}
                    <button
                      className={`flex items-center gap-3 py-3 px-6 cursor-pointer transition-colors duration-200 border-none bg-transparent w-full text-left text-base hover:bg-gray-100 ${currentPage === "stats" ? "text-red-600" : "text-gray-700"}`}
                      onClick={() => handleShowPage("stats")}
                    >
                      <svg
                        className={`w-5 h-5 ${currentPage === "stats" ? "fill-red-600" : "fill-gray-500"}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 9.2L11 5l5 4L22 4.2V7l-6 4.8-5-4-6 4.2V9.2zM2 19h2v-7H2v7zm4 0h2v-5H6v5zm4 0h2v-9h-2v9zm4 0h2v-12h-2v12zm4 0h2v-15h-2v15z" />
                      </svg>
                      Performance
                    </button>

                    {/* Reports */}
                    <button
                      className={`flex items-center gap-3 py-3 px-6 cursor-pointer transition-colors duration-200 border-none bg-transparent w-full text-left text-base hover:bg-gray-100 ${currentPage === "reports" ? "text-red-600" : "text-gray-700"}`}
                      onClick={() => handleShowPage("reports")}
                    >
                      <svg
                        className={`w-5 h-5 ${currentPage === "reports" ? "fill-red-600" : "fill-gray-500"}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                      </svg>
                      Reports
                    </button>

                    {/* Profile */}
                    <button
                      className={`flex items-center gap-3 py-3 px-6 cursor-pointer transition-colors duration-200 border-none bg-transparent w-full text-left text-base hover:bg-gray-100 ${currentPage === "profile" ? "text-red-600" : "text-gray-700"}`}
                      onClick={() => handleShowPage("profile")}
                    >
                      <svg
                        className={`w-5 h-5 ${currentPage === "profile" ? "fill-red-600" : "fill-gray-500"}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      Profile
                    </button>

                    <div className="h-px bg-gray-200 my-4"></div>

                    {/* Logout */}
                    <button
                      className="flex items-center gap-3 py-3 px-6 text-red-600 cursor-pointer transition-colors duration-200 border-none bg-transparent w-full text-left text-base hover:bg-gray-100"
                      onClick={logout}
                    >
                      <svg className="w-5 h-5 fill-red-600" viewBox="0 0 24 24">
                        <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.1 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                      </svg>
                      Logout
                    </button>
                  </div>

                  <div className="p-4 text-center border-t border-gray-200 text-xs text-gray-500">
                    <p>Version 1.0</p>
                    <p className="mt-1">© 2025 Simplevia Technologies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Page Content */}
          <div id="pageContent">{renderPageContent()}</div>
        </div>
      )}

      {createAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl border border-red-400 text-black w-full max-w-md">
            <h2 className="text-xl mb-4 font-bold">Create Account</h2>
            <p className="text-sm mb-4">
              Kindly fill out the form to create your account and an administrator will get back with you shortly.
            </p>

            <form
              className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
              onSubmit={async (e) => {
                e.preventDefault();

                // ✅ save form element right away (before any await)
                const formEl = e.currentTarget;

                const fd = new FormData(formEl);

                const payload = {
                  name: (fd.get("name") || "").toString().trim(),
                  email: (fd.get("email") || "").toString().trim(),
                  contact_number: (fd.get("contact_number") || "").toString().trim(),
                  id_number: (fd.get("id_number") || "").toString().trim(),
                  role: (fd.get("role") || "").toString().trim(),
                  department: (fd.get("department") || "").toString().trim(),
                };

                if (!payload.name || !payload.email || !payload.contact_number || !payload.id_number || !payload.role || !payload.department) {
                  alert("Please fill out all fields.");
                  return;
                }

                try {
                  const response = await fetch(`${API_BASE_URL}/api/technician/account-request`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  const text = await response.text();
                  const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};

                  if (!response.ok) {
                    alert(data?.message || data?.error || "Failed to submit request.");
                    return;
                  }

                  alert(data?.message || "Request submitted. Please wait for admin verification.");

                  // ✅ reset first while form still exists
                  formEl.reset();

                  // ✅ then close modal
                  setCreateAccountModal(false);

                } catch (err) {
                  console.error(err);
                  alert(err?.message || "Error connecting to the server.");
                }
              }}
            >
              <div>
                <p className="text-sm font-medium mb-1">Full Name</p>
                <input
                  name="name"
                  type="text"
                  placeholder="Juan Dela Cruz"
                  className="w-full p-2 border border-gray-400 rounded-md"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Email</p>
                <input
                  name="email"
                  type="email"
                  placeholder="email@email.com"
                  className="w-full p-2 border border-gray-400 rounded-md"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Contact Number</p>
                <input
                  name="contact_number"
                  type="tel"
                  placeholder="09999999999"
                  className="w-full p-2 border border-gray-400 rounded-md"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">ID Number</p>
                <input
                  name="id_number"
                  type="text"
                  placeholder="ID Number"
                  className="w-full p-2 border border-gray-400 rounded-md"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Role</p>
                <input
                  name="role"
                  type="text"
                  placeholder="Role"
                  className="w-full p-2 border border-gray-400 rounded-md"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Department</p>
                <input
                  name="department"
                  type="text"
                  placeholder="Department"
                  className="w-full p-2 border border-gray-400 rounded-md"
                />
              </div>

              <div className="flex justify-between items-center pt-6 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setCreateAccountModal(false)}
                  className="text-xs text-white hover:text-black p-3 bg-gray-400 rounded-md transition-colors"
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="bg-green-400 text-white text-xs p-3 rounded-md hover:bg-green-500 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;