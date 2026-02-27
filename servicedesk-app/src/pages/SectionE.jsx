import { useMemo, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import SidebarToggle from '../components/SidebarToggle'
import Header from '../components/Header'

const generateJORCode = () => `JOR-2025-${Math.floor(100000 + Math.random() * 900000)}`

const branchCards = [
  { name: 'Alabang', tickets: 2, amount: 25000 },
  { name: 'Bagong Barrio', tickets: 2, amount: 7000 },
  { name: 'EDSA Cubao', tickets: 4, amount: 79000 },
  { name: 'Fairview', tickets: 2, amount: 26000 },
  { name: 'Makati Avenue', tickets: 2, amount: 10500 },
  { name: 'North EDSA', tickets: 2, amount: 38500 },
  { name: 'Pasay Rotonda', tickets: 2, amount: 45000 },
  { name: 'Sta. Mesa', tickets: 2, amount: 21500 },
]

const servicesData = [
  {
    code: generateJORCode(),
    name: 'Major HVAC Repair',
    department: 'Engineering',
    branch: 'EDSA Cubao',
    sla: '24-48 hours',
    baseRate: 50000,
    description: 'Full chiller and AHU recovery with refrigerant recharge and leak isolation for guest areas.',
  },
  {
    code: generateJORCode(),
    name: 'Electrical System Upgrade',
    department: 'Engineering',
    branch: 'Pasay Rotonda',
    sla: '3 days',
    baseRate: 25000,
    description: 'Panel rebalancing, breaker replacements, and load certification with compliance report.',
  },
  {
    code: generateJORCode(),
    name: 'Plumbing Overhaul',
    department: 'Engineering',
    branch: 'Sta. Mesa',
    sla: '7 days',
    baseRate: 15000,
    description: 'Stack cleaning, riser pressure test, and valve kit swap for guest and service lines.',
  },
  {
    code: generateJORCode(),
    name: 'Deep Cleaning Service',
    department: 'Housekeeping',
    branch: 'EDSA Cubao',
    sla: '6 hours',
    baseRate: 5000,
    description: 'Detail clean with upholstery extraction and UV sanitation for premium floors.',
  },
  {
    code: generateJORCode(),
    name: 'Carpet & Upholstery Cleaning',
    department: 'Housekeeping',
    branch: 'Novaliches',
    sla: '1 day',
    baseRate: 8000,
    description: 'Hot water extraction, stain lift, and deodorizing for lobby and suites.',
  },
  {
    code: generateJORCode(),
    name: 'Linen Replacement',
    department: 'Housekeeping',
    branch: 'North EDSA',
    sla: '2 hours',
    baseRate: 2000,
    description: 'Par level restoration with shrink-wrapped fresh sets and disposal handling.',
  },
  {
    code: generateJORCode(),
    name: 'Guest Complaint Resolution',
    department: 'Front Office',
    branch: 'Makati Avenue',
    sla: '1-7 days',
    baseRate: 2500,
    description: 'Case handling with recovery voucher issuance and follow-through callbacks.',
  },
  {
    code: generateJORCode(),
    name: 'VIP Guest Setup',
    department: 'Front Office',
    branch: 'Alabang',
    sla: 'Same day',
    baseRate: 10000,
    description: 'VIP arrival prep, amenity placement, and priority concierge routing.',
  },
  {
    code: generateJORCode(),
    name: 'Room Transfer Assistance',
    department: 'Front Office',
    branch: 'Bagong Barrio',
    sla: '30 mins',
    baseRate: 1500,
    description: 'Coordinated move with luggage handling and room readiness verification.',
  },
  {
    code: generateJORCode(),
    name: 'Kitchen Equipment Repair',
    department: 'F&B',
    branch: 'EDSA Cubao',
    sla: '4 hours',
    baseRate: 12000,
    description: 'Line equipment triage, parts replacement, and sanitation clearance.',
  },
  {
    code: generateJORCode(),
    name: 'Banquet Setup Service',
    department: 'F&B',
    branch: 'Pasay Rotonda',
    sla: '1 day',
    baseRate: 20000,
    description: 'Full banquet staging with AV coordination and menu service sequencing.',
  },
  {
    code: generateJORCode(),
    name: 'In-Room Dining Setup',
    department: 'F&B',
    branch: 'Sta. Mesa',
    sla: '2 hours',
    baseRate: 6500,
    description: 'Tray line prep, pantry stocking, and butler-style delivery pathing.',
  },
  {
    code: generateJORCode(),
    name: 'Network Infrastructure Setup',
    department: 'IT',
    branch: 'North EDSA',
    sla: '3-5 days',
    baseRate: 35000,
    description: 'Core switch staging, VLAN segmentation, and Wi-Fi heatmap optimization.',
  },
  {
    code: generateJORCode(),
    name: 'POS System Maintenance',
    department: 'IT',
    branch: 'Makati Avenue',
    sla: '4-6 hours',
    baseRate: 8000,
    description: 'POS terminal refresh, patching, and payment reconciliation tests.',
  },
  {
    code: generateJORCode(),
    name: 'CCTV System Upgrade',
    department: 'IT',
    branch: 'Alabang',
    sla: '1-3 days',
    baseRate: 15000,
    description: 'Camera repositioning, NVR firmware uplift, and retention validation.',
  },
  {
    code: generateJORCode(),
    name: 'Access Control System Install',
    department: 'Security',
    branch: 'Fairview',
    sla: '2-3 days',
    baseRate: 18000,
    description: 'Badge provisioning, controller deployment, and door schedule tuning.',
  },
  {
    code: generateJORCode(),
    name: 'Emergency Response Training',
    department: 'Security',
    branch: 'Bagong Barrio',
    sla: '1 day',
    baseRate: 5500,
    description: 'Tabletop drills, evacuation walkthroughs, and incident comms rehearsal.',
  },
  {
    code: generateJORCode(),
    name: 'Fire Safety Inspection',
    department: 'Security',
    branch: 'EDSA Cubao',
    sla: '4-6 hours',
    baseRate: 12000,
    description: 'Extinguisher checks, alarm panel validation, and egress compliance scan.',
  },
]

const createCollectionRecord = (record) => {
  const mergedCode = generateJORCode()
  return { ...record, id: mergedCode, ticket: mergedCode }
}

const collectionRecords = [
  createCollectionRecord({
    branch: 'EDSA Cubao',
    department: 'Engineering',
    service: 'Major HVAC Repair',
    amountDue: 50000,
    amountPaid: 50000,
    balance: 0,
    status: 'Collected',
    date: '2025-01-15',
  }),
  createCollectionRecord({
    branch: 'Pasay Rotonda',
    department: 'Engineering',
    service: 'Electrical System Upgrade',
    amountDue: 25000,
    amountPaid: 0,
    balance: 25000,
    status: 'Pending',
    date: '2025-01-18',
  }),
  createCollectionRecord({
    branch: 'EDSA Cubao',
    department: 'Housekeeping',
    service: 'Deep Cleaning Service',
    amountDue: 5000,
    amountPaid: 5000,
    balance: 0,
    status: 'Collected',
    date: '2025-01-12',
  }),
  createCollectionRecord({
    branch: 'Fairview',
    department: 'Housekeeping',
    service: 'Carpet & Upholstery Cleaning',
    amountDue: 8000,
    amountPaid: 5000,
    balance: 3000,
    status: 'Partial',
    date: '2025-01-20',
  }),
  createCollectionRecord({
    branch: 'Makati Avenue',
    department: 'Front Office',
    service: 'Guest Complaint Resolution',
    amountDue: 2500,
    amountPaid: 2500,
    balance: 0,
    status: 'Collected',
    date: '2025-01-10',
  }),
  createCollectionRecord({
    branch: 'Alabang',
    department: 'Front Office',
    service: 'VIP Guest Setup',
    amountDue: 10000,
    amountPaid: 0,
    balance: 10000,
    status: 'Overdue',
    date: '2025-01-05',
  }),
  createCollectionRecord({
    branch: 'EDSA Cubao',
    department: 'F&B',
    service: 'Kitchen Equipment Repair',
    amountDue: 12000,
    amountPaid: 12000,
    balance: 0,
    status: 'Collected',
    date: '2025-01-14',
  }),
  createCollectionRecord({
    branch: 'Pasay Rotonda',
    department: 'F&B',
    service: 'Banquet Setup Service',
    amountDue: 20000,
    amountPaid: 0,
    balance: 20000,
    status: 'Pending',
    date: '2025-01-22',
  }),
  createCollectionRecord({
    branch: 'North EDSA',
    department: 'IT',
    service: 'Network Infrastructure Setup',
    amountDue: 35000,
    amountPaid: 35000,
    balance: 0,
    status: 'Collected',
    date: '2025-01-16',
  }),
  createCollectionRecord({
    branch: 'Makati Avenue',
    department: 'IT',
    service: 'POS System Maintenance',
    amountDue: 8000,
    amountPaid: 4000,
    balance: 4000,
    status: 'Partial',
    date: '2025-01-19',
  }),
  createCollectionRecord({
    branch: 'Fairview',
    department: 'Security',
    service: 'Access Control System Install',
    amountDue: 18000,
    amountPaid: 18000,
    balance: 0,
    status: 'Collected',
    date: '2025-01-11',
  }),
  createCollectionRecord({
    branch: 'Bagong Barrio',
    department: 'Security',
    service: 'Emergency Response Training',
    amountDue: 5500,
    amountPaid: 0,
    balance: 5500,
    status: 'Pending',
    date: '2025-01-21',
  }),
]

const departmentOptions = ['All Departments', ...new Set(servicesData.map((s) => s.department))]
const branchOptions = ['All Branches', ...new Set(servicesData.map((s) => s.branch))]
const collectionBranchOptions = ['', ...new Set(collectionRecords.map((c) => c.branch))]
const collectionDeptOptions = ['', ...new Set(collectionRecords.map((c) => c.department))]

const statusBadgeClasses = {
  Collected: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Partial: 'bg-sky-100 text-sky-700',
  Overdue: 'bg-rose-100 text-rose-700',
}

const branchColorMap = {
  'EDSA Cubao': 'from-sky-500 to-blue-600',
  'Pasay Rotonda': 'from-indigo-500 to-purple-600',
  'Sta. Mesa': 'from-teal-500 to-emerald-600',
  'Bagong Barrio': 'from-amber-500 to-orange-600',
  Fairview: 'from-pink-500 to-rose-600',
  'North EDSA': 'from-cyan-500 to-blue-600',
  Alabang: 'from-lime-500 to-green-600',
  'Makati Avenue': 'from-fuchsia-500 to-purple-600',
}

const deptGradientMap = {
  Engineering: 'from-amber-400 to-orange-500',
  IT: 'from-cyan-400 to-sky-500',
  Housekeeping: 'from-emerald-400 to-green-500',
  'F&B': 'from-pink-400 to-rose-500',
  Security: 'from-rose-500 to-red-600',
  'Front Office': 'from-violet-500 to-indigo-500',
}

const deptBadgeClasses = {
  Engineering: 'bg-amber-100 text-amber-700',
  IT: 'bg-cyan-100 text-cyan-700',
  Housekeeping: 'bg-emerald-100 text-emerald-700',
  'F&B': 'bg-pink-100 text-pink-700',
  Security: 'bg-rose-100 text-rose-700',
  'Front Office': 'bg-violet-100 text-violet-700',
}

const deptIconMap = {
  Engineering: '🛠️',
  IT: '💻',
  Housekeeping: '🧹',
  'F&B': '🍽️',
  Security: '🔒',
  'Front Office': '🛎️',
}

function formatCurrency(value) {
  return `₱${value.toLocaleString('en-PH')}`
}

function formatDateLabel(value) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function SectionE() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('pricing')
  const [deptFilter, setDeptFilter] = useState('All Departments')
  const [branchFilter, setBranchFilter] = useState('All Branches')
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [severity, setSeverity] = useState('1.0')
  const [pricingNotes, setPricingNotes] = useState('')
  const [attachmentLabel, setAttachmentLabel] = useState('Click to upload supporting documents')
  const [collectionBranchFilter, setCollectionBranchFilter] = useState('')
  const [collectionDeptFilter, setCollectionDeptFilter] = useState('')
  const [collectionStatusFilter, setCollectionStatusFilter] = useState('')
  const [collectionDateFrom, setCollectionDateFrom] = useState('')
  const [collectionDateTo, setCollectionDateTo] = useState('')
  const [showCollectionDetail, setShowCollectionDetail] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [serviceDetailTab, setServiceDetailTab] = useState('details')
  const [showServiceReportModal, setShowServiceReportModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [assignRequestTitle, setAssignRequestTitle] = useState('Engineering')
  const [scheduledStartDate, setScheduledStartDate] = useState('')
  const [scheduledEndDate, setScheduledEndDate] = useState('')
  
  // Resolution state
  const [resolutionState, setResolutionState] = useState('empty')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [currentResolution, setCurrentResolution] = useState(null)
  
  // Tasks state
  const [serviceTasks, setServiceTasks] = useState([
    { id: 1, title: 'Initial diagnostics', description: 'Check equipment and diagnose issue', assignedTo: 'John Doe', due: 'Feb 2, 2026', completed: false },
    { id: 2, title: 'Order replacement parts', description: 'Order necessary parts from vendor', assignedTo: 'Jane Smith', due: 'Feb 4, 2026', completed: true },
  ])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  
  // Checklist state
  const [serviceChecklist, setServiceChecklist] = useState([])
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [editingChecklistItem, setEditingChecklistItem] = useState(null)
  const [checklistName, setChecklistName] = useState('')
  const [checklistTitle, setChecklistTitle] = useState('')
  const [checklistDescription, setChecklistDescription] = useState('')
  
  // Work Logs state
  const [serviceWorkLogs, setServiceWorkLogs] = useState([
    { id: 1, author: 'John Doe', authorInitials: 'JD', timestamp: 'Jan 28, 2026 10:15 AM', title: 'Initial Review', description: 'Reviewed ticket details and reached out to requester.', replies: [] },
    { id: 2, author: 'Jane Smith', authorInitials: 'JS', timestamp: 'Jan 28, 2026 4:10 PM', title: 'Vendor Contact', description: 'Coordinated with vendor for part numbers and lead times.', replies: [] },
  ])
  const [showWorkLogModal, setShowWorkLogModal] = useState(false)
  const [workLogTitle, setWorkLogTitle] = useState('')
  const [workLogDescription, setWorkLogDescription] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  
  // History state
  const [serviceHistory] = useState([
    { id: 1, user: 'System', initials: 'SY', action: 'created this service request', timestamp: 'Jan 28, 2026 at 9:58 AM' },
    { id: 2, user: 'John Doe', initials: 'JD', action: 'was assigned to this request', timestamp: 'Jan 28, 2026 at 10:20 AM' },
    { id: 3, user: 'Jane Smith', initials: 'JS', action: 'added a work log entry', timestamp: 'Jan 28, 2026 at 4:10 PM' },
  ])
  
  // Technicians for assign modal
  const techniciansData = [
    { id: 1, name: 'John Doe', role: 'Senior Technician', department: 'IT Support', openTasks: 3, taskLabel: 'open tickets', status: 'online' },
    { id: 2, name: 'Carla Mendoza', role: 'Systems Engineer', department: 'Engineering', openTasks: 2, taskLabel: 'open tasks', status: 'online' },
    { id: 3, name: 'Miguel Santos', role: 'Maintenance Lead', department: 'Engineering', openTasks: 4, taskLabel: 'open tasks', status: 'online' },
    { id: 4, name: 'Anna Cruz', role: 'Housekeeping Supervisor', department: 'Housekeeping', openTasks: 1, taskLabel: 'open tickets', status: 'online' },
    { id: 5, name: 'Roberto Lim', role: 'Room Attendant', department: 'Housekeeping', openTasks: 5, taskLabel: 'open tasks', status: 'offline' },
    { id: 6, name: 'Patricia Reyes', role: 'F&B Coordinator', department: 'F&B Service', openTasks: 2, taskLabel: 'open tickets', status: 'online' },
    { id: 7, name: 'James Garcia', role: 'Banquet Supervisor', department: 'F&B Service', openTasks: 3, taskLabel: 'open tasks', status: 'offline' },
  ]
  
  const fileInputRef = useRef(null)

  const filteredServices = useMemo(() => {
    return servicesData.filter((service) => {
      const byDept = deptFilter === 'All Departments' || service.department === deptFilter
      const byBranch = branchFilter === 'All Branches' || service.branch === branchFilter
      return byDept && byBranch
    })
  }, [deptFilter, branchFilter])

  const filteredCollections = useMemo(() => {
    return collectionRecords.filter((record) => {
      const byBranch = !collectionBranchFilter || record.branch === collectionBranchFilter
      const byDept = !collectionDeptFilter || record.department === collectionDeptFilter
      const byStatus = !collectionStatusFilter || record.status === collectionStatusFilter

      const recordDate = new Date(record.date)
      const from = collectionDateFrom ? new Date(collectionDateFrom) : null
      const to = collectionDateTo ? new Date(collectionDateTo) : null

      const byDateFrom = !from || recordDate >= from
      const byDateTo = !to || recordDate <= to

      return byBranch && byDept && byStatus && byDateFrom && byDateTo
    })
  }, [collectionBranchFilter, collectionDeptFilter, collectionStatusFilter, collectionDateFrom, collectionDateTo])

  const branchSummary = useMemo(() => {
    const map = new Map()
    filteredCollections.forEach((record) => {
      if (!map.has(record.branch)) {
        map.set(record.branch, { branch: record.branch, transactions: 0, collected: 0, due: 0 })
      }
      const item = map.get(record.branch)
      item.transactions += 1
      item.collected += record.amountPaid
      item.due += record.balance
    })
    return Array.from(map.values())
  }, [filteredCollections])

  const deptSummary = useMemo(() => {
    const map = new Map()
    filteredCollections.forEach((record) => {
      if (!map.has(record.department)) {
        map.set(record.department, { department: record.department, transactions: 0, collected: 0, due: 0 })
      }
      const item = map.get(record.department)
      item.transactions += 1
      item.collected += record.amountPaid
      item.due += record.balance
    })
    return Array.from(map.values())
  }, [filteredCollections])

  const collectionStats = useMemo(() => {
    const base = {
      Collected: { count: 0, amount: 0 },
      Pending: { count: 0, amount: 0 },
      Partial: { count: 0, amount: 0 },
      Overdue: { count: 0, amount: 0 },
    }
    filteredCollections.forEach((record) => {
      const bucket = base[record.status]
      if (!bucket) return
      bucket.count += 1
      if (record.status === 'Collected') bucket.amount += record.amountPaid
      if (record.status === 'Pending') bucket.amount += record.balance
      if (record.status === 'Partial') bucket.amount += record.balance
      if (record.status === 'Overdue') bucket.amount += record.balance
    })
    return base
  }, [filteredCollections])

  const branchTotals = useMemo(() => {
    const tickets = branchSummary.reduce((sum, item) => sum + item.transactions, 0)
    const collected = branchSummary.reduce((sum, item) => sum + item.collected, 0)
    return { tickets, collected }
  }, [branchSummary])

  const deptTotals = useMemo(() => {
    const tickets = deptSummary.reduce((sum, item) => sum + item.transactions, 0)
    const collected = deptSummary.reduce((sum, item) => sum + item.collected, 0)
    return { tickets, collected }
  }, [deptSummary])

  const grandTotalTickets = branchCards.reduce((sum, card) => sum + card.tickets, 0)
  const grandTotalAmount = branchCards.reduce((sum, card) => sum + card.amount, 0)

  const severityOptions = [
    { label: 'Normal (No adjustment)', value: '1.0' },
    { label: 'High (+25%)', value: '1.25' },
    { label: 'Critical (+50%)', value: '1.5' },
    { label: 'Emergency (+100%)', value: '2.0' },
    { label: 'Low Priority (-10%)', value: '0.9' },
  ]

  const pricingTotal = selectedService ? selectedService.baseRate * parseFloat(severity) : 0

  const openPricing = (service) => {
    setSelectedService(service)
    setSeverity('1.0')
    setPricingNotes('')
    setShowPricingModal(true)
  }

  const openDetail = (service) => {
    setSelectedService(service)
    setServiceDetailTab('details')
    setShowDetailModal(true)
  }

  const closePricing = () => setShowPricingModal(false)
  const closeDetail = () => setShowDetailModal(false)
  const closeCollectionDetail = () => {
    setShowCollectionDetail(false)
    setSelectedCollection(null)
  }
  const closeServiceReport = () => setShowServiceReportModal(false)
  
  // Resolution handlers
  const showResolutionInput = () => setResolutionState('input')
  const saveResolution = () => {
    if (resolutionNotes.trim()) {
      setCurrentResolution({
        content: resolutionNotes,
        author: 'Admin User',
        authorInitials: 'AU',
        savedAt: new Date()
      })
      setResolutionState('display')
      setResolutionNotes('')
    }
  }
  const editResolution = () => {
    if (currentResolution) {
      setResolutionNotes(currentResolution.content)
      setResolutionState('edit')
    }
  }
  const updateResolution = () => {
    if (currentResolution && resolutionNotes.trim()) {
      setCurrentResolution({
        ...currentResolution,
        content: resolutionNotes,
        savedAt: new Date()
      })
      setResolutionState('display')
      setResolutionNotes('')
    }
  }
  const cancelEditResolution = () => {
    setResolutionNotes('')
    setResolutionState('display')
  }
  const deleteResolution = () => {
    if (window.confirm('Are you sure you want to delete this resolution?')) {
      setCurrentResolution(null)
      setResolutionState('empty')
    }
  }
  
  // Task handlers
  const openTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task)
      setTaskTitle(task.title)
      setTaskDescription(task.description || '')
    } else {
      setEditingTask(null)
      setTaskTitle('')
      setTaskDescription('')
    }
    setShowTaskModal(true)
  }
  const closeTaskModal = () => {
    setShowTaskModal(false)
    setEditingTask(null)
    setTaskTitle('')
    setTaskDescription('')
  }
  const saveTask = () => {
    if (!taskTitle.trim()) return
    if (editingTask) {
      setServiceTasks(serviceTasks.map(t => t.id === editingTask.id ? { ...t, title: taskTitle, description: taskDescription } : t))
    } else {
      setServiceTasks([...serviceTasks, { id: Date.now(), title: taskTitle, description: taskDescription, assignedTo: 'Unassigned', due: 'TBD', completed: false }])
    }
    closeTaskModal()
  }
  const toggleTaskCompletion = (taskId) => {
    setServiceTasks(serviceTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t))
  }
  const deleteTask = (taskId) => {
    if (window.confirm('Delete this task?')) {
      setServiceTasks(serviceTasks.filter(t => t.id !== taskId))
    }
  }
  
  // Checklist handlers
  const openChecklistModal = (item = null) => {
    if (item) {
      setEditingChecklistItem(item)
      setChecklistName(item.name)
      setChecklistTitle(item.title)
      setChecklistDescription(item.description || '')
    } else {
      setEditingChecklistItem(null)
      setChecklistName('')
      setChecklistTitle('')
      setChecklistDescription('')
    }
    setShowChecklistModal(true)
  }
  const closeChecklistModal = () => {
    setShowChecklistModal(false)
    setEditingChecklistItem(null)
    setChecklistName('')
    setChecklistTitle('')
    setChecklistDescription('')
  }
  const saveChecklistItem = () => {
    if (!checklistTitle.trim()) return
    if (editingChecklistItem) {
      setServiceChecklist(serviceChecklist.map(i => i.id === editingChecklistItem.id ? { ...i, name: checklistName, title: checklistTitle, description: checklistDescription } : i))
    } else {
      setServiceChecklist([...serviceChecklist, { id: Date.now(), name: checklistName, title: checklistTitle, description: checklistDescription, completed: false }])
    }
    closeChecklistModal()
  }
  const toggleChecklistCompletion = (itemId) => {
    setServiceChecklist(serviceChecklist.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i))
  }
  const deleteChecklistItem = (itemId) => {
    if (window.confirm('Delete this checklist item?')) {
      setServiceChecklist(serviceChecklist.filter(i => i.id !== itemId))
    }
  }
  
  // Work Log handlers
  const openWorkLogModal = () => {
    setWorkLogTitle('')
    setWorkLogDescription('')
    setShowWorkLogModal(true)
  }
  const closeWorkLogModal = () => {
    setShowWorkLogModal(false)
    setWorkLogTitle('')
    setWorkLogDescription('')
  }
  const saveWorkLog = () => {
    if (!workLogTitle.trim()) return
    setServiceWorkLogs([...serviceWorkLogs, {
      id: Date.now(),
      author: 'Admin User',
      authorInitials: 'AU',
      timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      title: workLogTitle,
      description: workLogDescription,
      replies: []
    }])
    closeWorkLogModal()
  }
  const deleteWorkLog = (logId) => {
    if (window.confirm('Delete this work log?')) {
      setServiceWorkLogs(serviceWorkLogs.filter(l => l.id !== logId))
    }
  }
  
  const addReply = (logId, parentReplyId = null) => {
    const draftKey = parentReplyId ? `${logId}-${parentReplyId}` : `${logId}-root`
    const text = replyDrafts[draftKey]?.trim()
    if (!text) {
      alert('Please enter a reply.')
      return
    }

    const addReplyRecursive = (replies, targetId) => {
      return replies.map(r => {
        if (r.id === targetId) {
          const nested = r.replies ? [...r.replies] : []
          nested.push({
            id: Date.now(),
            author: 'Chris Mendoza',
            authorInitials: 'CM',
            timestamp: '1d ago',
            text,
            replies: []
          })
          return { ...r, replies: nested }
        }
        if (r.replies && r.replies.length) {
          return { ...r, replies: addReplyRecursive(r.replies, targetId) }
        }
        return r
      })
    }

    const updatedLogs = serviceWorkLogs.map(log => {
      if (log.id === logId) {
        if (parentReplyId) {
          const updatedReplies = addReplyRecursive(log.replies || [], parentReplyId)
          return { ...log, replies: updatedReplies }
        }
        const replies = log.replies ? [...log.replies] : []
        replies.push({
          id: Date.now(),
          author: 'Chris Mendoza',
          authorInitials: 'CM',
          timestamp: '1d ago',
          text,
          replies: []
        })
        return { ...log, replies }
      }
      return log
    })
    setServiceWorkLogs(updatedLogs)
    setReplyDrafts(prev => ({ ...prev, [draftKey]: '' }))
  }

  const deleteReply = (logId, replyId) => {
    const deleteRecursive = (replies, targetId) => {
      return replies
        .filter(r => r.id !== targetId)
        .map(r => r.replies && r.replies.length ? { ...r, replies: deleteRecursive(r.replies, targetId) } : r)
    }

    const updatedLogs = serviceWorkLogs.map(log => {
      if (log.id === logId) {
        return { ...log, replies: deleteRecursive(log.replies || [], replyId) }
      }
      return log
    })
    setServiceWorkLogs(updatedLogs)
  }
  
  // Edit mode handler
  const toggleEditMode = () => setEditMode(!editMode)
  
  // Assign modal handlers
  const openAssignModal = () => setShowAssignModal(true)
  const closeAssignModal = () => {
    setShowAssignModal(false)
    setSelectedTechnician(null)
  }
  const confirmAssignment = () => {
    if (selectedTechnician) {
      closeAssignModal()
    }
  }
  
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const resetFilters = () => {
    setDeptFilter('All Departments')
    setBranchFilter('All Branches')
  }

  const resetCollectionFilters = () => {
    setCollectionBranchFilter('')
    setCollectionDeptFilter('')
    setCollectionStatusFilter('')
    setCollectionDateFrom('')
    setCollectionDateTo('')
  }

  const handleAttachmentClick = () => {
    if (fileInputRef.current) fileInputRef.current.click()
  }

  const handleAttachmentChange = (event) => {
    const file = event.target.files && event.target.files[0]
    if (!file) {
      setAttachmentLabel('Click to upload supporting documents')
      return
    }

    const sizeInMb = file.size / (1024 * 1024)
    const prettySize = sizeInMb >= 1 ? `${sizeInMb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`
    setAttachmentLabel(`${file.name} (${prettySize})`)
  }

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-gray-800">
      <Sidebar collapsed={sidebarCollapsed} />
      <SidebarToggle collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((prev) => !prev)} />

      <div className="transition-all duration-300">
        <Header 
          collapsed={sidebarCollapsed}
        />

        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 ${sidebarCollapsed ? 'sidebar-collapsed-margin' : 'with-sidebar'}`}>
          <div className="bg-white border border-gray-200 rounded-2xl p-2 flex flex-wrap gap-2 shadow-sm">
            <button
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                activeTab === 'pricing'
                  ? 'bg-gradient-to-r from-[#1f3c8e] to-[#3b82f6] text-white border-transparent shadow'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#3b82f6] hover:text-[#3b82f6]'
              }`}
              onClick={() => setActiveTab('pricing')}
            >
              <span>🔖</span> Service Pricing History
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                activeTab === 'collection'
                  ? 'bg-gradient-to-r from-[#1f3c8e] to-[#3b82f6] text-white border-transparent shadow'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#3b82f6] hover:text-[#3b82f6]'
              }`}
              onClick={() => setActiveTab('collection')}
            >
              <span>📊</span> Collection per Branch & Department
            </button>
          </div>

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Service Pricing History</h2>
                    <p className="text-sm text-gray-500">List of service pricing records per ticket</p>
                  </div>
                  <button className="px-4 py-2 text-sm font-semibold bg-blue-300/50 text-blue-900 rounded-lg shadow-sm">ACTIVE</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-6 py-4">
                  {branchCards.map((card) => (
                    <div key={card.name} className="border border-gray-200 rounded-xl p-4 bg-white shadow-[0_6px_18px_-10px_rgba(0,0,0,0.25)]">
                      <p className="text-md font-semibold text-gray-900">🏨 {card.name}</p>
                      <div className="mt-3 flex items-center justify-between text-md text-gray-500">
                        <span>Tickets</span>
                        <span className="font-semibold text-[#1f3c8e]">{card.tickets}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-md text-gray-500">
                        <span>Total Amount</span>
                        <span className="font-semibold text-[#1f3c8e]">{formatCurrency(card.amount)}</span>
                      </div>
                    </div>
                  ))}

                  <div className="border border-[#5b6ef5] rounded-xl p-4 bg-gradient-to-br from-[#4f46e5] to-[#6366f1] text-white shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-md font-semibold">Grand Total</p>
                        <p className="text-sm text-white/80">Total Tickets</p>
                        <p className="text-2xl font-bold mt-1">{grandTotalTickets}</p>
                      </div>
                      <div className="text-3xl"></div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-white/80">Combined Total</p>
                      <p className="text-2xl font-bold">{formatCurrency(grandTotalAmount)}</p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-4">
                  <div className="bg-[#e9f2ff] text-[#1f3c8e] border border-[#cddfff] rounded-xl px-4 py-3 text-sm">
                    <span className="font-semibold">Purpose: </span>
                    View service pricing history and transaction records per ticket. Use filters to search by department or branch location.
                  </div>
                </div>

                <div className="px-6 pb-4 flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Department</label>
                    <select
                      className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={deptFilter}
                      onChange={(event) => setDeptFilter(event.target.value)}
                    >
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Hotel Sogo Branch</label>
                    <select
                      className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={branchFilter}
                      onChange={(event) => setBranchFilter(event.target.value)}
                    >
                      {branchOptions.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
                    onClick={resetFilters}
                  >
                    Reset filters
                  </button>
                  <div className="ml-auto text-xs text-gray-500">
                    Showing {filteredServices.length} of {servicesData.length} records
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[960px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-[0.2em]">
                      <tr>
                        <th className="text-left px-4 py-3">Service Code</th>
                        <th className="text-left px-4 py-3">Service Name</th>
                        <th className="text-left px-4 py-3">Department</th>
                        <th className="text-left px-4 py-3">Hotel Sogo Branch</th>
                        <th className="text-left px-4 py-3">SLA</th>
                        <th className="text-left px-4 py-3">Base Rate</th>
                        <th className="text-center px-4 py-3">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((service) => (
                        <tr key={service.code} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-xs">
                              {service.code}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-gray-900">{service.name}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                deptBadgeClasses[service.department] || 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {service.department}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">{service.branch}</td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                              {service.sla}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-900">{formatCurrency(service.baseRate)}</td>
                          <td className="px-4 py-4 text-center">
                            <button
                              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
                              onClick={() => openDetail(service)}
                            >
                              View
                            </button>
                          </td>
                          {/* <td className="px-4 py-4 text-center">
                            <button
                              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1f3c8e] text-white hover:bg-[#17306f]"
                              onClick={() => openPricing(service)}
                            >
                              Select
                            </button>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              
            </div>
          )}

          {activeTab === 'collection' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-[#0ea5e9]/15 text-[#0ea5e9] flex items-center justify-center text-xl">💳</div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Collection Summary</h3>
                      <p className="text-sm text-gray-500">Overview of collections per branch and department</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100">UPDATED</span>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-[0_6px_18px_-12px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white text-blue-600 flex items-center justify-center text-lg border border-blue-100">🏨</div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Collection by Branch</p>
                      <p className="text-xs text-blue-800/80">Summary of total collections grouped by Hotel SOGO branch location.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {branchSummary.length === 0 && (
                    <div className="col-span-full text-center text-sm text-gray-500 border border-dashed border-slate-200 rounded-xl py-6">
                      No branch collections match your filters.
                    </div>
                  )}
                  {branchSummary.map((item) => {
                    const gradient = branchColorMap[item.branch] || 'from-slate-400 to-slate-600'
                    return (
                      <div key={item.branch} className="rounded-2xl border border-gray-200 bg-white shadow-sm px-5 py-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 text-white flex items-center justify-center text-xl`}>🏨</div>
                          <div>
                            <p className="text-base font-semibold text-gray-900">{item.branch}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Tickets</span>
                          <span className="text-base font-semibold text-gray-900">{item.transactions}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Collected</span>
                          <span className="text-base font-bold text-emerald-600">{formatCurrency(item.collected)}</span>
                        </div>
                      </div>
                    )
                  })}

                  {branchSummary.length > 0 && (
                    <div className="rounded-2xl bg-[#5346e8] text-white shadow-lg px-5 py-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span>💰</span>
                        <span>Branch Total</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-white/90">
                        <span>Total Tickets</span>
                        <span className="text-base font-semibold">{branchTotals.tickets}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-white/90">
                        <span>Total Collected</span>
                        <span className="text-2xl font-black">{formatCurrency(branchTotals.collected)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-[0_6px_18px_-12px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white text-blue-600 flex items-center justify-center text-lg border border-blue-100">📊</div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Collection by Department</p>
                      <p className="text-xs text-blue-800/80">Summary of total collections grouped by department.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {deptSummary.length === 0 && (
                    <div className="col-span-full text-center text-sm text-gray-500 border border-dashed border-slate-200 rounded-xl py-6">
                      No department collections match your filters.
                    </div>
                  )}
                  {deptSummary.map((item) => {
                    const gradient = deptGradientMap[item.department] || 'from-slate-400 to-slate-600'
                    return (
                      <div key={item.department} className="rounded-2xl border border-gray-200 bg-white shadow-sm px-5 py-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-xl shadow-sm`}>
                            {deptIconMap[item.department] || '🏢'}
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-900">{item.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Tickets</span>
                          <span className="text-base font-semibold text-gray-900">{item.transactions}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Collected</span>
                          <span className="text-base font-bold text-emerald-600">{formatCurrency(item.collected)}</span>
                        </div>
                      </div>
                    )
                  })}

                  {deptSummary.length > 0 && (
                    <div className="rounded-2xl bg-[#5346e8] text-white shadow-lg px-5 py-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <span>💳</span>
                        <span>Dept Total</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-white/90">
                        <span>Total Tickets</span>
                        <span className="text-base font-semibold">{deptTotals.tickets}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-white/90">
                        <span>Total Collected</span>
                        <span className="text-2xl font-black">{formatCurrency(deptTotals.collected)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Collection Records</h3>
                      <p className="text-sm text-gray-500">Detailed list of all collection transactions</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-4 bg-slate-50/60 border border-slate-100 rounded-xl p-4">
                  <div className="min-w-[200px] flex-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Branch</label>
                    <select
                      className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={collectionBranchFilter}
                      onChange={(event) => setCollectionBranchFilter(event.target.value)}
                    >
                      <option value="">All Branches</option>
                      {collectionBranchOptions
                        .filter((branch) => branch)
                        .map((branch) => (
                          <option key={branch} value={branch}>
                            {branch}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Department</label>
                    <select
                      className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={collectionDeptFilter}
                      onChange={(event) => setCollectionDeptFilter(event.target.value)}
                    >
                      <option value="">All Departments</option>
                      {collectionDeptOptions
                        .filter((dept) => dept)
                        .map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="min-w-[160px]">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</label>
                    <select
                      className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={collectionStatusFilter}
                      onChange={(event) => setCollectionStatusFilter(event.target.value)}
                    >
                      <option value="">All Status</option>
                      {['Collected', 'Pending', 'Partial', 'Overdue'].map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-[160px]">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Date From</label>
                    <input
                      type="date"
                      className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={collectionDateFrom}
                      onChange={(event) => setCollectionDateFrom(event.target.value)}
                    />
                  </div>
                  <div className="min-w-[160px]">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">To</label>
                    <input
                      type="date"
                      className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={collectionDateTo}
                      onChange={(event) => setCollectionDateTo(event.target.value)}
                    />
                  </div>
                  <button
                    className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
                    onClick={resetCollectionFilters}
                  >
                    🔄 Reset
                  </button>
                  <div className="ml-auto text-xs text-gray-500">
                    Showing <strong>{filteredCollections.length}</strong> of <strong>{collectionRecords.length}</strong> records
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[1024px] w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-[0.2em]">
                      <tr>
                        <th className="text-left px-4 py-3">Ticket #</th>
                        <th className="text-left px-4 py-3">Branch</th>
                        <th className="text-left px-4 py-3">Department</th>
                        <th className="text-left px-4 py-3">Service</th>
                        <th className="text-left px-4 py-3">Amount Due</th>
                        <th className="text-left px-4 py-3">Amount Paid</th>
                        <th className="text-left px-4 py-3">Balance</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Date</th>
                        <th className="text-center px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCollections.map((record) => (
                        <tr key={record.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-xs">{record.ticket}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">{record.branch}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                deptBadgeClasses[record.department] || 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {record.department}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{record.service}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(record.amountDue)}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-600">{formatCurrency(record.amountPaid)}</td>
                          <td
                            className={`px-4 py-3 font-semibold ${
                              record.balance === 0 ? 'text-gray-900' : 'text-rose-600'
                            }`}
                          >
                            {formatCurrency(record.balance)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                statusBadgeClasses[record.status] || 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatDateLabel(record.date)}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                setSelectedCollection(record)
                                setShowCollectionDetail(true)
                              }}
                            >
                              👁 View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredCollections.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8 border border-dashed border-gray-200 rounded-xl">
                    <div className="text-2xl mb-2">🔍</div>
                    <p>No collection records found matching your filters.</p>
                    <button
                      className="mt-3 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                      onClick={resetCollectionFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center text-xl">📈</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Collection Statistics</h3>
                    <p className="text-sm text-gray-500">Overall collection performance metrics</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-[6px] bg-emerald-500 rounded-l-2xl" />
                    <div className="flex items-center gap-2 text-emerald-700">
                      <span className="text-xl">✅</span>
                      <p className="text-base font-semibold">Total Collected</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Transactions</span>
                      <span className="font-bold">{collectionStats.Collected.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Amount</span>
                      <span className="text-xl font-bold text-emerald-600">{formatCurrency(collectionStats.Collected.amount)}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-white shadow-sm p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-[6px] bg-amber-400 rounded-l-2xl" />
                    <div className="flex items-center gap-2 text-amber-700">
                      <span className="text-xl">⏳</span>
                      <p className="text-base font-semibold">Pending Collection</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Transactions</span>
                      <span className="font-bold">{collectionStats.Pending.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Amount</span>
                      <span className="text-xl font-bold text-amber-500">{formatCurrency(collectionStats.Pending.amount)}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-white shadow-sm p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-[6px] bg-blue-500 rounded-l-2xl" />
                    <div className="flex items-center gap-2 text-blue-700">
                      <span className="text-xl">📊</span>
                      <p className="text-base font-semibold">Partial Payments</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Transactions</span>
                      <span className="font-bold">{collectionStats.Partial.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Balance Due</span>
                      <span className="text-xl font-bold text-blue-600">{formatCurrency(collectionStats.Partial.amount)}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-rose-200 bg-white shadow-sm p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-[6px] bg-rose-500 rounded-l-2xl" />
                    <div className="flex items-center gap-2 text-rose-700">
                      <span className="text-xl">⚠️</span>
                      <p className="text-base font-semibold">Overdue</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Transactions</span>
                      <span className="font-bold">{collectionStats.Overdue.count}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-700">
                      <span>Amount</span>
                      <span className="text-xl font-bold text-rose-600">{formatCurrency(collectionStats.Overdue.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Collection Detail Modal */}
        {showCollectionDetail && selectedCollection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_0.18s_ease] max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#e0f2fe] via-white to-white border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-[#0ea5e9]/15 text-[#0ea5e9] flex items-center justify-center text-xl">👁</div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Collection Details</p>
                    <h3 className="text-lg font-bold text-gray-900">{selectedCollection.id}</h3>
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  onClick={closeCollectionDetail}
                  aria-label="Close collection details"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5 bg-gray-50/80 overflow-y-auto flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">Ticket #: {selectedCollection.ticket}</div>
                  <div className="px-3 py-1 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-700">Service: {selectedCollection.service}</div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusBadgeClasses[selectedCollection.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {selectedCollection.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-500">Branch</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedCollection.branch}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-500">Department</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedCollection.department}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-500">Date</div>
                    <div className="text-sm font-semibold text-gray-900">{formatDateLabel(selectedCollection.date)}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-500">ID</div>
                    <div className="text-sm font-semibold text-gray-900">{selectedCollection.id}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
                  <div className="flex items-center gap-2 text-gray-800">
                    <span className="text-lg">💳</span>
                    <p className="text-sm font-semibold">Payment Breakdown</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                      <p className="text-xs text-amber-700 font-semibold">Amount Due</p>
                      <p className="text-xl font-bold text-amber-800 mt-1">{formatCurrency(selectedCollection.amountDue)}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                      <p className="text-xs text-emerald-700 font-semibold">Amount Paid</p>
                      <p className="text-xl font-bold text-emerald-800 mt-1">{formatCurrency(selectedCollection.amountPaid)}</p>
                    </div>
                    <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3">
                      <p className="text-xs text-rose-700 font-semibold">Balance</p>
                      <p
                        className={`text-xl font-bold mt-1 ${
                          selectedCollection.balance === 0 ? 'text-gray-900' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(selectedCollection.balance)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                    onClick={closeCollectionDetail}
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow">
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Modal */}
        {showPricingModal && selectedService && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-3xl rounded-xl bg-white shadow-[0_24px_60px_-25px_rgba(0,0,0,0.55)] overflow-hidden animate-[fadeIn_0.2s_ease]">
              <div className="bg-gradient-to-r from-[#e7f1ff] via-[#eff6ff] to-white px-6 sm:px-8 py-5 flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="text-4xl leading-none">💰</div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Service Pricing</h3>
                    <p className="text-sm text-slate-600">Pricing breakdown for selected service</p>
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-2xl bg-white/80 border border-slate-200 text-slate-600 hover:bg-white shadow-sm"
                  onClick={closePricing}
                  aria-label="Close pricing modal"
                >
                  ✕
                </button>
              </div>

              <div className="bg-[#f7f9fc] px-5 sm:px-8 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-200">
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Service Code</span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">{selectedService.code}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Department</span>
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">{selectedService.department}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Hotel Sogo Branch</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedService.branch}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">SLA</span>
                    <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1 rounded-full">{selectedService.sla}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Base Rate</span>
                    <span className="text-xl font-bold text-slate-900">{formatCurrency(selectedService.baseRate)}</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Severity Adjustment</span>
                    <div className="min-w-[220px]">
                      <select
                        className="w-full text-sm font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-inner focus:ring-2 focus:ring-[#5c63ff]/50 focus:border-[#5c63ff] outline-none"
                        value={severity}
                        onChange={(event) => setSeverity(event.target.value)}
                      >
                        {severityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5c63ff] via-[#5b56f5] to-[#7e6bff] text-white shadow-xl">
                  <div className="absolute inset-0 bg-white/5" />
                  <div className="relative px-6 py-7">
                    <p className="text-xs text-center uppercase tracking-[0.22em] text-white/80">Total Cost</p>
                    <p className="mt-2 text-4xl sm:text-5xl text-center font-black drop-shadow-sm">{formatCurrency(Math.round(pricingTotal))}</p>
                  </div>
                </div>

                <div className="p-0 space-y-3">
                  <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-slate-800">
                    <span className="text-lg">📎</span>
                    <span>Attachments</span>
                  </div>
                  <div
                    className="group cursor-pointer rounded-2xl border-2 border-dashed border-[#9aa7ff] bg-[#f7f8ff] hover:border-[#7d8bff] transition p-6 text-center"
                    onClick={handleAttachmentClick}
                  >
                    <div className="text-3xl mb-2">📄</div>
                    <p className="text-sm font-semibold text-slate-800">{attachmentLabel}</p>
                    <p className="text-xs text-slate-500">JPG, PNG, PDF, DOC (Max 10MB total)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      onChange={handleAttachmentChange}
                    />
                  </div>
                </div>

              <div className="space-y-2">
                  <label className="text-sm mt-2 font-semibold text-slate-800">Additional Notes</label>
                  <textarea
                    className="w-full min-h-[110px] rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-[#5c63ff] focus:ring-2 focus:ring-[#5c63ff]/40 outline-none"
                    placeholder="Enter any special requirements or notes for this service request..."
                    value={pricingNotes}
                    onChange={(event) => setPricingNotes(event.target.value)}
                  />
                </div>
              </div>

              <div className="px-5 sm:px-8 py-4 bg-white border-t border-slate-200 flex flex-wrap gap-3 justify-end">
                <button
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={closePricing}
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-md">
                  Submit for Approval
                </button>
                <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#10b981] text-white hover:bg-[#0f9d74] shadow-md">
                  Confirm Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Detail Modal */}
        {showDetailModal && selectedService && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-3 sm:px-4">
            <div className="bg-white w-full max-w-4xl xl:max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease]">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 text-gray-700 hover:bg-white" onClick={closeDetail}>← Back</button>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 text-gray-700 hover:bg-white" onClick={toggleEditMode}>{editMode ? 'Cancel Edit' : 'Edit'}</button>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-md border border-gray-200 text-gray-700 hover:bg-white" onClick={openAssignModal}>Assign</button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">⚙</button>
                  <button
                    className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    onClick={closeDetail}
                    aria-label="Close detail modal"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row max-h-[82vh]">
                <div className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📋</div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        #{selectedService.code} {selectedService.branch}
                      </h2>
                      <p className="text-sm text-gray-600">
                        by Service Request on Jan 29, 2026, 10:01 AM | DueBy: {selectedService.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
                    {[
                      { id: 'details', label: 'Details' },
                      { id: 'resolution', label: 'Resolution' },
                      { id: 'tasks', label: 'Tasks' },
                      { id: 'checklist', label: 'Checklist' },
                      { id: 'workLogs', label: 'Work Logs' },
                      { id: 'timeAnalysis', label: 'Time Analysis' },
                      { id: 'history', label: 'History' },
                      { id: 'report', label: 'Generate Report' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        className={`px-3 py-2 text-sm font-semibold rounded-md ${
                          serviceDetailTab === tab.id
                            ? 'text-[#1f3c8e]  border-[#1f3c8e] bg-white'
                            : 'text-gray-600 hover:text-[#1f3c8e]'
                        }`}
                        onClick={() => setServiceDetailTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-5">
                    {serviceDetailTab === 'details' && (
                      <div className="border border-gray-200 rounded-xl">
                        <div className="px-4 py-3 border-b border-gray-100 text-sm font-semibold text-gray-800">Description</div>
                        <div className="px-4 py-4 space-y-3 text-sm text-gray-700">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div><span className="font-semibold">Service: </span>{selectedService.name}</div>
                            <div><span className="font-semibold">Service Code: </span>{selectedService.code}</div>
                            <div><span className="font-semibold">Base Rate: </span>{formatCurrency(selectedService.baseRate)}</div>
                            <div><span className="font-semibold">SLA: </span>{selectedService.sla}</div>
                          </div>
                          <p className="leading-relaxed">{selectedService.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-base">📎</span>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="text-[#1f3c8e] font-semibold hover:text-[#152a6e] cursor-pointer underline"
                            >
                              Browse Files
                            </button>
                            <span className="text-gray-400">or Drag files here [ Max size: 50 MB. ]</span>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept="*/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files) {
                                  console.log('Selected files:', Array.from(e.target.files))
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {serviceDetailTab === 'report' && (
                      <div className="border border-gray-200 rounded-xl p-5 text-sm text-gray-700 bg-white">
                        <div className="space-y-4 max-w-3xl">
                          <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-gray-400 font-semibold">Export</p>
                            <h3 className="text-2xl font-bold text-gray-800">Generate Service Report</h3>
                            <p className="text-sm text-gray-600 mt-2">Confirm the key service details and click generate to preview the printable report.</p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { label: 'Service Code', value: selectedService.code },
                              { label: 'Branch', value: selectedService.branch },
                              { label: 'Department', value: selectedService.department },
                              { label: 'SLA', value: selectedService.sla },
                            ].map((stat) => (
                              <div key={stat.label} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-[10px] uppercase text-gray-500">{stat.label}</p>
                                <p className="text-lg font-semibold text-gray-800 truncate">{stat.value}</p>
                              </div>
                            ))}
                          </div>

                          <button
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm hover:shadow-md gap-2"
                            onClick={() => setShowServiceReportModal(true)}
                          >
                            <span>📄</span>
                            Generate Report
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Resolution Tab */}
                    {serviceDetailTab === 'resolution' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h3 className="text-[15px] font-bold text-gray-800 mb-4">Resolution</h3>
                        
                        {resolutionState === 'empty' && (
                          <div className="flex flex-col items-center justify-center py-12 min-h-[300px] relative">
                            <button className="absolute top-0 right-0 px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700" onClick={showResolutionInput}>+ Add Resolution</button>
                            <div className="relative mb-4">
                              <div className="text-7xl text-gray-300 opacity-60">⚙️</div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-5xl text-gray-300 opacity-80">🔍</div>
                              </div>
                            </div>
                            <p className="text-gray-500 text-[13px] font-medium">No Resolution Found</p>
                          </div>
                        )}

                        {resolutionState === 'input' && (
                          <div>
                            <textarea className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:border-blue-500" placeholder="Enter resolution details..." value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} />
                            <div className="flex gap-3 mt-4">
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700" onClick={saveResolution}>Save Resolution</button>
                              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-[13px] font-medium hover:bg-gray-50" onClick={() => setResolutionState('empty')}>Cancel</button>
                            </div>
                          </div>
                        )}

                        {resolutionState === 'display' && currentResolution && (
                          <div>
                            <div className="bg-white border border-gray-200 rounded-md p-4 min-h-[200px]">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{currentResolution.authorInitials || 'JD'}</div>
                                <div className="text-[13px] text-gray-600">
                                  <span className="font-medium">{currentResolution.author}</span>
                                  <span className="text-gray-500 ml-2">{currentResolution.savedAt instanceof Date ? formatDateTime(currentResolution.savedAt) : formatDateTime(new Date(currentResolution.savedAt))}</span>
                                </div>
                              </div>
                              <p className="text-gray-700 text-[13px] leading-relaxed whitespace-pre-wrap">{currentResolution.content}</p>
                            </div>
                            <div className="flex gap-3 mt-4 justify-end">
                              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-[13px] font-medium hover:bg-gray-300" onClick={editResolution}>Edit</button>
                              <button className="px-4 py-2 bg-red-600 text-white rounded-md text-[13px] font-medium hover:bg-red-700" onClick={deleteResolution}>Delete</button>
                            </div>
                          </div>
                        )}

                        {resolutionState === 'edit' && currentResolution && (
                          <div>
                            <div className="bg-white border border-gray-200 rounded-md p-4 min-h-[200px] relative">
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{currentResolution.authorInitials || 'JD'}</div>
                                <div className="text-[13px] text-gray-600">
                                  <span className="font-medium">{currentResolution.author}</span>
                                  <span className="text-gray-500 ml-2">{currentResolution.savedAt instanceof Date ? formatDateTime(currentResolution.savedAt) : formatDateTime(new Date(currentResolution.savedAt))}</span>
                                </div>
                              </div>
                              <textarea className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:border-blue-500" placeholder="Enter resolution details..." value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} />
                            </div>
                            <div className="flex gap-3 mt-4 justify-end">
                              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-[13px] font-medium hover:bg-gray-300" onClick={cancelEditResolution}>Cancel</button>
                              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700" onClick={updateResolution}>Save</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tasks Tab */}
                    {serviceDetailTab === 'tasks' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="flex justify-between items-center mb-5">
                          <h3 className="text-[15px] font-bold text-gray-800">Tasks</h3>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700" onClick={() => openTaskModal()}>+ Add Task</button>
                        </div>
                        {serviceTasks.length > 0 ? (
                          <div className="space-y-3">
                            {serviceTasks.map((task) => (
                              <div key={task.id} className="flex items-start gap-3 p-3 bg-white border border-blue-200 rounded-md">
                                <input type="checkbox" className="w-[18px] h-[18px] mt-0.5 accent-blue-500 cursor-pointer" checked={task.completed || false} onChange={() => toggleTaskCompletion(task.id)} />
                                <div className="flex-1">
                                  <div className={`text-sm font-bold text-gray-800 mb-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title || task.description}</div>
                                  <div className="text-xs text-gray-500">{task.completed ? `Completed: ${task.due}` : `Assigned to: ${task.assignedTo || 'Unassigned'} | Due: ${task.due}`}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button className="text-xs text-blue-600 font-medium hover:text-blue-800 hover:underline" onClick={() => openTaskModal(task)}>Edit</button>
                                  <span className="text-gray-300">|</span>
                                  <button className="text-xs text-red-600 font-medium hover:text-red-800 hover:underline" onClick={() => deleteTask(task.id)}>Delete</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-lg h-64 flex flex-col justify-center items-center bg-white">
                            <div className="mb-3 text-gray-300">
                              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                                <line x1="12" y1="15" x2="12" y2="15.01"></line>
                              </svg>
                            </div>
                            <h4 className="text-[15px] font-bold text-gray-400">No Task Found</h4>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Checklist Tab */}
                    {serviceDetailTab === 'checklist' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-[15px] font-bold text-gray-800">Checklist</h3>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded transition-colors flex items-center" onClick={() => openChecklistModal()}>+ Add Item</button>
                        </div>
                        {serviceChecklist.length > 0 ? (
                          <div className="space-y-2">
                            {serviceChecklist.map((item) => (
                              <div key={item.id} className="flex items-start gap-3 p-0 bg-white border border-blue-200 rounded-md">
                                <div className="flex items-center w-full gap-2">
                                  <input type="checkbox" className="w-[18px] h-[18px] mt-0.5 accent-blue-500 cursor-pointer ml-4" checked={item.completed || false} onChange={() => toggleChecklistCompletion(item.id)} />
                                  <div className="flex-1 pl-1 flex flex-col justify-center min-h-[54px] py-3">
                                    <div className={`text-[15px] font-bold text-gray-800 mb-1 ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.title || item.name}</div>
                                    <div className="text-xs text-gray-500">Requested: {item.name}</div>
                                  </div>
                                  <div className="flex items-center gap-2 pr-5">
                                    <button className="text-xs text-blue-600 font-medium hover:text-blue-800 hover:underline" onClick={() => openChecklistModal(item)}>Edit</button>
                                    <span className="text-gray-300">|</span>
                                    <button className="text-xs text-red-600 font-medium hover:text-red-800 hover:underline" onClick={() => deleteChecklistItem(item.id)}>Delete</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-lg h-64 flex flex-col justify-center items-center bg-white">
                            <div className="mb-3 text-gray-300">
                              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                                <line x1="12" y1="15" x2="12" y2="15.01"></line>
                              </svg>
                            </div>
                            <h4 className="text-[15px] font-bold text-gray-400">No Item Found</h4>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Work Logs Tab */}
                    {serviceDetailTab === 'workLogs' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-[15px] font-bold text-gray-800">Work Log History</h3>
                          <button onClick={openWorkLogModal} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded transition-colors flex items-center">+ Add Work Log</button>
                        </div>
                        {serviceWorkLogs.length > 0 ? (
                          <div className="flex flex-col gap-4">
                            {serviceWorkLogs.map((log) => (
                              <div key={log.id} className="border border-gray-200 rounded-lg bg-white px-6 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:gap-5">
                                <div className="flex-shrink-0 flex flex-col items-center w-full sm:w-36 mb-2 sm:mb-0">
                                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mb-1">{log.authorInitials || (log.author && log.author.split(' ').map(w => w[0]).join('').toUpperCase())}</div>
                                  <div className="text-xs text-gray-500 text-center">
                                    <span className="font-semibold text-gray-800 block">{log.author}</span>
                                    <span className="block text-gray-400">{log.timestamp}</span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="text-base font-bold text-gray-800 truncate">{log.title}</div>
                                    <button className="text-xs text-red-600 font-medium hover:text-red-800 ml-4" onClick={() => deleteWorkLog(log.id)}>Delete</button>
                                  </div>
                                  <div className="text-[13px] text-gray-700 leading-relaxed mb-2 whitespace-pre-line break-words">{log.description}</div>
                                  {/* Replies recursive */}
                                  <div className="mt-3 space-y-3">
                                    {log.replies && log.replies.map((reply) => (
                                      <ReplyThread
                                        key={reply.id}
                                        reply={reply}
                                        logId={log.id}
                                        replyDrafts={replyDrafts}
                                        setReplyDrafts={setReplyDrafts}
                                        addReply={addReply}
                                        deleteReply={deleteReply}
                                      />
                                    ))}
                                  </div>
                                  {/* Reply Form (root) */}
                                  <div className="mt-3 border border-gray-200 rounded-md bg-white">
                                    <textarea
                                      rows="2"
                                      placeholder="Add a reply..."
                                      className="w-full p-2 text-[13px] border-0 rounded-md focus:outline-none"
                                      value={replyDrafts[`${log.id}-root`] || ''}
                                      onChange={(e) => setReplyDrafts(prev => ({ ...prev, [`${log.id}-root`]: e.target.value }))}
                                    ></textarea>
                                    <div className="flex justify-end gap-2 border-t border-gray-200 p-2 text-xs">
                                      <button className="px-3 py-1 text-gray-600 hover:text-gray-800" onClick={() => setReplyDrafts(prev => ({ ...prev, [`${log.id}-root`]: '' }))}>Cancel</button>
                                      <button className="px-3 py-1 text-blue-600 hover:text-blue-800 font-semibold" onClick={() => addReply(log.id)}>Post</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border border-gray-200 rounded-lg h-80 flex flex-col justify-center items-center bg-white">
                            <div className="mb-4 opacity-50">
                              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                <line x1="9" y1="14" x2="15" y2="14"></line>
                                <line x1="12" y1="11" x2="12" y2="17"></line>
                              </svg>
                            </div>
                            <h4 className="text-[16px] font-bold text-gray-300">No Work Log Found</h4>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Time Analysis Tab */}
                    {serviceDetailTab === 'timeAnalysis' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h3 className="text-[15px] font-bold text-gray-800 mb-4">Time Analysis</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="border border-gray-200 rounded-lg px-4 py-4 bg-gray-50">
                            <p className="text-xs uppercase text-gray-500 mb-1">Response Time</p>
                            <p className="text-2xl font-bold text-gray-900">35 mins</p>
                            <p className="text-xs text-gray-500">Time to first response</p>
                          </div>
                          <div className="border border-gray-200 rounded-lg px-4 py-4 bg-gray-50">
                            <p className="text-xs uppercase text-gray-500 mb-1">Work Time</p>
                            <p className="text-2xl font-bold text-gray-900">2h 20m</p>
                            <p className="text-xs text-gray-500">Logged technician time</p>
                          </div>
                          <div className="border border-gray-200 rounded-lg px-4 py-4 bg-gray-50">
                            <p className="text-xs uppercase text-gray-500 mb-1">SLA Status</p>
                            <p className="text-2xl font-bold text-emerald-600">On Track</p>
                            <p className="text-xs text-gray-500">Within SLA window</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* History Tab */}
                    {serviceDetailTab === 'history' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        <h3 className="text-[15px] font-bold text-gray-800 mb-4">Activity History</h3>
                        <div className="space-y-4">
                          {serviceHistory.map((event, index) => (
                            <div key={index} className="flex gap-3 pb-4 border-b border-gray-100">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{event.initials || event.user.substring(0, 2).toUpperCase()}</div>
                              <div>
                                <div className="text-sm text-gray-800"><strong>{event.user}</strong> {event.action}</div>
                                <div className="text-xs text-gray-400 mt-1">{event.timestamp}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showServiceReportModal && selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold text-[#1f2a44]">Generate Report: #{selectedService.code}</h3>
                  <p className="text-sm text-gray-500">Preview report layout</p>
                </div>
                <button
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                  onClick={closeServiceReport}
                >
                  ✕
                </button>
              </div>

              <div className="p-8 bg-white">
                <div className="flex justify-center">
                  <div className="w-[320px] border border-gray-200 rounded-xl shadow-sm bg-white p-5 space-y-4">
                    <div className="text-center text-xs text-gray-600 space-y-1">
                      <p className="font-bold tracking-[0.2em] text-gray-800">GLOBAL COMFORT GROUP</p>
                      <p className="uppercase text-gray-500">{selectedService.department} Department</p>
                      <p className="text-gray-500">JOR #{selectedService.code}</p>
                    </div>

                    <div className="space-y-2 text-[11px] text-gray-600">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="border border-gray-200 rounded-lg p-2">
                          <p className="uppercase text-[10px] text-gray-500">Requester</p>
                          <p className="text-xs font-semibold text-gray-800">{selectedService.branch}</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-2">
                          <p className="uppercase text-[10px] text-gray-500">Assigned</p>
                          <p className="text-xs font-semibold text-gray-800">John Doe</p>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-2">
                        <p className="uppercase text-[10px] text-gray-500">Job Description</p>
                        <p className="text-xs font-semibold text-gray-800">{selectedService.name}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        <div className="border border-gray-200 rounded-lg p-2 text-center">
                          <p className="uppercase text-[10px] text-gray-500">Issue</p>
                          <p className="text-xs font-semibold text-gray-800">Open</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-2 text-center">
                          <p className="uppercase text-[10px] text-gray-500">Tech</p>
                          <p className="text-xs font-semibold text-gray-800">John Doe</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-2 text-center">
                          <p className="uppercase text-[10px] text-gray-500">Due</p>
                          <p className="text-xs font-semibold text-gray-800">{selectedService.sla}</p>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-2">
                        <p className="uppercase text-[10px] text-gray-500">Action Taken</p>
                        <p className="text-xs text-gray-800 leading-snug">{selectedService.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        <div className="border border-gray-200 rounded-lg p-2">
                          <p className="uppercase text-[10px] text-gray-500">Requested By</p>
                          <p className="text-xs font-semibold text-gray-800">{selectedService.branch}</p>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-2">
                          <p className="uppercase text-[10px] text-gray-500">Approved By</p>
                          <p className="text-xs font-semibold text-gray-800">John Doe</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                    onClick={closeServiceReport}
                  >
                    Cancel
                  </button>
                  <button className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow hover:shadow-md">
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 z-[2000] flex justify-center items-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[420px] mx-4 animate-fadeIn overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-[16px] font-bold text-gray-800">{editingTask ? 'Edit Task' : 'Add Task'}</h3>
                <button className="text-gray-400 hover:text-gray-600 border border-gray-200 rounded p-1 hover:bg-gray-100 transition-colors" onClick={closeTaskModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="p-6 space-y-4 bg-white">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Enter task title..." value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1">Description</label>
                  <textarea rows="3" className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" placeholder="Enter task description..." value={taskDescription} onChange={e => setTaskDescription(e.target.value)} />
                </div>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-[13px] font-medium hover:bg-gray-300" onClick={closeTaskModal}>Cancel</button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700" onClick={saveTask}>{editingTask ? 'Update' : 'Save'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Modal */}
        {showChecklistModal && (
          <div className="fixed inset-0 z-[2000] flex justify-center items-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[420px] mx-4 animate-fadeIn overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-[16px] font-bold text-gray-800">{editingChecklistItem ? 'Edit Item' : 'Add Item'}</h3>
                <button className="text-gray-400 hover:text-gray-600 border border-gray-200 rounded p-1 hover:bg-gray-100 transition-colors" onClick={closeChecklistModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="p-6 space-y-4 bg-white">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Enter name..." value={checklistName} onChange={e => setChecklistName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Enter title..." value={checklistTitle} onChange={e => setChecklistTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1">Description</label>
                  <textarea rows="3" className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" placeholder="Enter description..." value={checklistDescription} onChange={e => setChecklistDescription(e.target.value)} />
                </div>
                <div className="flex justify-end gap-3">
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-[13px] font-medium hover:bg-gray-300" onClick={closeChecklistModal}>Cancel</button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700" onClick={saveChecklistItem}>{editingChecklistItem ? 'Update' : 'Save'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Work Log Modal */}
        {showWorkLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[600px] mx-4 overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-[16px] font-bold text-gray-800">+ Add Work Log</h3>
                <button onClick={closeWorkLogModal} className="text-gray-400 hover:text-gray-600 border border-gray-200 rounded p-1 hover:bg-gray-100 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-5 bg-white">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter work log title..." className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={workLogTitle} onChange={(e) => setWorkLogTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">Description</label>
                  <textarea rows="5" placeholder="Enter description..." className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" value={workLogDescription} onChange={(e) => setWorkLogDescription(e.target.value)}></textarea>
                </div>
              </div>
              <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100 bg-white">
                <button onClick={closeWorkLogModal} className="px-4 py-2 text-[13px] font-semibold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={saveWorkLog} className="px-6 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 z-[1100] flex justify-center items-center bg-black/50 backdrop-blur-sm" onClick={closeAssignModal}>
            <div className="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Assign Request</h3>
                </div>
                <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100 transition-colors" onClick={closeAssignModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department <span className="text-red-500">*</span></label>
                  <select
                    className="w-full p-4 border border-gray-300 rounded-lg text-base text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    value={assignRequestTitle}
                    onChange={(e) => {
                      setAssignRequestTitle(e.target.value)
                      setSelectedTechnician(null)
                    }}
                  >
                    <option value="" disabled>Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="IT Support">IT Support</option>
                    <option value="F&B Service">F&B Service</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Technician <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {techniciansData
                      .filter((tech) => !assignRequestTitle || tech.department === assignRequestTitle)
                      .map((tech) => (
                      <div
                        key={tech.id}
                        className={`relative border-2 rounded-lg p-3 cursor-pointer transition-all hover:border-blue-400 ${selectedTechnician === tech.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                        onClick={() => setSelectedTechnician(tech.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTechnician === tech.id ? 'border-blue-500' : 'border-gray-300'}`}>
                              {selectedTechnician === tech.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
                            </div>
                          </div>
                          <div className="mt-1">
                            <div className={`w-3 h-3 rounded-full ${tech.status === 'online' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-blue-600">{tech.name}</h4>
                            <p className="text-sm text-red-500 font-medium">{tech.role}</p>
                            <p className="text-sm text-gray-500 mt-1">{tech.department} • {tech.openTasks} {tech.taskLabel || 'open tasks'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Start</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input type="date" className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="dd/mm/yyyy" value={scheduledStartDate} onChange={(e) => setScheduledStartDate(e.target.value)} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                    </div>
                    <span className="text-gray-400 font-medium">-</span>
                    <div className="relative flex-1">
                      <input type="date" className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="dd/mm/yyyy" value={scheduledEndDate} onChange={(e) => setScheduledEndDate(e.target.value)} />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors" onClick={closeAssignModal}>Cancel</button>
                <button className="px-6 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm" onClick={confirmAssignment}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper component for nested replies
const ReplyThread = ({ reply, logId, replyDrafts, setReplyDrafts, addReply, deleteReply }) => {
  return (
    <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
      <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-1">
        <span className="font-semibold text-gray-700">{reply.author}</span>
        <span className="text-gray-400">{reply.timestamp}</span>
      </div>
      <div className="text-[13px] text-gray-700 leading-relaxed">{reply.text}</div>
      <div className="flex gap-3 text-[12px] text-blue-600 mt-2">
        <button
          className="hover:underline"
          onClick={() => {
            const key = `${logId}-${reply.id}`
            setReplyDrafts(prev => ({ ...prev, [key]: prev[key] || '' }))
          }}
        >
          Reply
        </button>
        <button
          className="text-red-600 hover:underline"
          onClick={() => deleteReply(logId, reply.id)}
        >
          Delete
        </button>
      </div>

      {/* Nested reply box */}
      {replyDrafts[`${logId}-${reply.id}`] !== undefined && (
        <div className="mt-2 border border-gray-200 rounded bg-white">
          <textarea
            rows="2"
            placeholder="Add a reply..."
            className="w-full p-2 text-[13px] border-0 rounded-md focus:outline-none"
            value={replyDrafts[`${logId}-${reply.id}`] || ''}
            onChange={(e) =>
              setReplyDrafts(prev => ({ ...prev, [`${logId}-${reply.id}`]: e.target.value }))
            }
          />
          <div className="flex justify-end gap-2 border-t border-gray-200 p-2 text-xs">
            <button
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
              onClick={() =>
                setReplyDrafts(prev => {
                  const next = { ...prev }
                  delete next[`${logId}-${reply.id}`]
                  return next
                })
              }
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-blue-600 hover:text-blue-800 font-semibold"
              onClick={() => addReply(logId, reply.id)}
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Child replies */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="mt-3 space-y-2 border-l border-gray-200 pl-3">
          {reply.replies.map(child => (
            <ReplyThread
              key={child.id}
              reply={child}
              logId={logId}
              replyDrafts={replyDrafts}
              setReplyDrafts={setReplyDrafts}
              addReply={addReply}
              deleteReply={deleteReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SectionE
