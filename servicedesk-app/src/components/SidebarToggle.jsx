function SidebarToggle({ collapsed, onToggle }) {
  return (
    <button 
      className={`fixed top-4 w-8 h-8 bg-white rounded-full text-[#0f1d3d] cursor-pointer flex items-center justify-center z-[901] transition-all duration-300 text-xl font-bold shadow-lg border-4 border-[#0f1d3d] hover:border-cyan-400`}
      style={{ left: collapsed ? '44px' : '234px' }}
      onClick={onToggle}
    >
      {collapsed ? '›' : '‹'}
    </button>
  )
}

export default SidebarToggle
