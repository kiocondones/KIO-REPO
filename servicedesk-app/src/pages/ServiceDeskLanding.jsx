import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import SidebarToggle from '../components/SidebarToggle'
import {getCategoriesAndTemplates} from "../api/serviceApi.js"
import {createTicket} from "../api/ticket.js"

const modules = [
  { id: 'requests', icon: '📋', subtitle: 'SERVICE REQUESTS', title: 'Request Management', notification: 5, features: ['Create and track service requests', 'Automated ticket routing', 'SLA monitoring and alerts', 'Self-service portal integration'], action: 'View My Requests' },
  { id: 'contracts', icon: '📄', subtitle: 'CONTRACT MANAGEMENT', title: 'Contracts & SLAs', features: ['Vendor contract tracking', 'SLA definition and monitoring', 'Renewal notifications', 'Compliance management'], action: 'View Contracts' },
  { id: 'admin', icon: '⚙️', subtitle: 'ADMINISTRATION', title: 'Admin Settings', features: ['User and role management', 'System configuration', 'Workflow customization', 'Report generation'], action: 'Access Admin Panel' },
  { id: 'dashboard', icon: '📊', title: 'Dashboard', subtitle: 'OVERVIEW', features: ['Real-time ticket monitoring', 'Team performance metrics', 'SLA breach alerts', 'Executive summary views'], action: 'View Dashboard' },
  { id: 'intake', icon: '📥', title: 'Ticket Intake & Classification', subtitle: 'SECTION A', features: ['Omni-channel ticket intake', 'Smart triage & prioritization', 'Auto-categorization rules', 'Duplicate detection'], action: 'Manage Intake' },
  { id: 'service', icon: '⏱️', title: 'Service Levels & Controls', subtitle: 'SECTION C', features: ['SLA & escalation engine', 'Approval workflows', 'Quality checks & sign-offs', 'Breach notifications'], action: 'Manage SLAs' },
  { id: 'communication', icon: '💬', title: 'Communication & Guest Experience', subtitle: 'SECTION D', features: ['Communications hub', 'Guest feedback (CSAT/NPS)', 'Auto-notifications', 'Recovery workflows'], action: 'Manage Communications' },
  { id: 'financial', icon: '💳', title: 'Financial & Closure', subtitle: 'SECTION E', features: ['Billing & chargebacks', 'Ticket closure workflows', 'Resolution codes', 'Cost tracking'], action: 'Manage Financials' },
  { id: 'sogo-admin', icon: '⚙️', title: 'Admin & Settings', subtitle: 'CONFIGURATION', features: ['User & role management', 'Category configuration', 'SLA policy setup', 'System preferences'], action: 'Configure System' }
]

const technicians = ['Angela Aquino', 'Angela Clarisse Ornedo', 'Angelica Cabigting', 'Angelica Lopez', 'Angelica Ramirez', 'Angelica S. Lopez', 'Angelica Trapal', 'Angelika Baldoza', 'Angelo San pedro', 'Annabelle Pecatoste', 'Anthony Ross Atutubo', 'Antonette M Delorino', 'apovnew.dutymanager', 'Aprel Ayala', 'April Anne Reyes']

const resourceTechnicians = ['A09.hm', 'Accounting and T...', 'Administrator', 'Adrian Rey Manz...', 'adrian.manzano', 'AFfelipe', 'Aira Balinagay', 'Albert Aquino', 'Alejandro Aguirre', 'Alexander M Asu...']

function ServiceDeskLanding() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState('myView')
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1))
  const [selectedDate, setSelectedDate] = useState(null)
  const [showDatePopup, setShowDatePopup] = useState(false)
  const [datePopupPosition, setDatePopupPosition] = useState({ top: 0, left: 0 })
  
  // Modal states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showTechniciansModal, setShowTechniciansModal] = useState(false)
  const [showBackupTechModal, setShowBackupTechModal] = useState(false)
  const [showTechAvailabilityModal, setShowTechAvailabilityModal] = useState(false)
  
  // Form states
  const [announcementPriority, setAnnouncementPriority] = useState('')
  const [reminderType, setReminderType] = useState('')
  const [ticketType, setTicketType] = useState('')
  const [techSearchFilter, setTechSearchFilter] = useState('')

  const [backupCurrentDate, setBackupCurrentDate] = useState(new Date(2025, 10, 1))
  const [availabilityCurrentDate, setAvailabilityCurrentDate] = useState(new Date(2025, 10, 1))
  const [resourceCurrentDate, setResourceCurrentDate] = useState(new Date(2025, 10, 4))

  const [categories, setCategories] = useState([])
  const [templates, setTemplates] = useState([])
  const [filteredTemplates, setFilteredTemplates] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [description, setDescription] = useState('')

  const user = JSON.parse(localStorage.getItem("user"));

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const navigateToModule = (module) => {
    switch(module) {
      case 'dashboard': navigate('/dashboard'); break
      case 'myview': setCurrentView('myView'); break
      case 'requests': navigate('/requests'); break
      case 'intake': navigate('/ticket-intake'); break
      case 'service': navigate('/section-c'); break
      case 'communication': navigate('/section-d'); break
      case 'analytics': navigate('/analytics'); break
      case 'financial': navigate('/section-e'); break
      case 'admin': navigate('/admin'); break
      default: break
    }
  }

  const handleModuleAction = (moduleId) => {
    switch(moduleId) {
      case 'dashboard': navigate('/dashboard'); break
      case 'requests': navigate('/requests'); break
      case 'intake': navigate('/ticket-intake'); navigate('/section-b'); break
      case 'service': navigate('/section-c'); break
      case 'communication': navigate('/section-d'); break
      case 'financial': navigate('/section-e'); break
      case 'admin': navigate('/admin'); break
      default: alert(`📋 Opening ${moduleId} module...`)
    }
  }

  const switchView = (viewName) => {
    setCurrentView(viewName)
  }

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const handleDateClick = (e, date, month, year) => {
    const rect = e.target.getBoundingClientRect()
    setDatePopupPosition({ top: rect.bottom + 5, left: rect.left })
    setSelectedDate({ date, month, year })
    setShowDatePopup(true)
  }

  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
    const todayDate = today.getDate()

    const rows = []
    let date = 1

    for (let i = 0; i < 6; i++) {
      const cells = []
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          cells.push(<td key={`empty-${i}-${j}`} className="border border-gray-200 p-3 h-24"></td>)
        } else if (date > daysInMonth) {
          cells.push(<td key={`empty-end-${i}-${j}`} className="border border-gray-200 p-3 h-24"></td>)
        } else {
          const currentDateValue = date
          const isWeekend = j === 0 || j === 6
          const isToday = isCurrentMonth && date === todayDate
          const isHoliday = month === 10 && (date === 27 || date === 28)
          
          cells.push(
            <td 
              key={`day-${date}`}
              className={`border border-gray-200 p-3 h-24 align-top cursor-pointer hover:bg-gray-50 ${isWeekend ? 'bg-blue-100' : ''} ${isHoliday ? 'bg-blue-200' : ''}`}
              onClick={(e) => handleDateClick(e, currentDateValue, month, year)}
            >
              <div className={`date-number font-semibold text-gray-700 text-sm ${isToday ? 'bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>
                {date}
              </div>
            </td>
          )
          date++
        }
      }
      rows.push(<tr key={`row-${i}`}>{cells}</tr>)
      if (date > daysInMonth) break
    }
    return rows
  }

  const generateAvailabilityChart = () => {
    const year = availabilityCurrentDate.getFullYear()
    const month = availabilityCurrentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return technicians.map((techName, idx) => (
      <tr key={idx}>
        <td className="text-left pl-3 font-medium text-gray-700 text-sm bg-gray-50 sticky left-0 z-[5] border border-gray-200">
          <span className="text-gray-400 mr-2 text-[10px] cursor-pointer">▶</span>{techName}
        </td>
        {Array.from({ length: daysInMonth }, (_, day) => {
          const dayOfWeek = new Date(year, month, day + 1).getDay()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
          const isHoliday = month === 10 && (day + 1 === 27 || day + 1 === 28)
          return (
            <td 
              key={day}
              className={`p-1 border border-gray-200 text-center text-xs h-8 ${isHoliday ? 'bg-blue-200' : isWeekend ? 'bg-blue-100' : 'bg-gray-100'}`}
            >
              <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-blue-500/10"></div>
            </td>
          )
        })}
      </tr>
    ))
  }

  const generateResourceTimeline = () => {
    return resourceTechnicians.map((techName, idx) => (
      <tr key={idx}>
        <td className="sticky left-0 bg-white z-[5] p-2 border-r-2 border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
              {techName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-800">{techName}</div>
              <div className="text-xs text-gray-500">Load - 0/10 h</div>
            </div>
          </div>
        </td>
        {Array.from({ length: 24 }, (_, hour) => (
          <td key={hour} className="border border-gray-200 p-0 h-[60px] min-w-[40px]">
            <div className="w-full h-full bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"></div>
          </td>
        ))}
      </tr>
    ))
  }

  const filteredTechnicians = [
    { name: 'Alyssa H Sanchez', email: 'ict.devops@globalofficium.com', initials: 'AS' },
    { name: 'ARIEL PARCON', email: '-', initials: 'AP' },
    { name: 'Bernardino Guevara', email: 'cmd.graphics@globalcomfortgroup.com', initials: 'BG' },
    { name: 'Brix Arvin Malitao', email: 'ict.devops@globalofficium.com', initials: 'BM' },
    { name: 'Test Operations', email: 'test.ops@company.com', initials: 'TO' }
  ].filter(tech => tech.name.toLowerCase().includes(techSearchFilter.toLowerCase()))

  const handleCreateTask = async() => {
    const res = await createTicket(selectedTemplate, description)

    if(res.success){
       alert('✅ Task created successfully!');
       setShowTaskModal(false)
    }
  }

  const fetchCategoriesAndTemplates = async() => {
    const res = await getCategoriesAndTemplates()

    if(res.success){
      setCategories(res.categories)
      setTemplates(res.templates)
    }
  };

  useEffect(() => {
  if (!selectedCategory) {
    setFilteredTemplates([]);
    return;
  }

  setFilteredTemplates(
    templates.filter(temp => temp.category_id === Number(selectedCategory))
  );
}, [selectedCategory, templates]);

  useEffect(() => {
    fetchCategoriesAndTemplates()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} onNavigate={navigateToModule} />
      <SidebarToggle collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <Header 
        collapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`p-6 transition-all duration-300 ${sidebarCollapsed ? 'sidebar-collapsed-margin' : 'with-sidebar'}`}>
        {/* View Navigation */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm">
          <button 
            className={`view-nav-button flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm ${currentView === 'myView' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
            onClick={() => switchView('myView')}
          >
            <span>📊</span>My View
          </button>
          <button 
            className={`view-nav-button flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm ${currentView === 'scheduler' ? 'bg-blue-500 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
            onClick={() => switchView('scheduler')}
          >
            <span>📅</span>Scheduler
          </button>
        </div>

        {/* Scheduler View */}
        {currentView === 'scheduler' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 border border-gray-300 bg-white rounded flex items-center justify-center text-gray-500 hover:bg-gray-50" onClick={() => changeMonth(-1)}>◄</button>
                  <span className="font-semibold text-gray-800 min-w-[140px] text-center">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                  <button className="w-8 h-8 border border-gray-300 bg-white rounded flex items-center justify-center text-gray-500 hover:bg-gray-50" onClick={() => changeMonth(1)}>►</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Site</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>All Sites</option>
                    <option>Corporate Office</option>
                    <option>Branch 1</option>
                    <option>Branch 2</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">🏠 Choose Group</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>No, just select technician</option>
                    <option>IT Team</option>
                    <option>Support Team</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Technician</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Test Acc</option>
                    <option>John Doe</option>
                    <option>Jane Smith</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50" onClick={() => setShowTechniciansModal(true)}>Logged-in Technicians</button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50" onClick={() => setShowBackupTechModal(true)}>Backup Tech Chart</button>
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50" onClick={() => setShowTechAvailabilityModal(true)}>Tech Availability Chart</button>
              </div>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="calendar-table w-full border-collapse">
                <thead>
                  <tr>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <th key={day} className="bg-blue-500 text-white p-3 text-left font-semibold text-sm">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{generateCalendar()}</tbody>
              </table>
            </div>
            <div className="flex gap-6 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-500 rounded"></span><span>🌲 Backup Technician Configured</span></div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 bg-blue-200 rounded"></span><span>Company Holiday</span></div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 bg-blue-100 rounded"></span><span>Weekends</span></div>
            </div>
          </div>
        )}

        {/* Date Popup */}
        {showDatePopup && (
          <div 
            className="date-popup active"
            style={{ top: datePopupPosition.top, left: datePopupPosition.left }}
          >
            <div className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
              {selectedDate && `${monthNames[selectedDate.month]} ${selectedDate.date}, ${selectedDate.year}`}
            </div>
            <div className="flex flex-col gap-2">
              <button 
                className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg text-sm hover:bg-gray-100"
                onClick={() => { setShowDatePopup(false); alert(`🏖️ Mark as Leave\n\nDate: ${monthNames[selectedDate.month]} ${selectedDate.date}, ${selectedDate.year}`) }}
              >
                <span>🏖️</span><span>Mark as Leave</span>
              </button>
              <button 
                className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-lg text-sm hover:bg-gray-100"
                onClick={() => { setShowDatePopup(false); setShowTaskModal(true) }}
              >
                <span>➕</span><span>New Task</span>
              </button>
            </div>
          </div>
        )}

        {/* My View Content */}
        {currentView === 'myView' && (
          <div className="grid grid-cols-[280px_1fr_300px] gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">📋 My Summary</div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100"><div className="text-sm text-gray-600">⏰ Requests Overdue</div><div className="text-lg font-bold text-gray-800">0</div></div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100"><div className="text-sm text-gray-600">📅 Requests Due Today</div><div className="text-lg font-bold text-gray-800">0</div></div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100"><div className="text-sm text-gray-600">⏳ Pending Requests</div><div className="text-lg font-bold text-gray-800">0</div></div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100"><div className="text-sm text-gray-600">✅ Approved Changes</div><div className="text-lg font-bold text-gray-800">0</div></div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100"><div className="text-sm text-gray-600">❌ Unapproved Changes</div><div className="text-lg font-bold text-gray-800">0</div></div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100"><div className="text-sm text-gray-600">⚠️ Open Problems</div><div className="text-lg font-bold text-gray-800">0</div></div>
              <div className="flex justify-between items-center py-3"><div className="text-sm text-gray-600">📝 Unassigned Problems</div><div className="text-lg font-bold text-gray-800">0</div></div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">✅ My Tasks (0)</div>
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📋</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">There are no tasks in this view</div>
                <div className="text-sm text-gray-500 mb-4">Tasks will appear here when they are assigned to you</div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600" onClick={() => setShowTaskModal(true)}>+ New Task</button>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
                <div className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">✓ My Approvals</div>
                <div className="text-center py-6"><div className="text-4xl mb-2">✓</div><div className="font-medium text-gray-600">No pending approval</div></div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <div className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">⏰ My Reminder(s)</div>
                <div className="text-center py-6"><div className="text-4xl mb-2">⏰</div><div className="font-medium text-gray-600 mb-3">No reminder available</div><button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600" onClick={() => setShowReminderModal(true)}>+ Add New</button></div>
              </div>
            </div>
          </div>
        )}

        {/* Announcements */}
        {currentView === 'myView' && (
          <div className="bg-white rounded-xl p-5 shadow-sm mt-6">
            <div className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">📢 Announcements</div>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📢</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">There are no new announcements today</div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600" onClick={() => setShowAnnouncementModal(true)}>+ Add New</button>
            </div>
          </div>
        )}
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setShowAnnouncementModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">📢 Create New Announcement</h2>
              <button className="text-2xl text-gray-400 hover:text-gray-600" onClick={() => setShowAnnouncementModal(false)}>&times;</button>
            </div>
            <form>
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-3">📋 Announcement Type</div>
                  <div className="text-sm text-gray-600 mb-2">Select Priority Level <span className="text-red-500">*</span></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className={`announcement-type-card border-2 rounded-lg p-4 cursor-pointer text-center hover:border-blue-300 ${announcementPriority === 'info' ? 'selected border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setAnnouncementPriority('info')}
                    >
                      <div className="text-2xl mb-2">ℹ️</div>
                      <div className="font-semibold text-gray-800">Information</div>
                      <div className="text-xs text-gray-500 mt-1">General updates and news</div>
                    </div>
                    <div 
                      className={`announcement-type-card border-2 rounded-lg p-4 cursor-pointer text-center hover:border-blue-300 ${announcementPriority === 'important' ? 'selected border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setAnnouncementPriority('important')}
                    >
                      <div className="text-2xl mb-2">⚠️</div>
                      <div className="font-semibold text-gray-800">Important</div>
                      <div className="text-xs text-gray-500 mt-1">Critical notices</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-3">📝 Announcement Details</div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" placeholder="Enter announcement title" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
                      <option value="">Select Category</option>
                      <option value="system">System Maintenance</option>
                      <option value="policy">Policy Update</option>
                      <option value="event">Event Notification</option>
                      <option value="training">Training Session</option>
                      <option value="general">General Announcement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
                    <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm min-h-[150px]" placeholder="Enter announcement message..."></textarea>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-3">📅 Schedule & Duration</div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                      <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4" />
                    Pin this announcement (show at top)
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">↻ Reset Form</button>
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100" onClick={() => setShowAnnouncementModal(false)}>Cancel</button>
                <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600" onClick={() => { alert('📢 Announcement published successfully!'); setShowAnnouncementModal(false) }}>📢 Publish Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setShowReminderModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">⏰ Create New Reminder</h2>
              <button className="text-2xl text-gray-400 hover:text-gray-600" onClick={() => setShowReminderModal(false)}>&times;</button>
            </div>
            <form>
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-3">🏷️ Reminder Type</div>
                  <div className="text-sm text-gray-600 mb-2">Select Reminder Category <span className="text-red-500">*</span></div>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { type: 'task', icon: '✅', label: 'Task' },
                      { type: 'meeting', icon: '👥', label: 'Meeting' },
                      { type: 'deadline', icon: '⏳', label: 'Deadline' },
                      { type: 'followup', icon: '📞', label: 'Follow-up' },
                      { type: 'personal', icon: '⭐', label: 'Personal' },
                      { type: 'other', icon: '📝', label: 'Other' }
                    ].map(item => (
                      <div 
                        key={item.type}
                        className={`reminder-type-card border-2 rounded-lg p-3 cursor-pointer text-center hover:border-blue-300 ${reminderType === item.type ? 'selected border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        onClick={() => setReminderType(item.type)}
                      >
                        <div className="text-xl mb-1">{item.icon}</div>
                        <div className="text-xs font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-3">📝 Reminder Details</div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" placeholder="Enter reminder title" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add additional notes or description..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm">
                      <option value="low">Low Priority</option>
                      <option value="normal" selected>Normal Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-3">📅 Date & Time</div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                      <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time <span className="text-red-500">*</span></label>
                      <input type="time" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">↻ Reset Form</button>
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100" onClick={() => setShowReminderModal(false)}>Cancel</button>
                <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600" onClick={() => { alert('⏰ Reminder created successfully!'); setShowReminderModal(false); }}>⏰ Create Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && setShowTaskModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">📋 Create New Task</h2>
              <button className="text-2xl text-gray-400 hover:text-gray-600" onClick={() => setShowTaskModal(false)}>&times;</button>
            </div>
            <form>
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-3">🎫 Ticket Type</div>
                  <div className="text-sm text-gray-600 mb-2">Select Ticket Type <span className="text-red-500">*</span></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className={`ticket-type-card border-2 rounded-lg p-4 cursor-pointer text-center hover:border-blue-300 ${ticketType === 'incident' ? 'selected border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setTicketType('incident')}
                    >
                      <div className="text-2xl mb-2">🚨</div>
                      <div className="font-semibold text-gray-800">Incident Report</div>
                      <div className="text-xs text-gray-500 mt-1">Unexpected issues or emergencies</div>
                    </div>
                    <div 
                      className={`ticket-type-card border-2 rounded-lg p-4 cursor-pointer text-center hover:border-blue-300 ${ticketType === 'service' ? 'selected border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setTicketType('service')}
                    >
                      <div className="text-2xl mb-2">🔧</div>
                      <div className="font-semibold text-gray-800">Service Report</div>
                      <div className="text-xs text-gray-500 mt-1">Planned service requests</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-3 flex items-center gap-2">👤 Requester Information<span className="ml-auto bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">AUTO-FILLED</span></div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requester Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-100" value={user?.name ?? ""} readOnly />
                    <div className="text-xs text-gray-400 mt-1">Auto-populated from logged-in user</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-100" value={`${user?.phone} | ${user?.email}`} readOnly />
                    <div className="text-xs text-gray-400 mt-1">Auto-populated from user profile</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-semibold text-gray-700 mb-3">🖥️ Service Provider & Request Details</div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                      <option value="">Select Service Provider</option>
                      {categories.map((cat) => (
                        <option value={cat.id} key={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service <span className="text-red-500">*</span></label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                      <option value="">Select Service</option>
                      {filteredTemplates.map((temp) => (
                        <option value={temp.id} key={temp.id}>{temp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                    <textarea className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide detailed description of the request..."></textarea>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 border-t border-gray-200 bg-gray-50">
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">↻ Reset Form</button>
                <button type="button" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600" onClick={handleCreateTask}>✓ Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logged-in Technicians Modal */}
      {showTechniciansModal && (
        <div className="technicians-modal active" onClick={(e) => e.target === e.currentTarget && setShowTechniciansModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Logged-in Technicians</h3>
              <button className="text-2xl text-gray-400 hover:text-gray-600" onClick={() => setShowTechniciansModal(false)}>×</button>
            </div>
            <div className="p-4 border-b border-gray-200 flex gap-3">
              <select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Show All</option>
                <option>Available</option>
                <option>Busy</option>
                <option>On Break</option>
              </select>
              <input 
                type="text" 
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                placeholder="🔍 Search..." 
                value={techSearchFilter}
                onChange={(e) => setTechSearchFilter(e.target.value)}
              />
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {filteredTechnicians.map((tech, idx) => (
                <div key={idx} className="tech-item flex items-center gap-3 p-3 border border-gray-200 rounded-lg mb-2">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600 text-sm">{tech.initials}</div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-sm">{tech.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>📞</span>
                      <span>📧 {tech.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backup Tech Chart Modal */}
      {showBackupTechModal && (
        <div className="backup-tech-modal active" onClick={(e) => e.target === e.currentTarget && setShowBackupTechModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[900px] max-h-[85vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Backup Technician List View</h3>
              <button className="text-2xl text-gray-400 hover:text-gray-600" onClick={() => setShowBackupTechModal(false)}>×</button>
            </div>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-center gap-4 mb-4">
                <button className="w-7 h-7 border border-gray-300 bg-white rounded-full flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50" onClick={() => setBackupCurrentDate(new Date(backupCurrentDate.getFullYear(), backupCurrentDate.getMonth() - 1, 1))}>◄</button>
                <span className="font-semibold text-gray-800 min-w-[150px] text-center">{monthNames[backupCurrentDate.getMonth()]} {backupCurrentDate.getFullYear()}</span>
                <button className="w-7 h-7 border border-gray-300 bg-white rounded-full flex items-center justify-center text-sm text-gray-500 hover:bg-gray-50" onClick={() => setBackupCurrentDate(new Date(backupCurrentDate.getFullYear(), backupCurrentDate.getMonth() + 1, 1))}>►</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-50 p-3 text-left font-semibold text-sm text-gray-700 border border-gray-200">From Date</th>
                    <th className="bg-gray-50 p-3 text-left font-semibold text-sm text-gray-700 border border-gray-200">To Date</th>
                    <th className="bg-gray-50 p-3 text-left font-semibold text-sm text-gray-700 border border-gray-200">Technician</th>
                    <th className="bg-gray-50 p-3 text-left font-semibold text-sm text-gray-700 border border-gray-200">Backup Technician</th>
                    <th className="bg-gray-50 p-3 text-center font-semibold text-sm text-gray-700 border border-gray-200 w-10">⚙️</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-gray-400 text-sm">No leave is configured.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tech Availability Chart Modal */}
      {showTechAvailabilityModal && (
        <div className="tech-availability-modal active" onClick={(e) => e.target === e.currentTarget && setShowTechAvailabilityModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-[95vw] max-h-[90vh] flex flex-col shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-wrap gap-4">
              <h3 className="text-lg font-bold text-gray-800">Technician Availability Chart</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Site</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>All Sites</option>
                    <option>Corporate Office</option>
                    <option>Branch 1</option>
                    <option>Branch 2</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">🏠 Choose Group</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>All Technicians</option>
                    <option>IT Team</option>
                    <option>Support Team</option>
                    <option>Network Team</option>
                  </select>
                </div>
              </div>
              <button className="text-2xl text-gray-400 hover:text-gray-600" onClick={() => setShowTechAvailabilityModal(false)}>×</button>
            </div>
            <div className="flex justify-center items-center gap-4 p-4 border-b border-gray-200">
              <button className="w-8 h-8 border border-gray-300 bg-white rounded flex items-center justify-center text-gray-500 hover:bg-gray-50" onClick={() => setAvailabilityCurrentDate(new Date(availabilityCurrentDate.getFullYear(), availabilityCurrentDate.getMonth() - 1, 1))}>◄</button>
              <span className="font-semibold text-gray-800">{monthNames[availabilityCurrentDate.getMonth()]} {availabilityCurrentDate.getFullYear()}</span>
              <button className="w-8 h-8 border border-gray-300 bg-white rounded flex items-center justify-center text-gray-500 hover:bg-gray-50" onClick={() => setAvailabilityCurrentDate(new Date(availabilityCurrentDate.getFullYear(), availabilityCurrentDate.getMonth() + 1, 1))}>►</button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="availability-table w-full border-collapse min-w-[1200px]">
                <thead>
                  <tr>
                    <th className="bg-blue-500 text-white p-2 text-left font-semibold text-xs border border-gray-200 sticky top-0 z-10 min-w-[180px]">Technician</th>
                    {Array.from({ length: new Date(availabilityCurrentDate.getFullYear(), availabilityCurrentDate.getMonth() + 1, 0).getDate() }, (_, i) => (
                      <th key={i} className="bg-gray-50 p-2 text-center font-semibold text-xs text-gray-700 border border-gray-200 sticky top-0 z-10">{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generateAvailabilityChart()}
                </tbody>
              </table>
            </div>
            <div className="flex gap-6 flex-wrap p-4 border-t border-gray-200 text-sm">
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span><span>● Online Technicians</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-500 rounded-full"></span><span>● Offline Technicians</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-white border-2 border-gray-400 rounded-full"></span><span>○ Logged Out Technicians</span></div>
              <div className="flex items-center gap-2"><span>🌲</span><span>Backup Technician Configured</span></div>
              <div className="flex items-center gap-2"><span className="w-5 h-3 bg-blue-200 rounded"></span><span>Company Holiday</span></div>
              <div className="flex items-center gap-2"><span className="w-5 h-3 bg-blue-100 rounded"></span><span>Weekends</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close date popup */}
      {showDatePopup && (
        <div className="fixed inset-0 z-[1050]" onClick={() => setShowDatePopup(false)}></div>
      )}
    </div>
  )
}

export default ServiceDeskLanding
