import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SidebarToggle from '../components/SidebarToggle'
import Header from '../components/Header'

const escalations = [
  { id: 'ESC-001', ticket: 'SR-001200', reason: 'SLA Breach - Response Time', level: 'L1', time: '15 mins ago', status: 'Active' },
  { id: 'ESC-002', ticket: 'SR-001195', reason: 'Customer Complaint', level: 'L2', time: '1 hour ago', status: 'Active' },
  { id: 'ESC-003', ticket: 'SR-001180', reason: 'VIP Request Overdue', level: 'L3', time: '2 hours ago', status: 'Pending' },
]

const pendingApprovals = [
  { id: 'APR-001', ticket: 'SR-001210', type: 'Service Closure', requestedBy: 'John Doe', amount: '₱15,000', created: '30 mins ago' },
  { id: 'APR-002', ticket: 'SR-001205', type: 'Budget Override', requestedBy: 'Jane Smith', amount: '₱25,000', created: '1 hour ago' },
  { id: 'APR-003', ticket: 'SR-001198', type: 'SLA Extension', requestedBy: 'Mike Johnson', amount: '-', created: '2 hours ago' },
]

const slaMatrix = [
  { priority: 'P1', responseTarget: '15 min', resolutionTarget: '4 hrs', currentCompliance: 92, trend: 'up' },
  { priority: 'P2', responseTarget: '30 min', resolutionTarget: '8 hrs', currentCompliance: 95, trend: 'up' },
  { priority: 'P3', responseTarget: '2 hrs', resolutionTarget: '24 hrs', currentCompliance: 98, trend: 'stable' },
  { priority: 'P4', responseTarget: '4 hrs', resolutionTarget: '72 hrs', currentCompliance: 99, trend: 'stable' },
]

function SectionC() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('sla')

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

  const getComplianceColor = (value) => {
    if (value >= 95) return 'text-green-600 bg-green-100'
    if (value >= 90) return 'text-amber-600 bg-amber-100'
    return 'text-red-600 bg-red-100'
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
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <button
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'sla' ? 'bg-cyan-500 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('sla')}
          >
            <span>📊</span>SLA Monitor
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'approvals' ? 'bg-cyan-500 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('approvals')}
          >
            <span>✅</span>Approvals
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === 'qc' ? 'bg-cyan-500 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
            onClick={() => setActiveTab('qc')}
          >
            <span>🔍</span>Quality Control
          </button>
        </div>

        {/* SLA Tab */}
        {activeTab === 'sla' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Escalations */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span>🚨</span> Active Escalations
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {escalations.map((esc) => (
                  <div key={esc.id} className="p-3 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm text-red-600">{esc.id}</span>
                      <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-semibold">{esc.level}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-800 mb-1">{esc.reason}</div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Ticket: {esc.ticket}</span>
                      <span>{esc.time}</span>
                    </div>
                    <button className="mt-3 w-full py-1.5 border border-red-300 rounded text-sm font-semibold text-red-600 hover:bg-red-100">
                      Take Action
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Policy Matrix */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <span>📋</span> SLA Policy Matrix
                </h3>
              </div>
              <div className="p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-3 font-semibold text-gray-700">Priority</th>
                      <th className="p-3 font-semibold text-gray-700 text-center">Response Target</th>
                      <th className="p-3 font-semibold text-gray-700 text-center">Resolution Target</th>
                      <th className="p-3 font-semibold text-gray-700 text-center">Compliance</th>
                      <th className="p-3 font-semibold text-gray-700 text-center">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slaMatrix.map((sla) => (
                      <tr key={sla.priority} className="border-t border-gray-100">
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                            sla.priority === 'P1' ? 'bg-red-500' :
                            sla.priority === 'P2' ? 'bg-amber-500' :
                            sla.priority === 'P3' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}>
                            {sla.priority}
                          </span>
                        </td>
                        <td className="p-3 text-center font-medium">{sla.responseTarget}</td>
                        <td className="p-3 text-center font-medium">{sla.resolutionTarget}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded font-bold ${getComplianceColor(sla.currentCompliance)}`}>
                            {sla.currentCompliance}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-lg ${sla.trend === 'up' ? 'text-green-500' : 'text-gray-400'}`}>
                            {sla.trend === 'up' ? '↗' : '→'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span>📝</span> Pending Approvals
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="p-4 border border-gray-200 rounded-lg hover:border-cyan-300 transition-all flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm text-cyan-600">{approval.id}</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">{approval.type}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>Ticket: {approval.ticket}</span> | <span>By: {approval.requestedBy}</span> | <span>Amount: {approval.amount}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{approval.created}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600">Approve</button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QC Tab */}
        {activeTab === 'qc' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🔍</span> Quality Control Queue
            </h3>
            <div className="text-center py-12">
              <div className="text-5xl mb-4">✅</div>
              <div className="text-lg font-semibold text-gray-800">All Clear!</div>
              <div className="text-sm text-gray-500">No pending quality checks at this time</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SectionC
