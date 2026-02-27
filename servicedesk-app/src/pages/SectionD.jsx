import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SidebarToggle from '../components/SidebarToggle'
import Header from '../components/Header'

const messageTemplates = [
  { id: 1, name: 'Service Update', preview: 'Your service request #{ticket_id} has been updated...' },
  { id: 2, name: 'Completion Notice', preview: 'We are pleased to inform you that your request has been completed...' },
  { id: 3, name: 'Follow-up', preview: 'We would like to follow up on your recent service experience...' },
]

const recentFeedback = [
  { id: 1, ticket: 'SR-001198', guest: 'John D.', rating: 5, comment: 'Excellent service! Very prompt response.', time: '1 hour ago' },
  { id: 2, ticket: 'SR-001195', guest: 'Maria S.', rating: 4, comment: 'Good service, slightly delayed but resolved well.', time: '3 hours ago' },
  { id: 3, ticket: 'SR-001190', guest: 'Robert K.', rating: 2, comment: 'Issue not fully resolved. Need follow-up.', time: '5 hours ago' },
]

function SectionD() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState('comms')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [messageContent, setMessageContent] = useState('')

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

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-100'
    if (rating >= 3) return 'text-amber-600 bg-amber-100'
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
        {/* Section Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${activeSection === 'comms' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-300'}`}
            onClick={() => setActiveSection('comms')}
          >
            <div className="text-2xl mb-2">📧</div>
            <div className="font-bold text-gray-800">Communications Hub</div>
            <div className="text-sm text-gray-500">Send messages & notifications</div>
          </button>
          <button
            className={`flex-1 p-4 rounded-xl border-2 transition-all ${activeSection === 'feedback' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-300'}`}
            onClick={() => setActiveSection('feedback')}
          >
            <div className="text-2xl mb-2">⭐</div>
            <div className="font-bold text-gray-800">Guest Feedback</div>
            <div className="text-sm text-gray-500">CSAT & NPS management</div>
          </button>
        </div>

        {/* Communications Hub */}
        {activeSection === 'comms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Templates */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">📄 Message Templates</h3>
              </div>
              <div className="p-4 space-y-2">
                {messageTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedTemplate === template.id ? 'bg-emerald-100 border-l-4 border-l-emerald-500' : 'bg-gray-50 hover:bg-gray-100'}`}
                    onClick={() => { setSelectedTemplate(template.id); setMessageContent(template.preview); }}
                  >
                    <div className="font-medium text-gray-800">{template.name}</div>
                    <div className="text-xs text-gray-500 truncate">{template.preview}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compose */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800">✉️ Compose Message</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Enter ticket ID or guest name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Message subject" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 h-32" 
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">Save Draft</button>
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600">Send Message</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Guest Feedback */}
        {activeSection === 'feedback' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">4.5</div>
                <div className="text-sm text-gray-500">Average CSAT Score</div>
                <div className="text-yellow-500 mt-2">⭐⭐⭐⭐☆</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">+72</div>
                <div className="text-sm text-gray-500">Net Promoter Score</div>
                <div className="text-xs text-green-600 mt-2">↑ 5 pts vs last month</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <div className="text-4xl font-bold text-amber-600 mb-2">8</div>
                <div className="text-sm text-gray-500">Recovery Cases</div>
                <div className="text-xs text-gray-500 mt-2">3 resolved, 5 pending</div>
              </div>
            </div>

            {/* Recent Feedback */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">📝 Recent Feedback</h3>
                <button className="text-emerald-600 text-sm font-semibold hover:underline">View All</button>
              </div>
              <div className="p-4 space-y-4">
                {recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-mono text-sm text-emerald-600">{feedback.ticket}</span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-sm text-gray-600">{feedback.guest}</span>
                      </div>
                      <span className={`px-2 py-1 rounded font-bold text-sm ${getRatingColor(feedback.rating)}`}>
                        {feedback.rating}/5
                      </span>
                    </div>
                    <div className="text-yellow-500 text-sm mb-2">{getRatingStars(feedback.rating)}</div>
                    <div className="text-sm text-gray-700">{feedback.comment}</div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-400">{feedback.time}</span>
                      {feedback.rating <= 3 && (
                        <button className="px-3 py-1 bg-amber-500 text-white rounded text-xs font-semibold hover:bg-amber-600">
                          Initiate Recovery
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SectionD
