import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/GCG.png'

function Sidebar({ collapsed, onNavigate }) {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleNavigate = (module, path) => {
    if (onNavigate) {
      onNavigate(module)
    } else {
      navigate(path)
    }
  }

  return (
    <div 
      className={`sidebar fixed left-0 top-0 h-screen bg-[#0f1d3d] pt-5 z-[900] transition-all duration-300 overflow-y-auto overflow-x-hidden ${collapsed ? 'w-[60px]' : 'w-[250px]'}`}
    >
      <nav>
        <div className={`flex items-center justify-center mb-4 transition-all duration-300 ${collapsed ? 'px-2' : 'px-4 py-3 mx-3'}`}>
          <img src={logo} alt="Logo" className={`rounded-lg transition-all duration-300 ${collapsed ? 'w-10 h-10 object-contain' : 'max-w-[170px] h-auto'}`} />
        </div>
        
        <div 
          className={`flex items-center gap-3 px-5 py-2 text-sm font-medium cursor-pointer border-l-[3px] transition-all ${collapsed ? 'justify-center px-0' : ''} ${
            isActive('/dashboard') 
              ? 'text-white border-l-cyan-400 bg-white/[0.12]' 
              : 'text-gray-200 border-transparent hover:bg-white/10 hover:text-white hover:border-l-cyan-400'
          }`}
          onClick={() => handleNavigate('dashboard', '/dashboard')}
          title="Dashboard"
        >
          <span className="text-lg w-6 text-center flex-shrink-0">📈</span>
          {!collapsed && <span>Dashboard</span>}
        </div>

        <div className={`h-px bg-white/[0.15] my-1.5 transition-all duration-300 ${collapsed ? 'mx-3' : 'mx-4'}`}></div>

        <div 
          className={`flex items-center gap-3 px-5 py-2 text-sm font-medium cursor-pointer border-l-[3px] transition-all ${collapsed ? 'justify-center px-0' : ''} ${
            isActive('/servicedesk') 
              ? 'text-white border-l-cyan-400 bg-white/[0.12]' 
              : 'text-gray-200 border-transparent hover:bg-white/10 hover:text-white hover:border-l-cyan-400'
          }`}
          onClick={() => handleNavigate('myview', '/servicedesk')}
          title="My View"
        >
          <span className="text-lg w-6 text-center flex-shrink-0">👁️</span>
          {!collapsed && <span>My View</span>}
        </div>

        <div className={`h-px bg-white/[0.15] my-1.5 transition-all duration-300 ${collapsed ? 'mx-3' : 'mx-4'}`}></div>

        <div 
          className={`flex items-center gap-3 px-5 py-2 text-sm font-medium cursor-pointer border-l-[3px] transition-all ${collapsed ? 'justify-center px-0' : ''} ${
            isActive('/requests') 
              ? 'text-white border-l-cyan-400 bg-white/[0.12]' 
              : 'text-gray-200 border-transparent hover:bg-white/10 hover:text-white hover:border-l-cyan-400'
          }`}
          onClick={() => handleNavigate('requests', '/requests')}
          title="Requests"
        >
          <span className="text-lg w-6 text-center flex-shrink-0 relative">
            📋
            {collapsed && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">5</span>}
          </span>
          {!collapsed && <span>Requests</span>}
          {!collapsed && <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">5</span>}
        </div>

        <div className={`h-px bg-white/[0.15] my-1.5 transition-all duration-300 ${collapsed ? 'mx-3' : 'mx-4'}`}></div>

        <div 
          className={`flex items-center gap-3 px-5 py-2 text-sm font-medium cursor-pointer border-l-[3px] transition-all ${collapsed ? 'justify-center px-0' : ''} ${
            isActive('/ticket-intake') 
              ? 'text-white border-l-cyan-400 bg-white/[0.12]' 
              : 'text-gray-200 border-transparent hover:bg-white/10 hover:text-white hover:border-l-cyan-400'
          }`}
          onClick={() => handleNavigate('intake', '/ticket-intake')}
          title="Service Configuration"
        >
          <span className="text-lg w-6 text-center flex-shrink-0">🛠️</span>
          {!collapsed && <span>Service Configuration</span>}
        </div>

        {/* <div className={`h-px bg-white/[0.15] my-1.5 transition-all duration-300 ${collapsed ? 'mx-3' : 'mx-4'}`}></div>

        <div 
          className={`flex items-center gap-3 px-5 py-2 text-sm font-medium cursor-pointer border-l-[3px] transition-all ${collapsed ? 'justify-center px-0' : ''} ${
            isActive('/analytics') 
              ? 'text-white border-l-cyan-400 bg-white/[0.12]' 
              : 'text-gray-200 border-transparent hover:bg-white/10 hover:text-white hover:border-l-cyan-400'
          }`}
          onClick={() => handleNavigate('analytics', '/analytics')} 
          title="Analytics"
        >
          <span className="text-lg w-6 text-center flex-shrink-0">📊</span>
          {!collapsed && <span>Analytics</span>}
        </div> */}

        <div className={`h-px bg-white/[0.15] my-1.5 transition-all duration-300 ${collapsed ? 'mx-3' : 'mx-4'}`}></div>

        <div 
          className={`flex items-center gap-3 px-5 py-2 text-sm font-medium cursor-pointer border-l-[3px] transition-all ${collapsed ? 'justify-center px-0' : ''} ${
            isActive('/section-e') 
              ? 'text-white border-l-cyan-400 bg-white/[0.12]' 
              : 'text-gray-200 border-transparent hover:bg-white/10 hover:text-white hover:border-l-cyan-400'
          }`}
          onClick={() => handleNavigate('financial', '/section-e')} 
          title="Financials"
        >
          <span className="text-lg w-6 text-center flex-shrink-0">💳</span>
          {!collapsed && <span>Financials</span>}
        </div>

        <div className={`h-px bg-white/[0.15] my-1.5 transition-all duration-300 ${collapsed ? 'mx-3' : 'mx-4'}`}></div>

        <div 
          className={`flex items-center gap-3 px-5 py-2 text-sm font-medium cursor-pointer border-l-[3px] transition-all ${collapsed ? 'justify-center px-0' : ''} ${
            isActive('/admin') 
              ? 'text-white border-l-cyan-400 bg-white/[0.12]' 
              : 'text-gray-200 border-transparent hover:bg-white/10 hover:text-white hover:border-l-cyan-400'
          }`}
          onClick={() => handleNavigate('admin', '/admin')}
          title="Admin"
        >
          <span className="text-lg w-6 text-center flex-shrink-0">⚙️</span>
          {!collapsed && <span>Admin</span>}
        </div>
      </nav>
    </div>
  )
}

export default Sidebar
