// src/components/Layout/SideMenu.jsx
import React, { useEffect, useState } from "react";
import API from "../../services/api";

const MenuLink = ({
  icon,
  label,
  navId,
  currentActive,
  onClick,
  badgeCount,
}) => {
  const isActive = currentActive === navId;

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3 text-gray-800 text-base font-medium cursor-pointer transition relative ${
        isActive
          ? "bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500 pl-4"
          : "hover:bg-gray-100"
      }`}
      onClick={() => onClick(navId)}
    >
      <div className="w-6 text-center">
        <i className={icon}></i>
      </div>

      <span>{label}</span>

      {badgeCount > 0 && (
        <span className="absolute top-1/2 right-5 -translate-y-1/2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full min-w-[18px] text-center">
          {badgeCount}
        </span>
      )}
    </div>
  );
};

const SideMenu = ({
  user,
  navActive,
  onNavClick,
  onLogout,
  openTicketsCount,
}) => {
  const [openTickets, setOpenTickets] = useState(openTicketsCount || 0);

  useEffect(() => {
    const fetchOpenTickets = async () => {
      try {
        const stats = await API.getDashboardStats();
        // Count all tickets except completed and closed
        const totalTickets = stats?.total || 0;
        const completed = stats?.resolved || 0;
        const closed = stats?.closed || 0;
        const count = totalTickets - completed - closed;
        setOpenTickets(count);
      } catch (err) {
        console.error("Failed to load open tickets count:", err);
        setOpenTickets(0);
      }
    };

    if (navActive) {
      fetchOpenTickets();
    }
  }, [navActive]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[1000] transition ${
          navActive ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => onNavClick(null)}
      />

      <div
        className={`fixed top-0 left-0 h-screen w-[280px] max-w-[80%] bg-white z-[1001] shadow-xl transform transition-transform duration-300 flex flex-col ${
          navActive ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-blue-600 text-white px-5 py-6 flex flex-col items-start">
          <div className="w-[50px] h-[50px] rounded-full bg-white/30 text-white text-xl font-semibold flex items-center justify-center mb-2">
            {user.name?.[0]}
          </div>
          <div className="text-lg font-bold">{user.name}</div>
          <div className="text-xs text-white/80">
            {user.email || user.phone}
          </div>
        </div>

        <div className="flex-1 py-4">
          <MenuLink
            icon="fas fa-home"
            label="Dashboard"
            navId="dashboard"
            currentActive={navActive}
            onClick={onNavClick}
          />

          <MenuLink
            icon="fas fa-list-alt"
            label="Job Requests"
            navId="tickets"
            currentActive={navActive}
            onClick={onNavClick}
            badgeCount={openTickets}
          />

          <MenuLink
            icon="fas fa-plus-circle"
            label="New Request"
            navId="create-ticket"
            currentActive={navActive}
            onClick={onNavClick}
          />

          <MenuLink
            icon="fas fa-user"
            label="Profile"
            navId="profile"
            currentActive={navActive}
            onClick={onNavClick}
          />

          <div className="mt-auto">
            <div
              className="flex items-center gap-3 px-5 py-3 text-red-600 font-medium cursor-pointer hover:bg-red-50"
              onClick={onLogout}
            >
              <div className="w-6 text-center">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
