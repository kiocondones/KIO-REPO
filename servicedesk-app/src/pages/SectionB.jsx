import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SidebarToggle from '../components/SidebarToggle'
import Header from '../components/Header'

const unassignedRequests = [
  { id: 'SR-001234', title: 'AC Unit Not Working - Room 305', category: 'Maintenance', priority: 'High', created: '2 hours ago', source: 'Guest App' },
  { id: 'SR-001235', title: 'WiFi Connectivity Issue - Floor 3', category: 'IT Support', priority: 'Medium', created: '1 hour ago', source: 'Front Desk' },
  { id: 'SR-001236', title: 'Extra Towels Request - Room 412', category: 'Housekeeping', priority: 'Low', created: '30 mins ago', source: 'Phone' },
]

const technicians = [
  { id: 1, name: 'John Doe', dept: 'Engineering', status: 'Available', assigned: 3, capacity: 5, avatar: 'JD' },
  { id: 2, name: 'Jane Smith', dept: 'IT Support', status: 'Busy', assigned: 5, capacity: 5, avatar: 'JS' },
  { id: 3, name: 'Mike Johnson', dept: 'Housekeeping', status: 'Available', assigned: 2, capacity: 4, avatar: 'MJ' },
  { id: 4, name: 'Sarah Wilson', dept: 'Engineering', status: 'Off Duty', assigned: 0, capacity: 5, avatar: 'SW' },
]

function SectionB() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTickets, setSelectedTickets] = useState([])
  const [selectedTech, setSelectedTech] = useState(null)

  const navigateToModule = (module) => {
    switch(module) {
      case 'dashboard': navigate('/dashboard'); break
      case 'myview': navigate('/servicedesk'); break
      case 'requests': navigate('/requests'); break
      case 'intake': navigate('/ticket-intake'); break
      case 'analytics': navigate('/analytics'); break
      case 'financial': navigate('/section-e'); break
      case 'admin': navigate('/admin'); break
      default: break
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-500'
      case 'Medium': return 'bg-amber-500'
      case 'Low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return 'bg-green-500'
      case 'Busy': return 'bg-amber-500'
      case 'Off Duty': return 'bg-gray-400'
      default: return 'bg-gray-500'
    }
  }

  const handleBulkAssign = () => {
    if (selectedTickets.length === 0 || !selectedTech) {
      alert('Please select tickets and a technician')
      return
    }
    alert(`Assigned ${selectedTickets.length} ticket(s) to ${selectedTech}`)
    setShowAssignModal(false)
    setSelectedTickets([])
    setSelectedTech(null)
  }

  return (
    <div className="font-sans bg-gray-50 min-h-screen text-gray-800">
      <Sidebar collapsed={sidebarCollapsed} onNavigate={navigateToModule} />
      <SidebarToggle collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Header */}
      <Header 
        collapsed={sidebarCollapsed}
      />

      <div className={`max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${sidebarCollapsed ? 'sidebar-collapsed-margin' : 'with-sidebar'}`}>
        {/* Auto-Assignment Engine */}
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-6 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">🤖 Auto-Assignment Engine</h3>
              <p className="opacity-90">Automatically assign tickets based on skill, availability, and workload</p>
            </div>
            <button className="px-6 py-3 bg-white text-violet-600 rounded-lg font-bold hover:bg-gray-100 transition-all" onClick={() => setShowAssignModal(true)}>
              ⚡ Run Auto-Assign
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unassigned Queue */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span>📋</span> Unassigned Requests
              </h3>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">{unassignedRequests.length} pending</span>
            </div>
            <div className="p-4 space-y-3">
              {unassignedRequests.map((request) => (
                <div key={request.id} className="p-4 border border-gray-200 rounded-lg hover:border-violet-300 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-sm text-violet-600">{request.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold text-white ${getPriorityColor(request.priority)}`}>{request.priority}</span>
                  </div>
                  <div className="font-medium text-gray-800 mb-1">{request.title}</div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{request.category}</span>
                    <span>{request.created}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technician Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span>👥</span> Technician Status
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {technicians.map((tech) => (
                <div key={tech.id} className="p-4 border border-gray-200 rounded-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center font-bold text-violet-600">
                    {tech.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{tech.name}</div>
                    <div className="text-sm text-gray-500">{tech.dept}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">{tech.assigned}/{tech.capacity}</div>
                    <div className="text-xs text-gray-500">Assigned</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(tech.status)}`}>
                    {tech.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Availability */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span>📅</span> Weekly Availability Schedule
            </h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-3 font-semibold text-gray-700">Technician</th>
                  <th className="p-3 font-semibold text-gray-700 text-center">Mon</th>
                  <th className="p-3 font-semibold text-gray-700 text-center">Tue</th>
                  <th className="p-3 font-semibold text-gray-700 text-center">Wed</th>
                  <th className="p-3 font-semibold text-gray-700 text-center">Thu</th>
                  <th className="p-3 font-semibold text-gray-700 text-center">Fri</th>
                  <th className="p-3 font-semibold text-gray-700 text-center">Sat</th>
                  <th className="p-3 font-semibold text-gray-700 text-center">Sun</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((tech) => (
                  <tr key={tech.id} className="border-t border-gray-100">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-sm font-semibold text-violet-600">{tech.avatar}</div>
                        <span className="font-medium text-gray-800">{tech.name}</span>
                      </div>
                    </td>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                      <td key={day} className="p-3 text-center">
                        <div className={`w-8 h-8 mx-auto rounded flex items-center justify-center text-xs font-semibold ${
                          idx < 5 && tech.status !== 'Off Duty' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {idx < 5 && tech.status !== 'Off Duty' ? '✓' : '—'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bulk Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl m-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Auto-Assignment Results</h3>
            <div className="space-y-3 mb-6">
              {unassignedRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={selectedTickets.includes(req.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTickets([...selectedTickets, req.id])
                      } else {
                        setSelectedTickets(selectedTickets.filter(id => id !== req.id))
                      }
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{req.id}</div>
                    <div className="text-sm text-gray-500">{req.title}</div>
                  </div>
                  <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    onChange={(e) => setSelectedTech(e.target.value)}
                  >
                    <option value="">Select Tech</option>
                    {technicians.filter(t => t.status === 'Available').map(tech => (
                      <option key={tech.id} value={tech.name}>{tech.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-violet-500 text-white rounded-lg font-semibold hover:bg-violet-600" onClick={handleBulkAssign}>Confirm Assignments</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SectionB
