import { useState, useEffect } from 'react'
import logo from '../assets/GCG.png'

import {logout} from "../api/authApi.js"

const defaultStats = [
  { label: 'Active Requests', value: '6', icon: '📋' },
  { label: 'Tasks Due Today', value: '4', icon: '✅' },
  { label: 'Open Problems', value: '7', icon: '⚠️' },
  { label: 'Total Requests', value: '10', icon: '📥' }
]

function Header({ 
  collapsed, 
  stats = defaultStats,
  showStats = true,
  bgColor = 'bg-[#0f1d3d]'
}) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(true) 

  const handleLogout = async () => {
    setShowUserMenu(false);
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setName(user?.name || "");
    setRole(user?.role || "");

    setLoading(false);
  }, [])

  if(loading){
    return <div>Loading...</div>
  }

  return (
    <div className={`relative overflow-hidden ${bgColor} text-white shadow-lg transition-all duration-300 ${
    collapsed ? 'sidebar-collapsed-margin' : 'with-sidebar'
  }`}>
      <div className="absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true"></div>
      <div className={`max-w-7xl mx-auto px-4 ${showStats ? 'pt-5 pb-6' : 'pt-4 pb-4'} sm:px-6 lg:px-8 relative`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* <img src={logo} alt="Global Comfort Group" className="h-16" /> */}
            <div className="flex flex-col leading-tight">
              <p className="text-2xl font-semibold text-white">Global Comfort Group</p>
              <p className="text-white/80 text-md italic">IT Service Management Platform</p>
            </div>
          </div>
          <div className="relative">
            <div 
              className="flex items-center gap-3 bg-white/15 px-4 py-2 rounded-xl border border-white/30 cursor-pointer hover:bg-white/20 transition-all"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-blue-100 text-[#0f3285] text-sm font-bold flex items-center justify-center border border-white/50 relative">
                AD
                <span className="absolute -top-1 -right-1 bg-emerald-400 text-[#0b204c] text-[9px] font-bold px-1 py-0.5 rounded-full border-2 border-white">3</span>
              </div>
              <div>
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-xs text-white/80 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {role}
                </p>
              </div>
              <span className={`text-white/70 text-sm transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>▾</span>
            </div>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg overflow-hidden z-50">
                <button
                  className="w-full px-4 py-3 text-left text-sm font-semibold bg-white/15 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 flex items-center gap-2 transition-all rounded-xl"
                  onClick={handleLogout}
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {showStats && stats && stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
            {stats.map((card, index) => (
              <div
                key={card.label}
                className="bg-gradient-to-b from-[#1c44d7] to-[#1e4a97] rounded-xl p-3 flex items-center gap-3 shadow-md border border-white/15"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl border border-white/20">
                  {card.icon}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-white/80 font-semibold">{card.label}</p>
                  <p className="text-xl font-bold text-white">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Header
