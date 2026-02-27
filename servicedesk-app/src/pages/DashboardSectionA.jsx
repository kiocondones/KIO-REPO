import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SidebarToggle from '../components/SidebarToggle'
import Header from '../components/Header'

// ============================================================
// DASHBOARD DATA - Centralized data for all dashboard tabs
// ============================================================

// Master ticket data
const ticketsData = [
  { id: 'TKT-001', category: 'engineering', priority: 'P1', status: 'resolved', resolvedTime: 2.5, cost: 1200, revenue: 1800, property: 'manila', department: 'engineering', createdAt: '2025-01-05', resolvedAt: '2025-01-05', csat: 5 },
  { id: 'TKT-002', category: 'housekeeping', priority: 'P2', status: 'resolved', resolvedTime: 1.5, cost: 500, revenue: 800, property: 'manila', department: 'housekeeping', createdAt: '2025-01-08', resolvedAt: '2025-01-08', csat: 4 },
  { id: 'TKT-003', category: 'it-support', priority: 'P2', status: 'in-progress', resolvedTime: null, cost: 800, revenue: 1200, property: 'quezon', department: 'it', createdAt: '2025-01-10', resolvedAt: null, csat: null },
  { id: 'TKT-004', category: 'fnb', priority: 'P3', status: 'resolved', resolvedTime: 0.5, cost: 300, revenue: 500, property: 'makati', department: 'fnb', createdAt: '2025-01-12', resolvedAt: '2025-01-12', csat: 5 },
  { id: 'TKT-005', category: 'engineering', priority: 'P1', status: 'open', resolvedTime: null, cost: 2000, revenue: 3000, property: 'manila', department: 'engineering', createdAt: '2025-01-15', resolvedAt: null, csat: null },
  { id: 'TKT-006', category: 'housekeeping', priority: 'P3', status: 'resolved', resolvedTime: 3.2, cost: 400, revenue: 600, property: 'quezon', department: 'housekeeping', createdAt: '2025-01-18', resolvedAt: '2025-01-18', csat: 4 },
  { id: 'TKT-007', category: 'it-support', priority: 'P1', status: 'resolved', resolvedTime: 1.8, cost: 1500, revenue: 2200, property: 'makati', department: 'it', createdAt: '2025-01-20', resolvedAt: '2025-01-20', csat: 5 },
  { id: 'TKT-008', category: 'fnb', priority: 'P2', status: 'in-progress', resolvedTime: null, cost: 600, revenue: 900, property: 'manila', department: 'fnb', createdAt: '2025-01-22', resolvedAt: null, csat: null },
  { id: 'TKT-009', category: 'engineering', priority: 'P2', status: 'resolved', resolvedTime: 4.0, cost: 1800, revenue: 2700, property: 'quezon', department: 'engineering', createdAt: '2025-02-02', resolvedAt: '2025-02-02', csat: 4 },
  { id: 'TKT-010', category: 'housekeeping', priority: 'P3', status: 'resolved', resolvedTime: 2.1, cost: 350, revenue: 550, property: 'manila', department: 'housekeeping', createdAt: '2025-02-05', resolvedAt: '2025-02-05', csat: 5 },
  { id: 'TKT-011', category: 'it-support', priority: 'P1', status: 'resolved', resolvedTime: 1.2, cost: 2200, revenue: 3300, property: 'makati', department: 'it', createdAt: '2025-02-08', resolvedAt: '2025-02-08', csat: 5 },
  { id: 'TKT-012', category: 'fnb', priority: 'P2', status: 'resolved', resolvedTime: 0.8, cost: 450, revenue: 700, property: 'quezon', department: 'fnb', createdAt: '2025-02-12', resolvedAt: '2025-02-12', csat: 4 },
]

// Historical data for YoY comparison
const historicalVolumeData = {
  2025: [
    { month: 'Jan', tickets: 245, avgResolution: 4.2 },
    { month: 'Feb', tickets: 268, avgResolution: 4.0 },
    { month: 'Mar', tickets: 292, avgResolution: 3.9 },
    { month: 'Apr', tickets: 285, avgResolution: 3.8 },
    { month: 'May', tickets: 310, avgResolution: 3.7 },
    { month: 'Jun', tickets: 298, avgResolution: 3.8 },
    { month: 'Jul', tickets: 315, avgResolution: 3.6 },
    { month: 'Aug', tickets: 287, avgResolution: 3.9 },
    { month: 'Sep', tickets: 294, avgResolution: 3.7 },
    { month: 'Oct', tickets: 247, avgResolution: 3.8 },
  ],
  2024: [
    { month: 'Jan', tickets: 210, avgResolution: 5.2 },
    { month: 'Feb', tickets: 225, avgResolution: 5.1 },
    { month: 'Mar', tickets: 238, avgResolution: 4.9 },
    { month: 'Apr', tickets: 242, avgResolution: 5.0 },
    { month: 'May', tickets: 258, avgResolution: 4.8 },
    { month: 'Jun', tickets: 265, avgResolution: 4.9 },
    { month: 'Jul', tickets: 270, avgResolution: 4.7 },
    { month: 'Aug', tickets: 248, avgResolution: 5.1 },
    { month: 'Sep', tickets: 252, avgResolution: 4.8 },
    { month: 'Oct', tickets: 204, avgResolution: 4.9 },
  ]
}

// Financial records
const financialRecords = {
  2025: [
    { month: 'Jan', expenses: 2.15, revenue: 3.35, profit: 1.20 },
    { month: 'Feb', expenses: 2.28, revenue: 3.55, profit: 1.27 },
    { month: 'Mar', expenses: 2.35, revenue: 3.70, profit: 1.35 },
    { month: 'Apr', expenses: 2.42, revenue: 3.72, profit: 1.30 },
    { month: 'May', expenses: 2.38, revenue: 3.75, profit: 1.37 },
    { month: 'Jun', expenses: 2.51, revenue: 3.92, profit: 1.41 },
    { month: 'Jul', expenses: 2.48, revenue: 3.95, profit: 1.47 },
    { month: 'Aug', expenses: 2.33, revenue: 3.65, profit: 1.32 },
    { month: 'Sep', expenses: 2.40, revenue: 3.80, profit: 1.40 },
    { month: 'Oct', expenses: 2.45, revenue: 3.90, profit: 1.45 },
  ],
  2024: [
    { month: 'Jan', expenses: 2.05, revenue: 3.10, profit: 1.05 },
    { month: 'Feb', expenses: 2.15, revenue: 3.25, profit: 1.10 },
    { month: 'Mar', expenses: 2.20, revenue: 3.35, profit: 1.15 },
    { month: 'Apr', expenses: 2.28, revenue: 3.40, profit: 1.12 },
    { month: 'May', expenses: 2.25, revenue: 3.45, profit: 1.20 },
    { month: 'Jun', expenses: 2.35, revenue: 3.55, profit: 1.20 },
    { month: 'Jul', expenses: 2.30, revenue: 3.52, profit: 1.22 },
    { month: 'Aug', expenses: 2.18, revenue: 3.30, profit: 1.12 },
    { month: 'Sep', expenses: 2.25, revenue: 3.45, profit: 1.20 },
    { month: 'Oct', expenses: 2.30, revenue: 3.50, profit: 1.20 },
  ]
}

const expenseCategories = { labor: 0.51, materials: 0.24, utilities: 0.16, other: 0.09 }

const staffData = [
  { id: 1, name: 'John Doe', department: 'engineering', property: 'manila', completedTickets: 45, avgResolution: 3.8, productivity: 94 },
  { id: 2, name: 'Maria Santos', department: 'housekeeping', property: 'manila', completedTickets: 62, avgResolution: 2.1, productivity: 96 },
  { id: 3, name: 'Carlos Reyes', department: 'it', property: 'quezon', completedTickets: 38, avgResolution: 4.2, productivity: 88 },
  { id: 4, name: 'Ana Cruz', department: 'fnb', property: 'makati', completedTickets: 55, avgResolution: 1.5, productivity: 94 },
  { id: 5, name: 'Pedro Lim', department: 'engineering', property: 'quezon', completedTickets: 42, avgResolution: 4.0, productivity: 92 },
  { id: 6, name: 'Sofia Garcia', department: 'housekeeping', property: 'makati', completedTickets: 58, avgResolution: 2.3, productivity: 95 },
]

// ============================================================
// COMPUTATION FUNCTIONS
// ============================================================
const computeBIStats = (tickets, property = 'all', department = 'all') => {
  let filtered = [...tickets]
  if (property !== 'all') filtered = filtered.filter(t => t.property === property)
  if (department !== 'all') filtered = filtered.filter(t => t.department === department)
  
  const totalTickets = filtered.length
  const critical = filtered.filter(t => t.priority === 'P1' && t.status !== 'resolved').length
  const resolved = filtered.filter(t => t.status === 'resolved')
  const slaCompliance = totalTickets > 0 ? ((resolved.length / totalTickets) * 100).toFixed(1) : 0
  const avgResolution = resolved.length > 0 ? (resolved.reduce((sum, t) => sum + (t.resolvedTime || 0), 0) / resolved.length).toFixed(1) : 0
  const csatScores = resolved.filter(t => t.csat).map(t => t.csat)
  const csat = csatScores.length > 0 ? (csatScores.reduce((a, b) => a + b, 0) / csatScores.length).toFixed(1) : 0
  const nps = Math.round(((parseFloat(csat) - 3) / 2) * 100)
  
  return { totalTickets, critical, slaCompliance: parseFloat(slaCompliance), avgResolution: parseFloat(avgResolution), csat: parseFloat(csat), nps, activeStaff: staffData.filter(s => property === 'all' || s.property === property).length * 7, productivity: 93.2 }
}

const computeTeamPerformance = (staff, department = 'all') => {
  const departments = ['engineering', 'housekeeping', 'it', 'fnb']
  const result = {}
  departments.forEach(dept => {
    const deptStaff = staff.filter(s => s.department === dept)
    result[dept] = (department === 'all' || department === dept) && deptStaff.length > 0 ? Math.round(deptStaff.reduce((sum, s) => sum + s.productivity, 0) / deptStaff.length) : 0
  })
  return { engineering: result.engineering || 0, housekeeping: result.housekeeping || 0, itSupport: result.it || 0, fnbService: result.fnb || 0 }
}

const computeYoYData = () => {
  const data2025 = historicalVolumeData[2025]
  const data2024 = historicalVolumeData[2024]
  const volumeComparison = data2025.map((d, i) => ({ month: d.month, year2025: d.tickets, year2024: data2024[i]?.tickets || 0 }))
  const resolutionTime = data2025.map((d, i) => ({ month: d.month, year2025: d.avgResolution, year2024: data2024[i]?.avgResolution || 0 }))
  const totalVolume2025 = data2025.reduce((sum, d) => sum + d.tickets, 0)
  const totalVolume2024 = data2024.reduce((sum, d) => sum + d.tickets, 0)
  const avgRes2025 = (data2025.reduce((sum, d) => sum + d.avgResolution, 0) / data2025.length).toFixed(1)
  const avgRes2024 = (data2024.reduce((sum, d) => sum + d.avgResolution, 0) / data2024.length).toFixed(1)
  
  return {
    volumeComparison, resolutionTime,
    kpiComparison: { sla: { year2025: 94.2, year2024: 87.5, change: 6.7 }, csat: { year2025: 4.7, year2024: 4.3, change: 0.4 }, response: { year2025: 3.2, year2024: 4.8, change: -33 }, resolution: { year2025: 92.8, year2024: 85.2, change: 7.6 } },
    totals: { volume2025: totalVolume2025, volume2024: totalVolume2024, volumeChange: Math.round(((totalVolume2025 - totalVolume2024) / totalVolume2024) * 100), resolution2025: parseFloat(avgRes2025), resolution2024: parseFloat(avgRes2024), resolutionChange: Math.round(((avgRes2025 - avgRes2024) / avgRes2024) * 100) }
  }
}

const computeFinancialData = () => {
  const data2025 = financialRecords[2025]
  const data2024 = financialRecords[2024]
  const totalExpenses = data2025.reduce((sum, d) => sum + d.expenses, 0)
  const totalRevenue = data2025.reduce((sum, d) => sum + d.revenue, 0)
  const totalProfit = data2025.reduce((sum, d) => sum + d.profit, 0)
  const margin = ((totalProfit / totalRevenue) * 100).toFixed(1)
  const prevExpenses = data2024.reduce((sum, d) => sum + d.expenses, 0)
  const prevRevenue = data2024.reduce((sum, d) => sum + d.revenue, 0)
  const prevProfit = data2024.reduce((sum, d) => sum + d.profit, 0)
  
  return {
    kpis: {
      expenses: { value: (totalExpenses / data2025.length).toFixed(2), change: (((totalExpenses - prevExpenses) / prevExpenses) * 100).toFixed(1) },
      revenue: { value: (totalRevenue / data2025.length).toFixed(2), change: (((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1) },
      netProfit: { value: (totalProfit / data2025.length).toFixed(2), change: (((totalProfit - prevProfit) / prevProfit) * 100).toFixed(1) },
      margin: { value: parseFloat(margin), change: 2.1 }
    },
    expensesVsProfit: data2025.map(d => ({ month: d.month, expenses: d.expenses, profit: d.profit })),
    expenseBreakdown: [
      { category: 'Labor', percentage: Math.round(expenseCategories.labor * 100), color: '#EF4444' },
      { category: 'Materials', percentage: Math.round(expenseCategories.materials * 100), color: '#F59E0B' },
      { category: 'Utilities', percentage: Math.round(expenseCategories.utilities * 100), color: '#6366F1' },
      { category: 'Other', percentage: Math.round(expenseCategories.other * 100), color: '#8B5CF6' }
    ],
    metrics: { costPerTicket: { value: 992, change: -12 }, revenuePerTicket: { value: 1567, change: 8 }, profitPerTicket: { value: 575, change: 22 }, roi: { value: 58, change: 5 } }
  }
}

const computeVolumeChartData = () => ({
  day: [
    { day: '00:00', value: 5, resolved: 4, pending: 1 }, { day: '03:00', value: 3, resolved: 3, pending: 0 },
    { day: '06:00', value: 8, resolved: 6, pending: 2 }, { day: '09:00', value: 15, resolved: 12, pending: 3 },
    { day: '12:00', value: 22, resolved: 18, pending: 4 }, { day: '15:00', value: 19, resolved: 16, pending: 3 },
    { day: '18:00', value: 17, resolved: 14, pending: 3 }, { day: '21:00', value: 11, resolved: 9, pending: 2 }
  ],
  week: [
    { day: 'Mon', value: 32, resolved: 28, pending: 4 }, { day: 'Tue', value: 41, resolved: 35, pending: 6 },
    { day: 'Wed', value: 38, resolved: 32, pending: 6 }, { day: 'Thu', value: 45, resolved: 40, pending: 5 },
    { day: 'Fri', value: 51, resolved: 44, pending: 7 }, { day: 'Sat', value: 28, resolved: 25, pending: 3 },
    { day: 'Sun', value: 24, resolved: 22, pending: 2 }
  ],
  month: [
    { day: 'Wk1', value: 145, resolved: 127, pending: 18 }, { day: 'Wk2', value: 168, resolved: 142, pending: 26 },
    { day: 'Wk3', value: 152, resolved: 135, pending: 17 }, { day: 'Wk4', value: 178, resolved: 158, pending: 20 }
  ]
})

const computeStatusDistribution = (tickets) => {
  const resolved = tickets.filter(t => t.status === 'resolved').length
  const inProgress = tickets.filter(t => t.status === 'in-progress').length
  const open = tickets.filter(t => t.status === 'open').length
  const total = tickets.length
  return {
    resolved: { count: resolved, percentage: total > 0 ? Math.round((resolved / total) * 100) : 0 },
    inProgress: { count: inProgress, percentage: total > 0 ? Math.round((inProgress / total) * 100) : 0 },
    open: { count: open, percentage: total > 0 ? Math.round((open / total) * 100) : 0 }
  }
}

const modules = [
  { id: 'dashboard', icon: '📊', title: 'Business Intelligence Dashboard', subtitle: 'OVERVIEW', features: ['Real-time ticket monitoring', 'Team performance metrics', 'SLA breach alerts', 'Executive summary views'], action: 'View Dashboard', color: 'dashboard' },
  { id: 'intake', icon: '📥', title: 'Ticket Intake & Classification', subtitle: 'SECTION A', features: ['Omni-channel ticket intake', 'Smart triage & prioritization', 'Auto-categorization rules', 'Duplicate detection'], action: 'Manage Intake', color: 'intake' },
  { id: 'assignment', icon: '👥', title: 'Assignment & Execution', subtitle: 'SECTION B', features: ['Intelligent auto-routing', 'Workforce scheduling', 'Mobile staff app', 'Real-time dispatch'], action: 'Manage Assignments', color: 'assignment' },
  { id: 'service', icon: '⏱️', title: 'Service Levels & Controls', subtitle: 'SECTION C', features: ['SLA & escalation engine', 'Approval workflows', 'Quality checks & sign-offs', 'Breach notifications'], action: 'Manage SLAs', color: 'service' },
  { id: 'communication', icon: '💬', title: 'Communication & Guest Experience', subtitle: 'SECTION D', features: ['Communications hub', 'Guest feedback (CSAT/NPS)', 'Auto-notifications', 'Recovery workflows'], action: 'Manage Communications', color: 'communication' },
  { id: 'financial', icon: '💳', title: 'Financial & Closure', subtitle: 'SECTION E', features: ['Billing & chargebacks', 'Ticket closure workflows', 'Resolution codes', 'Cost tracking'], action: 'Manage Financials', color: 'financial' },
  { id: 'admin', icon: '⚙️', title: 'Admin & Settings', subtitle: 'CONFIGURATION', features: ['User & role management', 'Category configuration', 'SLA policy setup', 'System preferences'], action: 'Configure System', color: 'admin' }
]

const dashboardTabs = [
  { id: 'bi', title: 'Business Intelligence Dashboard', description: 'Real-time monitoring and executive insights', icon: '📊' },
  { id: 'yoy', title: 'Year-over-Year Analysis', description: 'Current vs previous year performance', icon: '📈' },
  { id: 'financial', title: 'Financial Dashboard', description: 'Service operations expenses and profitability', icon: '💰' }
]

function DashboardSectionA() {
  const navigate = useNavigate()
  
  // Maintenance Mode - Set to false to restore normal functionality
  const isUnderMaintenance = false
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [dashboardTab, setDashboardTab] = useState('bi')
  const [activeTab, setActiveTab] = useState('dispatch')
  const [selectedBar, setSelectedBar] = useState(null)
  
  // Dashboard filters and chart period
  const [chartPeriod, setChartPeriod] = useState('week')
  const [property, setProperty] = useState('all')
  const [dateRange, setDateRange] = useState('today')
  const [department, setDepartment] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  
  // Form state for intake
  const [channel, setChannel] = useState('')
  const [requester, setRequester] = useState('')
  const [contact, setContact] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [triageData, setTriageData] = useState({ priority: 'P3', sla: '4 hours', team: 'General Pool' })
  const [validationError, setValidationError] = useState('')
  const [hoveredVolumeBar, setHoveredVolumeBar] = useState(null)
  const [hoveredResolutionPoint, setHoveredResolutionPoint] = useState(null)
  const [hoveredFinancialBar, setHoveredFinancialBar] = useState(null)

  const showLanding = () => setCurrentView('landing')
  const showDashboard = () => setCurrentView('dashboard')
  const showIntake = () => setCurrentView('intake')
  const showAssignment = () => setCurrentView('assignment')

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

  const handleModuleAction = (moduleId) => {
    switch(moduleId) {
      case 'dashboard': showDashboard(); break
      case 'intake': showIntake(); break
      case 'assignment': navigate('/section-b'); break
      case 'service': navigate('/section-c'); break
      case 'communication': navigate('/section-d'); break
      case 'financial': navigate('/section-e'); break
      case 'admin': navigate('/admin'); break
    }
  }

  const updateTriage = () => {
    const triageMap = {
      'housekeeping': { priority: 'P3', sla: '4 hours', team: 'Housekeeping' },
      'maintenance': { priority: 'P2', sla: '2 hours', team: 'Engineering' },
      'engineering': { priority: 'P2', sla: '2 hours', team: 'Engineering' },
      'it-support': { priority: 'P2', sla: '2 hours', team: 'IT Support' },
      'fnb': { priority: 'P3', sla: '30 minutes', team: 'F&B Service' },
      'emergency': { priority: 'P1', sla: '15 minutes', team: 'Emergency Response' }
    }
    setTriageData(triageMap[category] || { priority: 'P3', sla: '4 hours', team: 'General Pool' })
  }

  useEffect(() => {
    updateTriage()
  }, [category])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!channel || !requester || !contact || !location || !category || !description) {
      setValidationError('Please fill in all required fields.')
      return
    }
    setValidationError('')
    alert('✅ Ticket created successfully!\n\nTicket ID: TK-' + Math.floor(Math.random() * 90000 + 10000))
    resetForm()
  }

  const resetForm = () => {
    setChannel('')
    setRequester('')
    setContact('')
    setLocation('')
    setCategory('')
    setDescription('')
    setValidationError('')
  }

  // Compute data from centralized data source
  const volumeChartData = useMemo(() => computeVolumeChartData(ticketsData), [])
  const yoyData = useMemo(() => computeYoYData(historicalVolumeData, financialRecords), [])
  const financialData = useMemo(() => computeFinancialData(financialRecords, expenseCategories), [])
  const statusDistribution = useMemo(() => computeStatusDistribution(ticketsData), [])

  // Compute stats based on selected filters
  const stats = useMemo(() => computeBIStats(ticketsData, property, department), [property, department])
  const teamPerf = useMemo(() => computeTeamPerformance(staffData, department), [department])
  
  const currentChartData = volumeChartData[chartPeriod]
  const chartTotal = currentChartData.reduce((sum, d) => sum + d.value, 0)
  const chartMax = Math.max(...currentChartData.map(d => d.value))
  const chartAvg = Math.round(chartTotal / currentChartData.length)
  const peakDay = currentChartData.reduce((max, d) => d.value > max.value ? d : max, currentChartData[0])
  const selectedDashboardTab = dashboardTabs.find(tab => tab.id === dashboardTab) || dashboardTabs[0]

  const handleRefreshChart = () => {
    setRefreshing(true)
    // Simulate API call delay
    setTimeout(() => {
      setRefreshing(false)
      // Force re-render by updating a state that triggers chart recalculation
      setSelectedBar(null)
    }, 1000)
  }

  return (
    <div className="font-sans bg-gray-50 min-h-screen text-gray-800">
      <Sidebar collapsed={sidebarCollapsed} onNavigate={navigateToModule} />
      <SidebarToggle collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {isUnderMaintenance ? (
        // Maintenance Mode View
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'sidebar-collapsed-margin' : 'with-sidebar'}`}>
          <div className="flex items-center justify-center min-h-screen p-6">
            <div className="text-center max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="inline-block animate-bounce">
                  <span className="text-9xl">🛠️</span>
                </div>
              </div>
              
              <h1 className="text-5xl font-bold text-gray-800 mb-4">We'll Be Right Back Soon!</h1>
              <p className="text-2xl text-gray-600 mb-8">
                This page is currently undergoing scheduled maintenance
              </p>
              
              <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 shadow-lg mb-8">
                <div className="flex items-start gap-4 text-left">
                  <span className="text-4xl flex-shrink-0">⏰</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Maintenance Window</h3>
                    <p className="text-gray-600 text-lg">
                      We're performing system upgrades to serve you better. This page will be back online shortly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <span className="text-3xl mb-2 block">🔧</span>
                  <h4 className="font-semibold text-gray-800 mb-1">System Upgrade</h4>
                  <p className="text-sm text-gray-600">Enhancing performance</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <span className="text-3xl mb-2 block">🚀</span>
                  <h4 className="font-semibold text-gray-800 mb-1">New Features</h4>
                  <p className="text-sm text-gray-600">Coming your way</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <span className="text-3xl mb-2 block">🔒</span>
                  <h4 className="font-semibold text-gray-800 mb-1">Security Updates</h4>
                  <p className="text-sm text-gray-600">Keeping you safe</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </div>

              <div className="text-gray-500">
                <p className="text-lg mb-2">Thank you for your patience!</p>
                <p className="text-sm">
                  
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <Header 
            collapsed={sidebarCollapsed}
          />

      <div className={`max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${sidebarCollapsed ? 'sidebar-collapsed-margin' : 'with-sidebar'}`}>
        {/* Landing Page View */}
        {currentView === 'landing' && (
          <div>
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6 flex items-center gap-2 flex-wrap">
              <span className="text-xl">🎯</span>
              <span className="text-gray-900 font-bold">SERVICE OPERATIONS MODULES</span>
              <span className="text-[13px] font-normal text-gray-500 normal-case tracking-normal ml-2 pl-4 border-l-2 border-gray-300">Complete Service Management Workflow</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {modules.map((module, idx) => (
                <div key={module.id} className={`module-card ${module.color} bg-white rounded-xl p-6 border border-gray-200 shadow-sm relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-gray-300 hover:-translate-y-1`}>
                  <div className={`absolute top-0 left-0 right-0 h-[5px] ${
                    module.color === 'dashboard' ? 'bg-red-500' :
                    module.color === 'intake' ? 'bg-amber-500' :
                    module.color === 'assignment' ? 'bg-violet-500' :
                    module.color === 'service' ? 'bg-cyan-500' :
                    module.color === 'communication' ? 'bg-emerald-500' :
                    module.color === 'financial' ? 'bg-indigo-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl">{module.icon}</div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{module.subtitle}</div>
                      <h3 className="text-lg font-bold text-gray-800">{module.title}</h3>
                    </div>
                  </div>
                  <ul className="mb-5 pl-4">
                    {module.features.map((feature, i) => (
                      <li key={i} className="text-[13px] text-gray-500 py-1 relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-red-500 before:font-bold">{feature}</li>
                    ))}
                  </ul>
                  <button 
                    className="w-full py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    onClick={() => handleModuleAction(module.id)}
                  >
                    <span>→</span> {module.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <span className="text-red-500 cursor-pointer hover:text-red-600 hover:underline" onClick={showLanding}>🏠 Home</span>
              <span className="text-gray-300">›</span>
              <span>{selectedDashboardTab.title}</span>
            </div>

            {/* Dashboard Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {dashboardTabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`relative rounded-2xl bg-white p-5 cursor-pointer transition-all duration-200 ${
                    dashboardTab === tab.id
                      ? 'border-2 border-red-300 ring-4 ring-red-100 shadow-lg'
                      : 'border border-gray-200 hover:border-red-200 hover:shadow-md'
                  }`}
                  onClick={() => setDashboardTab(tab.id)}
                >
                  <div className="absolute inset-y-0 left-0 w-[6px] rounded-l-2xl bg-red-400"></div>
                  <div className="flex items-start gap-3 pl-1">
                    <span className="text-2xl leading-none mt-[2px]">{tab.icon}</span>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-900">{tab.title}</h3>
                      <p className="text-sm text-gray-500">{tab.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {dashboardTab === 'bi' ? (
              <>
                {/* Dashboard Filters */}
                <div className="bg-white p-5 rounded-xl mb-4 border border-gray-200 flex gap-4 flex-wrap items-center">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Property</label>
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 min-w-[150px]" value={property} onChange={(e) => setProperty(e.target.value)}>
                      <option value="all">All Properties</option>
                      <option value="manila">SOGO Hotel Manila</option>
                      <option value="quezon">SOGO Hotel Quezon City</option>
                      <option value="makati">SOGO Hotel Makati</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Date Range</label>
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 min-w-[150px]" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                      <option value="today">Today</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 min-w-[150px]" value={department} onChange={(e) => setDepartment(e.target.value)}>
                      <option value="all">All Departments</option>
                      <option value="engineering">Engineering</option>
                      <option value="housekeeping">Housekeeping</option>
                      <option value="it">IT Support</option>
                      <option value="fnb">F&B Service</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Auto-Refresh</label>
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 min-w-[150px]" value={autoRefresh} onChange={(e) => setAutoRefresh(Number(e.target.value))}>
                      <option value="0">Off</option>
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="300">5 minutes</option>
                    </select>
                  </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-5 border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Total Tickets</div>
                      <div className="text-2xl opacity-60">📋</div>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-800 mb-2">{stats.totalTickets}</div>
                    <div className="inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">
                      ↑ 12% <span className="font-normal opacity-70">vs last period</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Critical (P1)</div>
                      <div className="text-2xl opacity-60">🚨</div>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-800 mb-2">{stats.critical}</div>
                    <div className="inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-0.5 rounded bg-red-100 text-red-800">
                      ↑ {stats.critical} <span className="font-normal opacity-70">needs attention</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">SLA Compliance</div>
                      <div className="text-2xl opacity-60">✅</div>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-800 mb-2">{stats.slaCompliance}%</div>
                    <div className="inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">
                      ↑ 2.1% <span className="font-normal opacity-70">improved</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Avg Resolution Time</div>
                      <div className="text-2xl opacity-60">⏱️</div>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-800 mb-2">{stats.avgResolution}h</div>
                    <div className="inline-flex items-center gap-1 text-[13px] font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800">
                      ↓ 18min <span className="font-normal opacity-70">faster</span>
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                  <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-gray-100 flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-gray-800">📈 Ticket Volume Trend</h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="font-semibold">Live</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button 
                          className={`px-3 py-1.5 border rounded-md text-xs font-semibold transition-all ${
                            chartPeriod === 'day'
                              ? 'border-red-500 bg-red-500 text-white'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-red-500 hover:text-red-500'
                          }`}
                          onClick={() => setChartPeriod('day')}
                        >
                          📅 Day
                        </button>
                        <button 
                          className={`px-3 py-1.5 border rounded-md text-xs font-semibold transition-all ${
                            chartPeriod === 'week'
                              ? 'border-red-500 bg-red-500 text-white'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-red-500 hover:text-red-500'
                          }`}
                          onClick={() => setChartPeriod('week')}
                        >
                          📊 Week
                        </button>
                        <button 
                          className={`px-3 py-1.5 border rounded-md text-xs font-semibold transition-all ${
                            chartPeriod === 'month'
                              ? 'border-red-500 bg-red-500 text-white'
                              : 'border-gray-200 bg-white text-gray-500 hover:border-red-500 hover:text-red-500'
                          }`}
                          onClick={() => setChartPeriod('month')}
                        >
                          📆 Month
                        </button>
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                        <button 
                          className="px-3 py-1.5 border border-emerald-500 bg-emerald-500 text-white rounded-md text-xs font-semibold hover:bg-emerald-600 transition-all flex items-center gap-1"
                          onClick={() => {
                            const csvContent = 'Period,Total,Resolved,Pending\n' + 
                              currentChartData.map(d => `${d.day},${d.value},${d.resolved},${d.pending}`).join('\n');
                            const blob = new Blob([csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ticket-volume-${chartPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                          }}
                        >
                          📥 Export Excel
                        </button>
                        <button 
                          className="px-3 py-1.5 border border-blue-500 bg-blue-500 text-white rounded-md text-xs font-semibold hover:bg-blue-600 transition-all flex items-center gap-1 disabled:opacity-50"
                          onClick={handleRefreshChart}
                          disabled={refreshing}
                        >
                          <span className={refreshing ? 'inline-block animate-spin' : ''}>🔄</span> {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                      </div>
                    </div>
                    <div className={`h-64 flex items-end justify-around gap-3 px-4 py-5 transition-opacity duration-300 ${refreshing ? 'opacity-50' : 'opacity-100'}`}>
                      {currentChartData.map((data, idx) => (
                        <div 
                          key={idx} 
                          className="flex flex-col items-center gap-2 flex-1 cursor-pointer"
                          onClick={() => setSelectedBar(idx)}
                        >
                          <div className="text-sm font-bold text-gray-800">{data.value}</div>
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-300 bg-gradient-to-t from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 ${selectedBar === idx ? 'ring-2 ring-red-300' : ''}`}
                            style={{ height: `${(data.value / chartMax) * 180}px` }}
                          ></div>
                          <div className="text-xs font-semibold text-gray-500">{data.day}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between px-6 pt-4 border-t-2 border-gray-100 mt-4 bg-gradient-to-b from-gray-50 to-white flex-wrap gap-4">
                      <div className="text-center flex-1 min-w-[120px]">
                        <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">Total Tickets</div>
                        <div className="text-3xl font-extrabold text-red-500">{chartTotal}</div>
                      </div>
                      <div className="text-center flex-1 min-w-[120px]">
                        <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">Average</div>
                        <div className="text-3xl font-extrabold text-emerald-500">{chartAvg}</div>
                      </div>
                      <div className="text-center flex-1 min-w-[120px]">
                        <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">Peak Period</div>
                        <div className="text-lg font-extrabold text-gray-800 mt-1.5">{peakDay.day}</div>
                        <div className="text-[10px] text-amber-500 mt-0.5 font-semibold">{peakDay.value} tickets</div>
                      </div>
                      <div className="text-center flex-1 min-w-[120px]">
                        <div className="text-[11px] text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">Trend</div>
                        <div className="text-2xl font-extrabold mt-1.5 text-emerald-500">↗</div>
                        <div className="text-[10px] mt-0.5 font-semibold text-emerald-500">+12% growth</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-gray-100">
                      <h3 className="text-base font-bold text-gray-800">🎯 Ticket Status Distribution</h3>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-48 h-48 rounded-full relative mx-auto" style={{
                        background: `conic-gradient(
                          #10b981 0deg ${statusDistribution.resolved.percentage * 3.6}deg, 
                          #f59e0b ${statusDistribution.resolved.percentage * 3.6}deg ${(statusDistribution.resolved.percentage + statusDistribution.inProgress.percentage) * 3.6}deg, 
                          #ef4444 ${(statusDistribution.resolved.percentage + statusDistribution.inProgress.percentage) * 3.6}deg 360deg
                        )`
                      }}>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] bg-white rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-extrabold text-gray-800">{statusDistribution.resolved.count + statusDistribution.inProgress.count + statusDistribution.open.count}</div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 mt-5 w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded bg-emerald-500"></div>
                          <span className="flex-1 text-[13px] text-gray-500">Resolved</span>
                          <span className="text-sm font-bold text-gray-800">{statusDistribution.resolved.count} ({statusDistribution.resolved.percentage}%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded bg-amber-500"></div>
                          <span className="flex-1 text-[13px] text-gray-500">In Progress</span>
                          <span className="text-sm font-bold text-gray-800">{statusDistribution.inProgress.count} ({statusDistribution.inProgress.percentage}%)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded bg-red-500"></div>
                          <span className="flex-1 text-[13px] text-gray-500">Open</span>
                          <span className="text-sm font-bold text-gray-800">{statusDistribution.open.count} ({statusDistribution.open.percentage}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Three Column Grid: Team Performance, SLA Alerts, Real-Time Tickets */}
                <div className="flex gap-5 mb-6 items-stretch">

                  {/* Team Performance */}
                  {/* <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-xl">👥</span>
                      <h3 className="text-lg font-bold text-gray-800">Team Performance</h3>
                    </div>
                    <div className="space-y-5">
                      {teamPerf.engineering > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Engineering</span>
                            <span className="text-sm font-bold text-gray-800">{teamPerf.engineering}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${teamPerf.engineering}%` }}></div>
                          </div>
                        </div>
                      )}
                      {teamPerf.housekeeping > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Housekeeping</span>
                            <span className="text-sm font-bold text-gray-800">{teamPerf.housekeeping}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${teamPerf.housekeeping}%` }}></div>
                          </div>
                        </div>
                      )}
                      {teamPerf.itSupport > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">IT Support</span>
                            <span className="text-sm font-bold text-gray-800">{teamPerf.itSupport}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${teamPerf.itSupport}%` }}></div>
                          </div>
                        </div>
                      )}
                      {teamPerf.fnbService > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">F&B Service</span>
                            <span className="text-sm font-bold text-gray-800">{teamPerf.fnbService}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${teamPerf.fnbService}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div> */}

                  {/* SLA Alerts */}
                  {/* <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-xl">🚨</span>
                      <h3 className="text-lg font-bold text-gray-800">SLA Alerts</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-gray-800">TKT-145 • P1</span>
                              <span className="text-xs text-red-600 font-semibold">2h overdue</span>
                            </div>
                            <p className="text-sm text-gray-600">AC failure Room 405</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 bg-amber-500 rounded-full mt-1 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-gray-800">TKT-143 • P2</span>
                              <span className="text-xs text-amber-600 font-semibold">30m warning</span>
                            </div>
                            <p className="text-sm text-gray-600">Water leak Room 302</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {/* Real-Time Tickets */}
                  {/* <div className="flex-1 bg-white rounded-xl p-6 border border-gray-200 relative">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-xl">⚡</span>
                      <h3 className="text-lg font-bold text-gray-800">Real-Time Tickets</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="relative p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-300 transition-colors">
                        <div className="absolute left-0 top-0 h-full w-1 bg-red-500 rounded-l"></div>
                        <div className="flex-1 min-w-0 pl-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-gray-800">TKT-150</span>
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">P1</span>
                          </div>
                          <p className="text-sm text-gray-600">Elevator stuck 3-4</p>
                        </div>
                      </div>
                      <div className="relative p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-amber-300 transition-colors">
                        <div className="absolute left-0 top-0 h-full w-1 bg-amber-500 rounded-l"></div>
                        <div className="flex-1 min-w-0 pl-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-gray-800">TKT-149</span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">P2</span>
                          </div>
                          <p className="text-sm text-gray-600">Room service delay</p>
                        </div>
                      </div>
                    </div>
                  </div> */}

                </div>
                
                {/* Guest Satisfaction & Executive Summary */}
                {/* <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-gray-100">
                    <span className="text-xl">⭐</span>
                    <h3 className="text-lg font-bold text-gray-800">Guest Satisfaction & Executive Summary</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-emerald-500 mb-1">{stats.csat}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">CSAT Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-amber-500 mb-1">{stats.nps}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">NPS Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-red-500 mb-1">3.2m</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">First Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-emerald-500 mb-1">{stats.slaCompliance}%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Resolution Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-violet-500 mb-1">{stats.activeStaff}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Active Staff</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-extrabold text-amber-500 mb-1">{stats.productivity}%</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Productivity</div>
                    </div>
                  </div>
                </div> */}
                
              </>
            ) : dashboardTab === 'yoy' ? (
              <>
                {/* Year-over-Year Analysis Content */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-3">
                  {/* Volume Comparison */}
                  <div className="bg-white rounded-xl p-3 border border-gray-200 lg:col-span-3">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-gray-100">
                      <span className="text-base">📈</span>
                      <h3 className="text-sm font-bold text-gray-800">Volume Comparison</h3>
                    </div>
                    {(() => {
                      const maxValue = Math.max(...yoyData.volumeComparison.map(d => Math.max(d.year2025, d.year2024)))
                      const yMax = Math.ceil(maxValue / 50) * 50 + 50
                      const yTicks = Array.from({ length: Math.floor(yMax / 50) + 1 }, (_, i) => i * 50)
                      return (
                        <div className="relative" style={{ height: '240px' }}>
                          {/* Grid lines */}
                          <div className="absolute inset-x-3 left-10 top-3 bottom-16 flex flex-col justify-between pointer-events-none">
                            {yTicks.map((tick) => (
                              <div key={tick} className="border-t border-gray-100 flex-1"></div>
                            ))}
                          </div>
                          {/* Y labels */}
                          <div className="absolute left-0 top-3 bottom-16 flex flex-col-reverse justify-between text-[10px] font-semibold text-gray-400">
                            {yTicks.map((tick) => (
                              <div key={tick} className="-mt-[1px]">{tick}</div>
                            ))}
                          </div>
                          {/* Legend */}
                          <div className="absolute left-0 right-0 -top-1 flex justify-center items-center gap-4 text-xs font-semibold text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#FF4E45]"></span>
                              <span>2025</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                              <span>2024</span>
                            </div>
                          </div>
                          {/* Bars */}
                          <div className="absolute left-10 right-3 top-6 bottom-16 flex items-end gap-2">
                            {yoyData.volumeComparison.map((data, idx) => (
                              <div 
                                key={idx} 
                                className="flex flex-col items-center gap-1 flex-1 min-w-[22px] relative"
                                onMouseEnter={() => setHoveredVolumeBar(idx)}
                                onMouseLeave={() => setHoveredVolumeBar(null)}
                              >
                                {/* Tooltip */}
                                {hoveredVolumeBar === idx && (
                                  <div className="absolute bottom-full mb-2 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap text-xs font-semibold">
                                    <div className="mb-1">{data.month}</div>
                                    <div className="text-[#FF4E45]">2025: {data.year2025}</div>
                                    <div className="text-gray-300">2024: {data.year2024}</div>
                                    <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                                  </div>
                                )}
                                <div className="flex items-end gap-1">
                                  <div
                                    className="w-[18px] rounded-t-lg bg-[#FF4E45] hover:bg-[#ff3830] transition-all cursor-pointer"
                                    style={{ height: `${(data.year2025 / yMax) * 160}px` }}
                                  ></div>
                                  <div
                                    className="w-[18px] rounded-t-lg bg-gray-300 hover:bg-gray-200 transition-all cursor-pointer"
                                    style={{ height: `${(data.year2024 / yMax) * 160}px` }}
                                  ></div>
                                </div>
                                <div className="text-[10px] font-semibold text-gray-500 mt-1">{data.month}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                    <div className="flex justify-around pt-4 px-6 mt-2 border-t-2 border-gray-100">
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 uppercase mb-1 font-semibold">2025</div>
                        <div className="text-xl font-extrabold text-[#FF4E45]">{yoyData.totals.volume2025.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ {yoyData.totals.volumeChange}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 uppercase mb-1 font-semibold">2024</div>
                        <div className="text-xl font-extrabold text-gray-500">{yoyData.totals.volume2024.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Resolution Time */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-100">
                      <span className="text-base">⏱️</span>
                      <h3 className="text-sm font-bold text-gray-800">Resolution Time</h3>
                    </div>
                    {(() => {
                      const yMax = 6
                      const yTicks = [0, 1, 2, 3, 4, 5, 6]
                      const data = yoyData.resolutionTime
                      const chartWidth = 100
                      const chartHeight = 100
                      const padding = { left: 0, right: 0, top: 5, bottom: 5 }
                      
                      // Helper function to create smooth bezier curve path
                      const createSmoothPath = (points, fill = false) => {
                        if (points.length < 2) return ''
                        
                        let path = `M ${points[0].x},${points[0].y}`
                        
                        for (let i = 1; i < points.length; i++) {
                          const prev = points[i - 1]
                          const curr = points[i]
                          const cp1x = prev.x + (curr.x - prev.x) * 0.4
                          const cp2x = prev.x + (curr.x - prev.x) * 0.6
                          path += ` C ${cp1x},${prev.y} ${cp2x},${curr.y} ${curr.x},${curr.y}`
                        }
                        
                        if (fill) {
                          path += ` L ${points[points.length - 1].x},${chartHeight} L ${points[0].x},${chartHeight} Z`
                        }
                        
                        return path
                      }
                      
                      // Calculate points for 2025 data
                      const points2025 = data.map((d, i) => ({
                        x: (i / (data.length - 1)) * (chartWidth - padding.left - padding.right) + padding.left,
                        y: chartHeight - padding.bottom - ((d.year2025 / yMax) * (chartHeight - padding.top - padding.bottom))
                      }))
                      
                      // Calculate points for 2024 data
                      const points2024 = data.map((d, i) => ({
                        x: (i / (data.length - 1)) * (chartWidth - padding.left - padding.right) + padding.left,
                        y: chartHeight - padding.bottom - ((d.year2024 / yMax) * (chartHeight - padding.top - padding.bottom))
                      }))
                      
                      return (
                        <div className="relative" style={{ height: '260px' }}>
                          {/* Legend - positioned at top */}
                          <div className="flex justify-center items-center gap-6 mb-4 text-xs font-semibold text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                              <span>2025 (hours)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                              <span>2024 (hours)</span>
                            </div>
                          </div>
                          
                          {/* Chart area */}
                          <div className="flex h-[180px]">
                            {/* Y-axis labels */}
                            <div className="flex flex-col justify-between text-[10px] font-semibold text-gray-400 pr-2 py-1">
                              {[...yTicks].reverse().map((tick) => (
                                <div key={tick} className="h-0 leading-none">{tick}h</div>
                              ))}
                            </div>
                            
                            {/* Chart SVG */}
                            <div className="flex-1 relative">
                              {/* Grid lines */}
                              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {yTicks.map((tick) => (
                                  <div key={tick} className="border-t border-gray-100 w-full"></div>
                                ))}
                              </div>
                              
                              <svg 
                                className="absolute inset-0 w-full h-full" 
                                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                                preserveAspectRatio="none"
                              >
                                {/* 2024 filled area (gray, behind) */}
                                <path
                                  d={createSmoothPath(points2024, true)}
                                  fill="rgba(209, 213, 219, 0.15)"
                                  stroke="none"
                                />
                                
                                {/* 2025 filled area (green) */}
                                <path
                                  d={createSmoothPath(points2025, true)}
                                  fill="rgba(16, 185, 129, 0.15)"
                                  stroke="none"
                                />
                                
                                {/* 2024 line (dashed gray) */}
                                <path
                                  d={createSmoothPath(points2024)}
                                  fill="none"
                                  stroke="#d1d5db"
                                  strokeWidth="2"
                                  strokeDasharray="4,4"
                                  vectorEffect="non-scaling-stroke"
                                />
                                
                                {/* 2025 line (solid green) */}
                                <path
                                  d={createSmoothPath(points2025)}
                                  fill="none"
                                  stroke="#10b981"
                                  strokeWidth="3"
                                  vectorEffect="non-scaling-stroke"
                                />
                              </svg>
                              
                              {/* Data points for 2025 */}
                              {data.map((d, i) => {
                                const xPercent = (i / (data.length - 1)) * 100
                                const yPercent = 100 - ((d.year2025 / yMax) * 100)
                                return (
                                  <div
                                    key={i}
                                    className="absolute w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm cursor-pointer hover:scale-125 transition-transform z-10"
                                    style={{
                                      left: `calc(${xPercent}% - 6px)`,
                                      top: `calc(${yPercent}% - 6px)`
                                    }}
                                    onMouseEnter={() => setHoveredResolutionPoint(i)}
                                    onMouseLeave={() => setHoveredResolutionPoint(null)}
                                  />
                                )
                              })}
                              
                              {/* Data points for 2024 */}
                              {data.map((d, i) => {
                                const xPercent = (i / (data.length - 1)) * 100
                                const yPercent = 100 - ((d.year2024 / yMax) * 100)
                                return (
                                  <div
                                    key={`2024-${i}`}
                                    className="absolute w-2.5 h-2.5 bg-gray-300 border-2 border-white rounded-full shadow-sm"
                                    style={{
                                      left: `calc(${xPercent}% - 5px)`,
                                      top: `calc(${yPercent}% - 5px)`
                                    }}
                                  />
                                )
                              })}
                              
                              {/* Tooltip */}
                              {hoveredResolutionPoint !== null && (() => {
                                const d = data[hoveredResolutionPoint]
                                const xPercent = (hoveredResolutionPoint / (data.length - 1)) * 100
                                const yPercent = 100 - ((d.year2025 / yMax) * 100)
                                return (
                                  <div 
                                    className="absolute bg-gray-800 text-white px-3 py-2 rounded-lg shadow-xl z-20 whitespace-nowrap text-xs font-semibold pointer-events-none"
                                    style={{
                                      left: `${xPercent}%`,
                                      top: `calc(${yPercent}% - 65px)`,
                                      transform: 'translateX(-50%)'
                                    }}
                                  >
                                    <div className="mb-1 text-center border-b border-gray-600 pb-1">{d.month}</div>
                                    <div className="text-emerald-400">2025: {d.year2025}h</div>
                                    <div className="text-gray-300">2024: {d.year2024}h</div>
                                    <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45"></div>
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                          
                          {/* X-axis labels */}
                          <div className="flex justify-between pl-6 pr-0 mt-2 text-[10px] font-semibold text-gray-500">
                            {data.map((d) => (
                              <div key={d.month} className="text-center">{d.month}</div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                    <div className="flex justify-around pt-4 px-6 mt-2 border-t-2 border-gray-100">
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 uppercase mb-1 font-semibold">2025 Avg</div>
                        <div className="text-xl font-extrabold text-emerald-500">{yoyData.totals.resolution2025}h</div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">↓ {Math.abs(yoyData.totals.resolutionChange)}% faster</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 uppercase mb-1 font-semibold">2024 Avg</div>
                        <div className="text-xl font-extrabold text-gray-500">{yoyData.totals.resolution2024}h</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KPI Comparison */}
                {/* <div className="bg-white rounded-xl p-3 border border-gray-200 mb-3">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-gray-100">
                    <span className="text-base">📊</span>
                    <h3 className="text-sm font-bold text-gray-800">KPI Comparison</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4">
                    <div className="bg-gray-50 p-3 rounded-lg border-l-3 border-[#FF4E45]" style={{ borderLeftWidth: '3px' }}>
                      <div className="text-[10px] text-gray-500 font-semibold mb-1.5">SLA</div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xl font-extrabold text-[#FF4E45]">{yoyData.kpiComparison.sla.year2025}%</span>
                        <span className="text-base font-bold text-gray-300">{yoyData.kpiComparison.sla.year2024}%</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">↑ {yoyData.kpiComparison.sla.change}%</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border-l-3 border-emerald-500" style={{ borderLeftWidth: '3px' }}>
                      <div className="text-[10px] text-gray-500 font-semibold mb-1.5">CSAT</div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xl font-extrabold text-emerald-500">{yoyData.kpiComparison.csat.year2025}</span>
                        <span className="text-base font-bold text-gray-300">{yoyData.kpiComparison.csat.year2024}</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">↑ {yoyData.kpiComparison.csat.change}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border-l-3 border-amber-500" style={{ borderLeftWidth: '3px' }}>
                      <div className="text-[10px] text-gray-500 font-semibold mb-1.5">RESPONSE</div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xl font-extrabold text-amber-500">{yoyData.kpiComparison.response.year2025}m</span>
                        <span className="text-base font-bold text-gray-300">{yoyData.kpiComparison.response.year2024}m</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">↓ {Math.abs(yoyData.kpiComparison.response.change)}%</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border-l-3 border-indigo-500" style={{ borderLeftWidth: '3px' }}>
                      <div className="text-[10px] text-gray-500 font-semibold mb-1.5">RESOLUTION</div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xl font-extrabold text-indigo-500">{yoyData.kpiComparison.resolution.year2025}%</span>
                        <span className="text-base font-bold text-gray-300">{yoyData.kpiComparison.resolution.year2024}%</span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">↑ {yoyData.kpiComparison.resolution.change}%</div>
                    </div>
                  </div>
                </div> */}
              </>

            ) : dashboardTab === 'financial' ? (
              <>
                {/* Financial KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Expenses */}
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-4xl opacity-40">💸</div>
                    <div className="relative z-10">
                      <div className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-90">EXPENSES</div>
                      <div className="text-4xl font-extrabold mb-2">₱{financialData.kpis.expenses.value}M</div>
                      <div className="inline-flex items-center gap-1 text-sm font-semibold">
                        ↑ {financialData.kpis.expenses.change}%
                      </div>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-4xl opacity-40">💰</div>
                    <div className="relative z-10">
                      <div className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-90">REVENUE</div>
                      <div className="text-4xl font-extrabold mb-2">₱{financialData.kpis.revenue.value}M</div>
                      <div className="inline-flex items-center gap-1 text-sm font-semibold">
                        ↑ {financialData.kpis.revenue.change}%
                      </div>
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-4xl opacity-40">📈</div>
                    <div className="relative z-10">
                      <div className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-90">NET PROFIT</div>
                      <div className="text-4xl font-extrabold mb-2">₱{financialData.kpis.netProfit.value}M</div>
                      <div className="inline-flex items-center gap-1 text-sm font-semibold">
                        ↑ {financialData.kpis.netProfit.change}%
                      </div>
                    </div>
                  </div>

                  {/* Margin */}
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-4xl opacity-40">📊</div>
                    <div className="relative z-10">
                      <div className="text-sm font-semibold uppercase tracking-wider mb-3 opacity-90">MARGIN</div>
                      <div className="text-4xl font-extrabold mb-2">{financialData.kpis.margin.value}%</div>
                      <div className="inline-flex items-center gap-1 text-sm font-semibold">
                        ↑ {financialData.kpis.margin.change}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Expenses vs Profit Chart */}
                  <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-gray-100">
                      <span className="text-xl">💸</span>
                      <h3 className="text-lg font-bold text-gray-800">Expenses vs Profit</h3>
                    </div>
                    {(() => {
                      const maxValue = Math.max(...financialData.expensesVsProfit.map(d => Math.max(d.expenses, d.profit)))
                      const yMax = Math.ceil(maxValue) + 0.5
                      const yTicks = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]
                      return (
                        <div className="relative" style={{ height: '280px' }}>
                          {/* Legend */}
                          <div className="absolute left-0 right-0 -top-1 flex justify-center items-center gap-4 text-xs font-semibold text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                              <span>Expenses</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                              <span>Profit</span>
                            </div>
                          </div>
                          {/* Grid lines */}
                          <div className="absolute inset-x-3 left-10 top-6 bottom-20 flex flex-col justify-between pointer-events-none">
                            {yTicks.map((tick) => (
                              <div key={tick} className="border-t border-gray-100 flex-1"></div>
                            ))}
                          </div>
                          {/* Y labels */}
                          <div className="absolute left-0 top-6 bottom-20 flex flex-col-reverse justify-between text-[10px] font-semibold text-gray-400">
                            {yTicks.map((tick) => (
                              <div key={tick} className="-mt-[1px]">₱{tick}M</div>
                            ))}
                          </div>
                          {/* Bars */}
                          <div className="absolute left-10 right-3 top-9 bottom-20 flex items-end gap-3">
                            {financialData.expensesVsProfit.map((data, idx) => (
                              <div 
                                key={idx} 
                                className="flex flex-col items-center gap-1 flex-1 relative"
                                onMouseEnter={() => setHoveredFinancialBar(idx)}
                                onMouseLeave={() => setHoveredFinancialBar(null)}
                              >
                                {/* Tooltip */}
                                {hoveredFinancialBar === idx && (
                                  <div className="absolute bottom-full mb-2 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap text-xs font-semibold">
                                    <div className="mb-1">{data.month}</div>
                                    <div className="text-[#EF4444]">Expenses: ₱{data.expenses}M</div>
                                    <div className="text-[#10B981]">Profit: ₱{data.profit}M</div>
                                    <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                                  </div>
                                )}
                                <div className="flex items-end gap-1.5 w-full justify-center">
                                  <div
                                    className="w-[14px] rounded-t-md bg-[#EF4444] hover:bg-[#DC2626] transition-all cursor-pointer"
                                    style={{ height: `${(data.expenses / yMax) * 170}px` }}
                                  ></div>
                                  <div
                                    className="w-[14px] rounded-t-md bg-[#10B981] hover:bg-[#059669] transition-all cursor-pointer"
                                    style={{ height: `${(data.profit / yMax) * 170}px` }}
                                  ></div>
                                </div>
                                <div className="text-[10px] font-semibold text-gray-500 mt-1">{data.month}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                    {/* Totals */}
                    <div className="flex justify-around pt-4 px-6 mt-2 border-t-2 border-gray-100">
                      <div className="text-center">
                        <div className="flex items-center gap-2 justify-center mb-1">
                          <span className="w-2 h-2 bg-[#EF4444] rounded-full"></span>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">EXPENSES</div>
                        </div>
                        <div className="text-2xl font-extrabold text-[#EF4444]">₱{financialData.kpis.expenses.value}M</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-2 justify-center mb-1">
                          <span className="w-2 h-2 bg-[#10B981] rounded-full"></span>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">PROFIT</div>
                        </div>
                        <div className="text-2xl font-extrabold text-[#10B981]">₱{financialData.kpis.netProfit.value}M</div>
                      </div>
                    </div>
                  </div>

                  {/* Expense Breakdown Donut Chart */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-gray-100">
                      <span className="text-xl">📊</span>
                      <h3 className="text-lg font-bold text-gray-800">Expense Breakdown</h3>
                    </div>
                    <div className="flex flex-col items-center">
                      {/* Donut Chart */}
                      <div className="relative w-56 h-56 mb-6">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                          {(() => {
                            let currentAngle = 0
                            return financialData.expenseBreakdown.map((item, idx) => {
                              const percentage = item.percentage
                              const angle = (percentage / 100) * 360
                              const startAngle = currentAngle
                              const endAngle = currentAngle + angle
                              
                              // Convert to radians
                              const startRad = (startAngle * Math.PI) / 180
                              const endRad = (endAngle * Math.PI) / 180
                              
                              // Calculate path for donut segment
                              const outerRadius = 45
                              const innerRadius = 28
                              
                              const x1 = 50 + outerRadius * Math.cos(startRad)
                              const y1 = 50 + outerRadius * Math.sin(startRad)
                              const x2 = 50 + outerRadius * Math.cos(endRad)
                              const y2 = 50 + outerRadius * Math.sin(endRad)
                              const x3 = 50 + innerRadius * Math.cos(endRad)
                              const y3 = 50 + innerRadius * Math.sin(endRad)
                              const x4 = 50 + innerRadius * Math.cos(startRad)
                              const y4 = 50 + innerRadius * Math.sin(startRad)
                              
                              const largeArc = angle > 180 ? 1 : 0
                              
                              const pathData = [
                                `M ${x1} ${y1}`,
                                `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
                                `L ${x3} ${y3}`,
                                `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                                'Z'
                              ].join(' ')
                              
                              currentAngle = endAngle
                              
                              return (
                                <path
                                  key={idx}
                                  d={pathData}
                                  fill={item.color}
                                  className="transition-opacity hover:opacity-80 cursor-pointer"
                                />
                              )
                            })
                          })()}
                        </svg>
                      </div>
                      {/* Legend */}
                      <div className="flex flex-col gap-3 w-full">
                        {financialData.expenseBreakdown.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                              <span className="text-sm text-gray-600">{item.category}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-800">{item.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Metrics Section
                <div className="bg-white rounded-xl p-6 border border-gray-200 mt-6">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-gray-100">
                    <span className="text-xl">💼</span>
                    <h3 className="text-lg font-bold text-gray-800">Financial Metrics</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    Cost per Ticket
                    <div className="bg-red-50 rounded-xl text-center p-6 border border-red-100">
                      <div className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-3">COST/TICKET</div>
                      <div className="text-3xl font-extrabold text-red-600 mb-2">₱{financialData.metrics.costPerTicket.value.toLocaleString()}</div>
                      <div className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                        ↓ {Math.abs(financialData.metrics.costPerTicket.change)}%
                      </div>
                    </div>

                    Revenue per Ticket
                    <div className="bg-emerald-50 text-center rounded-xl p-6 border border-emerald-100">
                      <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">REVENUE/TICKET</div>
                      <div className="text-3xl font-extrabold text-emerald-600 mb-2">₱{financialData.metrics.revenuePerTicket.value.toLocaleString()}</div>
                      <div className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                        ↑ {financialData.metrics.revenuePerTicket.change}%
                      </div>
                    </div>

                    Profit per Ticket
                    <div className="bg-amber-50 text-center rounded-xl p-6 border border-amber-100">
                      <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">PROFIT/TICKET</div>
                      <div className="text-3xl font-extrabold text-amber-600 mb-2">₱{financialData.metrics.profitPerTicket.value.toLocaleString()}</div>
                      <div className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                        ↑ {financialData.metrics.profitPerTicket.change}%
                      </div>
                    </div>

                    ROI
                    <div className="bg-indigo-50 text-center rounded-xl p-6 border border-indigo-100">
                      <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">ROI</div>
                      <div className="text-3xl font-extrabold text-indigo-600 mb-2">{financialData.metrics.roi.value}%</div>
                      <div className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
                        ↑ {financialData.metrics.roi.change}%
                      </div>
                    </div>
                  </div>
                  
                </div>
                */}
              </>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
                <div className="text-5xl mb-4">{selectedDashboardTab.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedDashboardTab.title}</h3>
                <p className="text-gray-500 mb-1">{selectedDashboardTab.description}</p>
                <p className="text-sm text-gray-400 mt-4">No data available for this dashboard yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Intake View */}
        {currentView === 'intake' && (
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <span className="text-red-500 cursor-pointer hover:text-red-600 hover:underline" onClick={showLanding}>🏠 Home</span>
              <span className="text-gray-300">›</span>
              <span>Ticket Intake & Classification</span>
            </div>

            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6 flex items-center gap-2 flex-wrap">
              <span className="text-xl">📥</span>
              <span className="text-gray-900 font-bold">TICKET INTAKE & CLASSIFICATION</span>
              <span className="text-[13px] font-normal text-gray-500 normal-case tracking-normal ml-2 pl-4 border-l-2 border-gray-300">Omni-Channel Ticket Creation & Smart Triage</span>
            </div>

            {validationError && (
              <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded-lg mb-5">
                <div className="font-semibold text-red-800 mb-1">⚠️ Validation Error</div>
                <div className="text-[13px] text-gray-500">{validationError}</div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Card */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <form onSubmit={handleSubmit}>
                  <div className="mb-8">
                    <div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b-2 border-gray-100">
                      <span>📡</span>
                      Channel & Source
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Channel <span className="text-red-600 ml-0.5">*</span>
                      </label>
                      <select 
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10"
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                        required
                      >
                        <option value="">Select Channel</option>
                        <option value="front-desk">Front Desk</option>
                        <option value="phone">Phone Call</option>
                        <option value="mobile-app">Mobile App</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Requester Name <span className="text-red-600 ml-0.5">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10"
                        placeholder="Enter name"
                        value={requester}
                        onChange={(e) => setRequester(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Information <span className="text-red-600 ml-0.5">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10"
                        placeholder="Phone or email"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b-2 border-gray-100">
                      <span>📍</span>
                      Location
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Room / Area <span className="text-red-600 ml-0.5">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10"
                        placeholder="e.g., Room 305, Lobby"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-8">
                    <div className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2 pb-3 border-b-2 border-gray-100">
                      <span>📝</span>
                      Request Details
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category <span className="text-red-600 ml-0.5">*</span>
                      </label>
                      <select 
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="housekeeping">Housekeeping</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="engineering">Engineering</option>
                        <option value="it-support">IT Support</option>
                        <option value="fnb">Food & Beverage</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div className="mb-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Brief Description <span className="text-red-600 ml-0.5">*</span>
                      </label>
                      <textarea 
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 transition-all focus:outline-none focus:border-red-500 focus:ring-[3px] focus:ring-red-500/10 resize-y min-h-[100px]"
                        placeholder="Describe the issue..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="submit" className="px-6 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all bg-red-500 text-white hover:bg-red-600 flex items-center gap-2">
                      ✔ Create Ticket
                    </button>
                    <button type="button" className="px-6 py-3 rounded-lg text-sm font-semibold cursor-pointer transition-all bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center gap-2" onClick={resetForm}>
                      ✕ Clear Form
                    </button>
                  </div>
                </form>
              </div>

              {/* Triage Panel */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm sticky top-5">
                <div className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-5">
                  <span>🎯</span>
                  Smart Triage
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Auto-Assigned Priority</div>
                    <div className={`text-2xl font-bold ${
                      triageData.priority === 'P1' ? 'text-red-600' :
                      triageData.priority === 'P2' ? 'text-amber-600' :
                      'text-green-600'
                    }`}>{triageData.priority}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Target SLA</div>
                    <div className="text-xl font-bold text-gray-800">{triageData.sla}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Assigned Team</div>
                    <div className="text-lg font-semibold text-gray-800">{triageData.team}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}

export default DashboardSectionA