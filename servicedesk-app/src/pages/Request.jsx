import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SidebarToggle from "../components/SidebarToggle";
import Header from "../components/Header";

import { getRequestTickets, assignTechnician, getRequestTickeyById, addResolution, addTask, editTask, deleteTaskRequest, addChecklist, editChecklist, deleteChecklist } from "../api/requestApi.js"

// Sample data
const initialRequestsData = [
  {
    id: "JOR-2025-001",
    subject: "Request for Testing and Commissioning",
    requester: "S42 Fairview",
    assignedTo: "John Doe",
    dueBy: "Nov 10, 2025",
    status: "Open",
    priority: "High",
    assigned: true,
    createdDate: "Nov 5, 2025",
    description:
      "Biometric system not functioning properly at the main entrance.",
    category: "ICT",
    technician: "John Doe",
    history: [
      {
        user: "John Doe",
        action: "was assigned to this request",
        timestamp: "Nov 5, 2025 at 3:45 PM",
        initials: "JD",
      },
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 5, 2025 at 3:43 PM",
        initials: "SY",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Diagnose biometric system issue",
        description: "Diagnose biometric system issue",
        assignedTo: "Alvin G Claveria",
        due: "Nov 6, 2025",
        completed: false,
      },
      {
        id: 2,
        title: "Contact hardware vendor",
        description: "Contact hardware vendor",
        assignedTo: "John Doe",
        due: "Nov 5, 2025",
        completed: true,
      },
    ],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Initial Investigation",
        description:
          "Investigated the reported issue with the desktop computer. Found that the system is experiencing hardware failure. Ordered replacement parts and scheduled installation.",
        author: "John Doe",
        authorInitials: "JD",
        timestamp: "Nov 5, 2025 10:30 AM",
        replies: [
          {
            id: 11,
            author: "Chris Mendoza",
            authorInitials: "CM",
            timestamp: "1d ago",
            text: "Thanks for the update. I appreciate you looking into the issue so quickly.",
          },
        ],
      },
      {
        id: 2,
        title: "Parts Installed",
        description:
          "Replaced motherboard and RAM modules. System is now operational and running performance tests.",
        author: "Alvin G Claveria",
        authorInitials: "AG",
        timestamp: "Nov 5, 2025 3:15 PM",
        replies: [],
      },
      {
        id: 3,
        title: "Final Testing",
        description:
          "Completed all performance tests. System is stable and functioning properly. Awaiting user confirmation.",
        author: "John Doe",
        authorInitials: "JD",
        timestamp: "Nov 5, 2025 5:45 PM",
        replies: [],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-002",
    subject: "Request for Grievance Hearing",
    requester: "Jochel Mae Ruiz",
    assignedTo: "",
    dueBy: "Nov 13, 2025",
    status: "Open",
    priority: "High",
    assigned: false,
    createdDate: "Nov 5, 2025",
    description: "Formal request for a grievance hearing with HR department regarding workplace concerns and employee rights.",
    category: "HR",
    technician: "",
    history: [
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 5, 2025 at 9:15 AM",
        initials: "SY",
      },
    ],
    tasks: [],
    checklists: [],
    workLogs: [],
    resolution: null,
  },
  {
    id: "JOR-2025-003",
    subject: "For door lock Access",
    requester: "ICT",
    assignedTo: "John Doe",
    dueBy: "Nov 5, 2025",
    status: "Open",
    priority: "Medium",
    assigned: true,
    createdDate: "Nov 5, 2025",
    description: "Request to grant door lock access to the server room for new IT staff members. Biometric access cards need to be programmed.",
    category: "ICT",
    technician: "John Doe",
    history: [
      {
        user: "John Doe",
        action: "was assigned to this request",
        timestamp: "Nov 5, 2025 at 11:20 AM",
        initials: "JD",
      },
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 5, 2025 at 11:18 AM",
        initials: "SY",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Verify employee authorization",
        description: "Check with HR for clearance",
        assignedTo: "John Doe",
        due: "Nov 5, 2025",
        completed: true,
      },
      {
        id: 2,
        title: "Program access cards",
        description: "Set up biometric access for 3 employees",
        assignedTo: "John Doe",
        due: "Nov 5, 2025",
        completed: false,
      },
    ],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Authorization Verified",
        description: "Confirmed with HR that all three employees have proper clearance for server room access.",
        author: "John Doe",
        authorInitials: "JD",
        timestamp: "Nov 5, 2025 1:45 PM",
        replies: [],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-004",
    subject: "Request for Audit",
    requester: "MGH",
    assignedTo: "Alvin G Claveria",
    dueBy: "Nov 18, 2025",
    status: "Open",
    priority: "High",
    assigned: true,
    createdDate: "Nov 5, 2025",
    description: "Financial department request for a comprehensive system audit to ensure compliance with regulatory requirements. Need to review access logs, user permissions, and data integrity.",
    category: "Audit",
    technician: "Alvin G Claveria",
    history: [
      {
        user: "Alvin G Claveria",
        action: "was assigned to this request",
        timestamp: "Nov 6, 2025 at 8:30 AM",
        initials: "AG",
      },
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 5, 2025 at 4:20 PM",
        initials: "SY",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Gather audit requirements",
        description: "Meet with finance team to understand scope",
        assignedTo: "Alvin G Claveria",
        due: "Nov 8, 2025",
        completed: true,
      },
      {
        id: 2,
        title: "Review access logs",
        description: "Analyze system access logs for past 6 months",
        assignedTo: "Alvin G Claveria",
        due: "Nov 12, 2025",
        completed: false,
      },
      {
        id: 3,
        title: "Prepare audit report",
        description: "Compile findings and recommendations",
        assignedTo: "Alvin G Claveria",
        due: "Nov 17, 2025",
        completed: false,
      },
    ],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Initial Meeting Completed",
        description: "Met with finance team to discuss audit scope. Will focus on user access permissions, transaction logs, and data security protocols.",
        author: "Alvin G Claveria",
        authorInitials: "AG",
        timestamp: "Nov 7, 2025 10:00 AM",
        replies: [],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-005",
    subject: "Graphics / Layout Design",
    requester: "S44 Empire",
    assignedTo: "John Doe",
    dueBy: "Nov 7, 2025",
    status: "Open",
    priority: "Medium",
    assigned: true,
    createdDate: "Nov 5, 2025",
    description: "Need professional graphics design for new employee onboarding materials including welcome packet, training manual covers, and orientation presentation templates.",
    category: "Design",
    technician: "John Doe",
    history: [
      {
        user: "John Doe",
        action: "was assigned to this request",
        timestamp: "Nov 5, 2025 at 2:10 PM",
        initials: "JD",
      },
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 5, 2025 at 2:08 PM",
        initials: "SY",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Design welcome packet cover",
        description: "Create modern design with company branding",
        assignedTo: "John Doe",
        due: "Nov 6, 2025",
        completed: true,
      },
      {
        id: 2,
        title: "Create presentation templates",
        description: "Design 5 different slide templates",
        assignedTo: "John Doe",
        due: "Nov 7, 2025",
        completed: false,
      },
    ],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Design Draft Submitted",
        description: "Submitted initial design concepts for welcome packet. Waiting for feedback from S44 Empire team.",
        author: "John Doe",
        authorInitials: "JD",
        timestamp: "Nov 6, 2025 3:30 PM",
        replies: [
          {
            id: 11,
            author: "S44 Empire",
            authorInitials: "SE",
            timestamp: "Nov 6, 2025 5:15 PM",
            text: "Looks great! Please proceed with the presentation templates using the same color scheme.",
          },
        ],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-006",
    subject: "Server Maintenance Request",
    requester: "IT Department",
    assignedTo: "Chris Mendoza",
    dueBy: "Nov 12, 2025",
    status: "On hold",
    priority: "High",
    assigned: true,
    createdDate: "Nov 6, 2025",
    description: "Scheduled server maintenance pending approval from management. Request on hold until budget clearance.",
    category: "ICT",
    technician: "Chris Mendoza",
    history: [
      {
        user: "Chris Mendoza",
        action: "put this request on hold",
        timestamp: "Nov 6, 2025 at 2:30 PM",
        initials: "CM",
      },
      {
        user: "Chris Mendoza",
        action: "was assigned to this request",
        timestamp: "Nov 6, 2025 at 10:00 AM",
        initials: "CM",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Obtain budget approval",
        description: "Submit budget request to management",
        assignedTo: "Chris Mendoza",
        due: "Nov 10, 2025",
        completed: false,
      },
      {
        id: 2,
        title: "Schedule maintenance window",
        description: "Coordinate with departments for downtime",
        assignedTo: "Chris Mendoza",
        due: "Nov 12, 2025",
        completed: false,
      },
    ],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Awaiting Management Approval",
        description: "Request is on hold pending budget approval for hardware purchases. Expected response by Nov 10, 2025.",
        author: "Chris Mendoza",
        authorInitials: "CM",
        timestamp: "Nov 6, 2025 2:30 PM",
        replies: [],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-007",
    subject: "Network Infrastructure Upgrade",
    requester: "CED",
    assignedTo: "Alvin G Claveria",
    dueBy: "Nov 15, 2025",
    status: "On hold",
    priority: "Medium",
    assigned: true,
    createdDate: "Nov 7, 2025",
    description: "Network upgrade project on hold due to pending vendor confirmation on equipment availability.",
    category: "Infrastructure",
    technician: "Alvin G Claveria",
    history: [
      {
        user: "Alvin G Claveria",
        action: "marked this as on hold",
        timestamp: "Nov 7, 2025 at 4:15 PM",
        initials: "AG",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Confirm vendor equipment availability",
        description: "Contact vendor for stock confirmation",
        assignedTo: "Alvin G Claveria",
        due: "Nov 13, 2025",
        completed: false,
      },
      {
        id: 2,
        title: "Create network upgrade plan",
        description: "Document upgrade steps and requirements",
        assignedTo: "Alvin G Claveria",
        due: "Nov 14, 2025",
        completed: false,
      },
    ],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Vendor Delay Notification",
        description: "Vendor informed us that network equipment is currently out of stock. Expected delivery in 10 business days. Project on hold until equipment arrives.",
        author: "Alvin G Claveria",
        authorInitials: "AG",
        timestamp: "Nov 7, 2025 4:15 PM",
        replies: [],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-008",
    subject: "Software License Renewal",
    requester: "Admin",
    assignedTo: "",
    dueBy: "Nov 20, 2025",
    status: "On hold",
    priority: "Low",
    assigned: false,
    createdDate: "Nov 8, 2025",
    description: "Software license renewal on hold awaiting procurement department confirmation and budget approval for annual licenses.",
    category: "Software",
    technician: "",
    history: [
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 8, 2025 at 3:00 PM",
        initials: "SY",
      },
    ],
    tasks: [],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Pending Procurement Review",
        description: "Submitted renewal request to procurement department. Awaiting budget approval for 50 software licenses totaling $15,000.",
        author: "Admin",
        authorInitials: "AD",
        timestamp: "Nov 8, 2025 3:30 PM",
        replies: [],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-009",
    subject: "CCTV Camera Installation",
    requester: "BIG",
    assignedTo: "Chris Mendoza",
    dueBy: "Nov 14, 2025",
    status: "Open",
    priority: "High",
    assigned: true,
    createdDate: "Nov 9, 2025",
    description: "Installation of 12 new CCTV cameras in the parking lot and main entrance areas to enhance security monitoring capabilities.",
    category: "Security",
    technician: "Chris Mendoza",
    history: [
      {
        user: "Chris Mendoza",
        action: "was assigned to this request",
        timestamp: "Nov 9, 2025 at 9:00 AM",
        initials: "CM",
      },
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 9, 2025 at 8:45 AM",
        initials: "SY",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Site survey and assessment",
        description: "Identify optimal camera placement locations",
        assignedTo: "Chris Mendoza",
        due: "Nov 10, 2025",
        completed: true,
      },
      {
        id: 2,
        title: "Equipment procurement",
        description: "Order cameras and mounting hardware",
        assignedTo: "Chris Mendoza",
        due: "Nov 11, 2025",
        completed: false,
      },
      {
        id: 3,
        title: "Installation and testing",
        description: "Install all cameras and test connectivity",
        assignedTo: "Chris Mendoza",
        due: "Nov 14, 2025",
        completed: false,
      },
    ],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Site Survey Completed",
        description: "Completed site survey. Identified 12 strategic locations for camera placement that will provide optimal coverage of parking areas and main entrances.",
        author: "Chris Mendoza",
        authorInitials: "CM",
        timestamp: "Nov 10, 2025 11:30 AM",
        replies: [],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-010",
    subject: "Employee Training Portal Access",
    requester: "CMD",
    assignedTo: "",
    dueBy: "Nov 16, 2025",
    status: "Open",
    priority: "Medium",
    assigned: false,
    createdDate: "Nov 10, 2025",
    description: "Request to grant 25 new employees access to the online training portal for mandatory orientation courses.",
    category: "Training",
    technician: "",
    history: [
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 10, 2025 at 1:20 PM",
        initials: "SY",
      },
    ],
    tasks: [],
    checklists: [],
    workLogs: [],
    resolution: null,
  },
  {
    id: "JOR-2025-011",
    subject: "Printer Maintenance and Repair",
    requester: "S42 Fairview",
    assignedTo: "Alvin G Claveria",
    dueBy: "Nov 12, 2025",
    status: "Open",
    priority: "Low",
    assigned: true,
    createdDate: "Nov 11, 2025",
    description: "Office printer on 3rd floor is experiencing paper jam issues and print quality degradation. Needs maintenance and possible parts replacement.",
    category: "Hardware",
    technician: "Alvin G Claveria",
    history: [
      {
        user: "Alvin G Claveria",
        action: "was assigned to this request",
        timestamp: "Nov 11, 2025 at 10:15 AM",
        initials: "AG",
      },
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 11, 2025 at 10:00 AM",
        initials: "SY",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Diagnose printer issue",
        description: "Inspect printer and identify problem",
        assignedTo: "Alvin G Claveria",
        due: "Nov 11, 2025",
        completed: true,
      },
      {
        id: 2,
        title: "Order replacement parts",
        description: "Order new roller kit and toner",
        assignedTo: "Alvin G Claveria",
        due: "Nov 12, 2025",
        completed: false,
      },
    ],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Initial Diagnosis",
        description: "Printer roller mechanism is worn out causing frequent paper jams. Toner cartridge also needs replacement. Parts ordered.",
        author: "Alvin G Claveria",
        authorInitials: "AG",
        timestamp: "Nov 11, 2025 2:45 PM",
        replies: [],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-012",
    subject: "Database Backup Configuration",
    requester: "ICT",
    assignedTo: "John Doe",
    dueBy: "Nov 17, 2025",
    status: "On hold",
    priority: "High",
    assigned: true,
    createdDate: "Nov 11, 2025",
    description: "Configure automated database backup system for critical business data. Project on hold pending storage infrastructure upgrade.",
    category: "Database",
    technician: "John Doe",
    history: [
      {
        user: "John Doe",
        action: "put this request on hold",
        timestamp: "Nov 11, 2025 at 4:00 PM",
        initials: "JD",
      },
      {
        user: "John Doe",
        action: "was assigned to this request",
        timestamp: "Nov 11, 2025 at 2:00 PM",
        initials: "JD",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Wait for storage upgrade completion",
        description: "Storage infrastructure upgrade in progress",
        assignedTo: "John Doe",
        due: "Nov 15, 2025",
        completed: false,
      },
      {
        id: 2,
        title: "Configure backup schedules",
        description: "Setup automated backup timing and retention",
        assignedTo: "John Doe",
        due: "Nov 17, 2025",
        completed: false,
      },
    ],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Storage Capacity Issue",
        description: "Current backup storage is at 95% capacity. Need to wait for new storage infrastructure to be installed before proceeding with backup configuration.",
        author: "John Doe",
        authorInitials: "JD",
        timestamp: "Nov 11, 2025 4:00 PM",
        replies: [],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-013",
    subject: "WiFi Coverage Enhancement",
    requester: "CED",
    assignedTo: "Chris Mendoza",
    dueBy: "Nov 19, 2025",
    status: "Open",
    priority: "Medium",
    assigned: true,
    createdDate: "Nov 12, 2025",
    description: "Improve WiFi coverage in conference rooms and common areas. Multiple dead zones reported by employees.",
    category: "Network",
    technician: "Chris Mendoza",
    history: [
      {
        user: "Chris Mendoza",
        action: "was assigned to this request",
        timestamp: "Nov 12, 2025 at 9:30 AM",
        initials: "CM",
      },
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 12, 2025 at 9:15 AM",
        initials: "SY",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Conduct WiFi site survey",
        description: "Map current coverage and identify dead zones",
        assignedTo: "Chris Mendoza",
        due: "Nov 13, 2025",
        completed: false,
      },
      {
        id: 2,
        title: "Install additional access points",
        description: "Deploy 4-6 new access points in strategic locations",
        assignedTo: "Chris Mendoza",
        due: "Nov 18, 2025",
        completed: false,
      },
    ],
    checklists: [],
    workLogs: [],
    resolution: null,
  },
  {
    id: "JOR-2025-014",
    subject: "Email Migration Project",
    requester: "GCERC",
    assignedTo: "",
    dueBy: "Nov 25, 2025",
    status: "On hold",
    priority: "Medium",
    assigned: false,
    createdDate: "Nov 13, 2025",
    description: "Migrate 150 email accounts to new email server platform. On hold pending final approval from management and budget allocation.",
    category: "Email Systems",
    technician: "",
    history: [
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 13, 2025 at 10:00 AM",
        initials: "SY",
      },
    ],
    tasks: [],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "Awaiting Management Approval",
        description: "Email migration project submitted to management for review. Pending approval for budget ($12,000) and scheduled downtime window.",
        author: "System",
        authorInitials: "SY",
        timestamp: "Nov 13, 2025 10:15 AM",
        replies: [],
      },
    ],
    resolution: null,
  },
  {
    id: "JOR-2025-015",
    subject: "VPN Access for Remote Workers",
    requester: "MGH",
    assignedTo: "Alvin G Claveria",
    dueBy: "Nov 15, 2025",
    status: "Open",
    priority: "High",
    assigned: true,
    createdDate: "Nov 13, 2025",
    description: "Setup VPN access for 10 remote workers who need secure connection to company network and resources.",
    category: "Network",
    technician: "Alvin G Claveria",
    history: [
      {
        user: "Alvin G Claveria",
        action: "was assigned to this request",
        timestamp: "Nov 13, 2025 at 2:45 PM",
        initials: "AG",
      },
      {
        user: "System",
        action: "created this request",
        timestamp: "Nov 13, 2025 at 2:30 PM",
        initials: "SY",
      },
    ],
    tasks: [
      {
        id: 1,
        title: "Configure VPN server",
        description: "Setup and test VPN server configuration",
        assignedTo: "Alvin G Claveria",
        due: "Nov 14, 2025",
        completed: true,
      },
      {
        id: 2,
        title: "Create user accounts",
        description: "Setup VPN accounts for 10 users",
        assignedTo: "Alvin G Claveria",
        due: "Nov 15, 2025",
        completed: false,
      },
      {
        id: 3,
        title: "Provide user documentation",
        description: "Create setup guide for remote workers",
        assignedTo: "Alvin G Claveria",
        due: "Nov 15, 2025",
        completed: false,
      },
    ],
    checklists: [],
    workLogs: [
      {
        id: 1,
        title: "VPN Server Configuration Complete",
        description: "Successfully configured VPN server with latest security protocols. Server is ready for user account setup.",
        author: "Alvin G Claveria",
        authorInitials: "AG",
        timestamp: "Nov 14, 2025 11:00 AM",
        replies: [],
      },
    ],
    resolution: null,
  },
];

const problemsData = [
  {
    id: "PRB-0845",
    description: "Network connectivity issues in Building A",
    category: "Infrastructure",
    status: "Open",
    priority: "High",
  },
  {
    id: "PRB-0844",
    description: "Email server intermittent failures",
    category: "Email Systems",
    status: "Investigating",
    priority: "High",
  },
  {
    id: "PRB-0843",
    description: "Database performance degradation",
    category: "Database",
    status: "Open",
    priority: "Medium",
  },
];

const IGNORED_DUE_VALUES = new Set(["-", "tbd", "n/a", "none"]);

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const parseDueDate = (dueString) => {
  if (!dueString || typeof dueString !== "string") return null;
  const trimmed = dueString.trim();
  if (!trimmed) return null;
  if (IGNORED_DUE_VALUES.has(trimmed.toLowerCase())) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return startOfDay(parsed);
};

function Request() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [requests, setRequests] = useState(initialRequestsData);
  const [currentView, setCurrentView] = useState("requests");
  const [filter, setFilter] = useState("unassigned");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionState, setResolutionState] = useState("empty"); // empty, input, display, edit
  const [currentResolution, setCurrentResolution] = useState(null);
  const [showResolutionHistoryModal, setShowResolutionHistoryModal] =
    useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [successTitle, setSuccessTitle] = useState("");
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskId, setTaskId] = useState("")
  const [editingTask, setEditingTask] = useState(null);

  // Assign Request Modal State
  const [assignRequestTitle, setAssignRequestTitle] = useState("Engineering");
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [scheduledStartDate, setScheduledStartDate] = useState("");
  const [scheduledEndDate, setScheduledEndDate] = useState("");

  // Technicians data for Assign Request modal
  const techniciansData = [
    {
      id: 1,
      name: "John Doe",
      role: "Senior Technician",
      department: "IT Support",
      openTasks: 3,
      taskLabel: "open tickets",
      status: "online",
    },
    {
      id: 2,
      name: "Carla Mendoza",
      role: "Systems Engineer",
      department: "Engineering",
      openTasks: 2,
      taskLabel: "open tasks",
      status: "online",
    },
    {
      id: 3,
      name: "Miguel Santos",
      role: "Maintenance Lead",
      department: "Engineering",
      openTasks: 4,
      taskLabel: "open tasks",
      status: "online",
    },
    {
      id: 4,
      name: "Anna Cruz",
      role: "Housekeeping Supervisor",
      department: "Housekeeping",
      openTasks: 1,
      taskLabel: "open tickets",
      status: "online",
    },
    {
      id: 5,
      name: "Roberto Lim",
      role: "Room Attendant",
      department: "Housekeeping",
      openTasks: 5,
      taskLabel: "open tasks",
      status: "offline",
    },
    {
      id: 6,
      name: "Patricia Reyes",
      role: "F&B Coordinator",
      department: "F&B Service",
      openTasks: 2,
      taskLabel: "open tickets",
      status: "online",
    },
    {
      id: 7,
      name: "James Garcia",
      role: "Banquet Supervisor",
      department: "F&B Service",
      openTasks: 3,
      taskLabel: "open tasks",
      status: "offline",
    },
  ];
  const [isWorkLogModalOpen, setIsWorkLogModalOpen] = useState(false);
  const [workLogTitle, setWorkLogTitle] = useState("");
  const [workLogDescription, setWorkLogDescription] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});
  const [workLogToDelete, setWorkLogToDelete] = useState(null);
  const [showWorkLogDeleteModal, setShowWorkLogDeleteModal] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  // Checklist modal & input state -------------------------------
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [departments, setDepartments] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [filteredTechnicians, setFilteredTechnicians] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [stats, setStats] = useState({})

  const fetchTickets = async() => {
    const res = await getRequestTickets();

    if(res.success){
      setTickets(res.tickets);
      setFilteredTickets(res.tickets.filter((ticket) => ticket.assignedTo === null));
      setDepartments(res.departments)
      setTechnicians(res.technicians)
      setStats(res.stats);
    }
  }

  useEffect(() => {
    if (!assignRequestTitle || !Array.isArray(technicians)) {
      setFilteredTechnicians([]);
      return;
    }

    const filtered = technicians.filter(
      (tech) => String(tech.department_id) === String(assignRequestTitle)
    );

    setFilteredTechnicians(filtered);
  }, [assignRequestTitle]);

  useEffect(() => {
    if(!filter){
      setFilteredTickets(tickets)
    }

    if(filter === "assigned"){
      setFilteredTickets(tickets.filter((ticket) => ticket.assignedTo != null))
    }else if(filter === "open"){
      setFilteredTickets(tickets.filter((ticket) => ticket.status === "open"))
    }else if(filter === "onhold"){
      setFilteredTickets(tickets.filter((ticket) => ticket.Status === "onHold"))
    }else if(filter === "unassigned"){
      setFilteredTickets(tickets.filter((ticket) => ticket.assignedTo === null))
    }else{
      setFilteredTickets(tickets)
    }

  }, [filter])

  useEffect(() => {
    fetchTickets()
  },[])

  // Checklist logic handlers -----------------------------------
  const openAddItemModal = (item = null) => {
    if (item) {
      setEditingItem(item.id);
      setItemName(item.name || "");
      setItemTitle(item.title || "");
      setItemDescription(item.description || "");
    } else {
      setEditingItem(null);
      setItemName("");
      setItemTitle("");
      setItemDescription("");
    }
    setShowAddItemModal(true);
  };

  const closeAddItemModal = () => {
    setShowAddItemModal(false);
    setItemName("");
    setItemTitle("");
    setItemDescription("");
    setEditingItem(null);
  };

  const saveChecklistItem = async() => {
    if (!itemName.trim()) {
      alert("Please enter a name.");
      return;
    }
    if (!itemTitle.trim()) {
      alert("Please enter a title.");
      return;
    }
    // if (selectedRequest) {
      // if (editingItem) {
      //   // Update existing item
      //   const itemIndex = selectedRequest.checklists.findIndex(
      //     (i) => i.id === editingItem.id,
      //   );
      //   if (itemIndex !== -1) {
      //     selectedRequest.checklists[itemIndex] = {
      //       ...selectedRequest.checklists[itemIndex],
      //       name: itemName,
      //       title: itemTitle,
      //       description: itemDescription,
      //     };
      //     setSelectedRequest({ ...selectedRequest });
          
      //   }
      // } else {
      //   // Create new item
      //   const newItem = {
      //     id: Date.now(),
      //     name: itemName,
      //     title: itemTitle,
      //     description: itemDescription,
      //     completed: false,
      //   };
      //   if (!selectedRequest.checklists) {
      //     selectedRequest.checklists = [];
      //   }
      //   selectedRequest.checklists.push(newItem);
      //   setSelectedRequest({ ...selectedRequest });
      // }
      const res = editingItem ? await editChecklist(selectedRequest.id, editingItem, itemName, itemTitle, itemDescription) : await addChecklist(selectedRequest.id, itemName, itemTitle, itemDescription)

      showSuccessNotification("Item updated successfully", "Item Updated");
      showSuccessNotification("Item added successfully", "Item Added");
      fetchRequestById(selectedRequest.id)
      closeAddItemModal();
    // }
  };

  const deleteChecklistItem = async(checklistId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteChecklist(selectedRequest.id, checklistId)
      fetchRequestById(selectedRequest.id)
      showSuccessNotification("Item deleted successfully", "Item Deleted");
    }
  };

  const toggleChecklistItemCompletion = (itemId) => {
    if (selectedRequest && selectedRequest.checklists) {
      const item = selectedRequest.checklists.find((i) => i.id === itemId);
      if (item) {
        item.completed = !item.completed;
        setSelectedRequest({ ...selectedRequest });
      }
    }
  };

  const openReportModal = () => {
    if (selectedRequest) {
      setIsReportModalOpen(true);
    }
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
  };

  const exportReport = () => {
    showSuccessNotification("Report exported successfully", "Report Ready");
    setIsReportModalOpen(false);
  };

  const formatDateTime = (date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  };

  const showSuccessNotification = (message = "Success", title = "Success") => {
    setSuccessMessage(message);
    setSuccessTitle(title);
    setShowSuccessToast(true);
    setShowSuccessModal(true);

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  const showLanding = () => setCurrentView("landing");
  const showRequests = () => setCurrentView("requests");
  const showProblems = () => setCurrentView("problems");
  
  const fetchRequestById = async (requestId) => {
    const request = await getRequestTickeyById(requestId);

    setSelectedRequest(request);
    // Initialize resolution state based on request data
    setCurrentResolution(request.resolution[0]);
    setResolutionState("display");
    setReplyDrafts({});
    setIsWorkLogModalOpen(false);
    setWorkLogTitle("");
    setWorkLogDescription("");
  }

  const openRequestModal = async(requestId) => {
    fetchRequestById(requestId)

    setShowRequestModal(true);
    setEditMode(false);
    setActiveTab("details");
    setResolutionNotes("");
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setSelectedRequest(null);
    setEditMode(false);
    setActiveTab("details");
    setResolutionState("empty");
    setCurrentResolution(null);
    setReplyDrafts({});
    setIsWorkLogModalOpen(false);
    setWorkLogTitle("");
    setWorkLogDescription("");
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const openAssignModal = (request = null) => {
    if (request) {
      setSelectedRequest(request);
    }
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssignRequestTitle("");
    setSelectedTechnician(null);
    setScheduledStartDate("");
    setScheduledEndDate("");
    setSelectedTicket("")
    if (!showRequestModal) {
      setSelectedRequest(null);
    }
  };

  const confirmAssignment = async() => {
    if (!assignRequestTitle.trim()) {
      alert("Please select a department.");
      return;
    }
    if (!selectedTechnician) {
      alert("Please select a technician.");
      return;
    }
    if (!selectedRequest) {
      alert("No request selected.");
      return;
    }

    const res = await assignTechnician(selectedTicket, selectedTechnician)

    if(res.success){
        showSuccessNotification(
        "Request assigned successfully",
        "Assigned Successfully",
      );
      closeAssignModal();
      fetchTickets()
    }

    // const technician = techniciansData.find(
    //   (tech) => tech.id === selectedTechnician,
    // );
    // const updatedRequest = {
    //   ...selectedRequest,
    //   assigned: true,
    //   assignedTo: technician ? technician.name : selectedRequest.assignedTo,
    //   status: "Assigned",
    // };

    // setRequests((prev) =>
    //   prev.map((req) => (req.id === updatedRequest.id ? updatedRequest : req)),
    // );
    // if (showRequestModal) {
    //   setSelectedRequest(updatedRequest);
    // }
  };

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "resolution") {
      initializeResolutionState();
    }
  };

  const initializeResolutionState = () => {
    if (selectedRequest?.resolution) {
      setCurrentResolution(selectedRequest.resolution[0]);
      setResolutionState("display");
      setResolutionNotes(selectedRequest.resolution.content || "");
    } else {
      setResolutionState("empty");
      setCurrentResolution(null);
      setResolutionNotes("");
    }
  };

  const showResolutionInput = () => {
    setResolutionState("input");
    setResolutionNotes("");
  };

  const saveResolution = async(draft=false) => {
    // Track history for initial save
    // let prevHistory = [];
    // if (
    //   selectedRequest &&
    //   selectedRequest.resolution &&
    //   selectedRequest.resolution.history
    // ) {
    //   prevHistory = selectedRequest.resolution.history;
    // }

    const content = resolutionNotes.trim();
    if (!content) {
      alert("Please enter resolution details before saving.");
      return;
    }

    const res = await addResolution(selectedRequest.id, content, draft)
    // const now = new Date();
    // const resolution = {
    //   content: content,
    //   status: "saved",
    //   savedAt: now,
    //   author: "John Doe",
    //   authorInitials: "JD",
    //   history: [
    //     ...prevHistory,
    //     {
    //       date: now,
    //       author: "John Doe",
    //       isCurrent: true,
    //     },
    //   ],
    // };
    setCurrentResolution(res.resolution);
    setResolutionState("display");
    fetchRequestById(selectedRequest.id)
    showSuccessNotification(
      "Resolution saved successfully",
      "Saved Successfully",
    );
  };

  const saveResolutionDraft = () => {
    const content = resolutionNotes.trim();
    const now = new Date();
    const resolution = {
      content: content,
      status: "draft",
      savedAt: now,
      author: "John Doe",
      authorInitials: "JD",
    };
    setCurrentResolution(resolution);
    if (selectedRequest) {
      selectedRequest.resolution = resolution;
    }
    showSuccessNotification("Resolution saved as draft", "Draft Saved");
  };

  const editResolution = () => {
    if (!currentResolution) return;
    setResolutionState("edit");
    setResolutionNotes(currentResolution.content);
  };

  const cancelEditResolution = () => {
    if (currentResolution) {
      setResolutionState("display");
    } else {
      setResolutionState("empty");
    }
    setResolutionNotes("");
  };

  const updateResolution = () => {
    // Track resolution edit history
    let prevHistory = [];
    if (
      selectedRequest &&
      selectedRequest.resolution &&
      selectedRequest.resolution.history
    ) {
      prevHistory = selectedRequest.resolution.history;
      if (prevHistory.length > 0) {
        prevHistory = prevHistory.map((edit, idx) => ({
          ...edit,
          isCurrent: false,
        }));
      }
    }

    const content = resolutionNotes.trim();
    if (!content) {
      alert("Please enter resolution details before saving.");
      return;
    }
    const now = new Date();
    const updated = {
      ...currentResolution,
      content: content,
      savedAt: now,
      history: [
        ...prevHistory,
        {
          date: now,
          author: "John Doe",
          isCurrent: true,
        },
      ],
    };
    setCurrentResolution(updated);
    setResolutionState("display");
    if (selectedRequest) {
      selectedRequest.resolution = updated;
    }
    showSuccessNotification(
      "Resolution updated successfully",
      "Updated Successfully",
    );
  };

  const deleteResolution = () => {
    setShowDeleteModal(true);
  };

  const confirmResolutionDeletion = () => {
    setCurrentResolution(null);
    setResolutionState("empty");
    setResolutionNotes("");
    if (selectedRequest) {
      selectedRequest.resolution = null;
    }
    setShowDeleteModal(false);
    showSuccessNotification(
      "Resolution deleted successfully",
      "Deleted Successfully",
    );
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const openAssignTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskTitle(task.title || task.description || "");
      setTaskDescription(task.description || "");
      setTaskId(task.id)
    } else {
      setEditingTask(null);
      setTaskTitle("");
      setTaskDescription("");
    }
    setShowAssignTaskModal(true);
  };

  const closeAssignTaskModal = () => {
    setShowAssignTaskModal(false);
    setTaskTitle("");
    setTaskDescription("");
    setEditingTask(null);
  };

  const saveTask = () => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (selectedRequest) {
      if (editingTask) {
        // Update existing task
        const taskIndex = selectedRequest.tasks.findIndex(
          (t) => t.id === editingTask.id,
        );
        if (taskIndex !== -1) {
          selectedRequest.tasks[taskIndex] = {
            ...selectedRequest.tasks[taskIndex],
            title: taskTitle,
            description: taskDescription,
          };
          setSelectedRequest({ ...selectedRequest });
          showSuccessNotification("Task updated successfully", "Task Updated");
        }
      } else {
        // Create new task
        const newTask = {
          id: selectedRequest.tasks.length + 1,
          title: taskTitle,
          description: taskDescription,
          assignedTo: "Alvin G Claveria",
          due: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          completed: false,
        };

        if (!selectedRequest.tasks) {
          selectedRequest.tasks = [];
        }
        // Use array spread for full React state update
        setSelectedRequest((prev) => ({
          ...prev,
          tasks: [...prev.tasks, newTask],
        }));
        showSuccessNotification("Task added successfully", "Task Added");
      }
      closeAssignTaskModal();
    }
  };

  const deleteTask = async(selectedtaskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
        const res = await deleteTaskRequest(selectedRequest.id, selectedtaskId);
        fetchRequestById(selectedRequest.id)
        showSuccessNotification("Task deleted successfully", "Task Deleted");
    }
  };

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  // Functions to handle opening/closing
  const openNewTaskModal = () => setShowNewTaskModal(true);

  const closeNewTaskModal = () => {
    setShowNewTaskModal(false);
    setNewTaskTitle(""); // Reset form
    setNewTaskDescription(""); // Reset form
  };

  const handleSaveNewTask = async() => {
    // 1. Validation
    if (!newTaskTitle.trim() && !taskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }

    const res = taskId ? await editTask(selectedRequest.id, taskTitle, taskDescription, taskId) : await addTask(selectedRequest.id, newTaskTitle, newTaskDescription);

    // 2. Update Logic
    // if (selectedRequest) {
    //   const newTask = {
    //     id: Date.now(),
    //     title: newTaskTitle,
    //     description: newTaskDescription,
    //     assignedTo: "Alvin G Claveria", // Default assigned user
    //     due: new Date().toLocaleDateString("en-US", {
    //       month: "short",
    //       day: "numeric",
    //       year: "numeric",
    //     }), // Formats to "Dec 15, 2025"
    //     completed: false,
    //   };

    //   // Ensure the tasks array exists, then add the new task to the top
    //   if (!selectedRequest.tasks) selectedRequest.tasks = [];
    //   selectedRequest.tasks.unshift(newTask);

      fetchRequestById(selectedRequest.id)

      // Show Notification
      showSuccessNotification("Task assigned successfully", "Task Added");

      // Close Modal
      closeNewTaskModal();
      closeAssignTaskModal()
  };

  const openWorkLogModal = () => {
    setIsWorkLogModalOpen(true);
    setWorkLogTitle("");
    setWorkLogDescription("");
  };

  const closeWorkLogModal = () => {
    setIsWorkLogModalOpen(false);
    setWorkLogTitle("");
    setWorkLogDescription("");
  };

  const saveWorkLog = () => {
    if (!workLogTitle.trim()) {
      alert("Please enter a work log title.");
      return;
    }
    if (selectedRequest) {
      const newLog = {
        id: Date.now(),
        title: workLogTitle,
        description: workLogDescription,
        author: "Alvin G Claveria",
        authorInitials: "AG",
        timestamp: formatDateTime(new Date()),
        replies: [],
      };
      if (!selectedRequest.workLogs) selectedRequest.workLogs = [];
      selectedRequest.workLogs.unshift(newLog);
      setSelectedRequest({ ...selectedRequest });
      showSuccessNotification("Work log added successfully", "Work Log Added");
      closeWorkLogModal();
    }
  };

  const addReply = (logId, parentReplyId = null) => {
    const draftKey = parentReplyId
      ? `${logId}-${parentReplyId}`
      : `${logId}-root`;
    const text = replyDrafts[draftKey]?.trim();
    if (!text) {
      alert("Please enter a reply.");
      return;
    }

    const addReplyRecursive = (replies, targetId) => {
      return replies.map((r) => {
        if (r.id === targetId) {
          const nested = r.replies ? [...r.replies] : [];
          nested.push({
            id: Date.now(),
            author: "Chris Mendoza",
            authorInitials: "CM",
            timestamp: "1d ago",
            text,
            replies: [],
          });
          return { ...r, replies: nested };
        }
        if (r.replies && r.replies.length) {
          return { ...r, replies: addReplyRecursive(r.replies, targetId) };
        }
        return r;
      });
    };

    if (selectedRequest && selectedRequest.workLogs) {
      const updatedLogs = selectedRequest.workLogs.map((log) => {
        if (log.id === logId) {
          if (parentReplyId) {
            const updatedReplies = addReplyRecursive(
              log.replies || [],
              parentReplyId,
            );
            return { ...log, replies: updatedReplies };
          }
          const replies = log.replies ? [...log.replies] : [];
          replies.push({
            id: Date.now(),
            author: "Chris Mendoza",
            authorInitials: "CM",
            timestamp: "1d ago",
            text,
            replies: [],
          });
          return { ...log, replies };
        }
        return log;
      });
      setSelectedRequest({ ...selectedRequest, workLogs: updatedLogs });
      setReplyDrafts((prev) => ({ ...prev, [draftKey]: "" }));
    }
  };

  const deleteReply = (logId, replyId) => {
    const deleteRecursive = (replies, targetId) => {
      return replies
        .filter((r) => r.id !== targetId)
        .map((r) =>
          r.replies && r.replies.length
            ? { ...r, replies: deleteRecursive(r.replies, targetId) }
            : r,
        );
    };

    if (selectedRequest && selectedRequest.workLogs) {
      const updatedLogs = selectedRequest.workLogs.map((log) => {
        if (log.id === logId) {
          return {
            ...log,
            replies: deleteRecursive(log.replies || [], replyId),
          };
        }
        return log;
      });
      setSelectedRequest({ ...selectedRequest, workLogs: updatedLogs });
    }
  };

  const requestDeleteWorkLog = (logId) => {
    setWorkLogToDelete(logId);
    setShowWorkLogDeleteModal(true);
  };

  const confirmDeleteWorkLog = () => {
    if (selectedRequest && selectedRequest.workLogs && workLogToDelete) {
      const updatedLogs = selectedRequest.workLogs.filter(
        (log) => log.id !== workLogToDelete,
      );
      setSelectedRequest({ ...selectedRequest, workLogs: updatedLogs });
      showSuccessNotification(
        "Work log deleted successfully",
        "Deleted Successfully",
      );
    }
    setWorkLogToDelete(null);
    setShowWorkLogDeleteModal(false);
  };

  const cancelDeleteWorkLog = () => {
    setWorkLogToDelete(null);
    setShowWorkLogDeleteModal(false);
  };

  const toggleTaskCompletion = (taskId) => {
    if (selectedRequest && selectedRequest.tasks) {
      const task = selectedRequest.tasks.find((t) => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        setSelectedRequest({ ...selectedRequest });
      }
    }
  };

  const today = startOfDay(new Date());
  // const summaryCounts = requests.reduce(
  //   (acc, req) => {
  //     if (req.assigned) {
  //       acc.assigned += 1;
  //     }
  //     const dueDate = parseDueDate(req.dueBy);
  //     if (dueDate) {
  //       if (dueDate.getTime() === today.getTime()) {
  //         acc.dueToday += 1;
  //       } else if (dueDate.getTime() < today.getTime()) {
  //         acc.overdue += 1;
  //       }
  //     }
  //     return acc;
  //   },
  //   { assigned: 0, dueToday: 0, overdue: 0 },
  // );

  const summaryStats = [
    { label: "Assigned", value: stats.assigned },
    { label: "Due Today", value: stats.dueToday },
    { label: "Overdue", value: stats.overDue },
  ];

  const filteredRequests = requests.filter((req) => {
    if (filter === "assigned") return req.assigned;
    if (filter === "unassigned") return !req.assigned;
    if (filter === "open") return req.status === "Open";
    if (filter === "onhold") return req.status === "On hold";
    return true;
  });

  const getPriorityBadge = (priority) => {
    if (!priority) return null;
    const colors = {
      High: "bg-gradient-to-br from-red-600 to-red-700",
      Medium: "bg-gradient-to-br from-amber-500 to-amber-600",
      Low: "bg-gradient-to-br from-blue-500 to-blue-600",
    };
    return (
      <span
        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${colors[priority] || "bg-gray-500"} text-white shadow-sm`}
      >
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const normalized = status || "Open";
    const styles = {
      Open: "bg-[#e9fbef] text-[#1e9b4c] border border-[#c3f1d2]",
      Assigned: "bg-[#e7edff] text-[#1d3dbb] border border-[#cbd5ff]",
      Overdue: "bg-[#ffeaea] text-[#c53030] border border-[#ffc2c2]",
      Closed: "bg-[#e9f5ff] text-[#1d6fa5] border border-[#c4e0f5]",
      "On hold": "bg-[#fff4e6] text-[#f59e0b] border border-[#ffd699]",
    };
    return (
      <span
        className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold uppercase ${styles[normalized] || styles.Open}`}
      >
        {normalized}
      </span>
    );
  };

  const navigateToModule = (module) => {
    if (module === "requests") {
      setCurrentView("requests");
    }
    switch (module) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "myview":
        navigate("/servicedesk");
        break;
      case "requests":
        navigate("/requests");
        break;
      case "intake":
        navigate("/ticket-intake");
        break;
      case "financial":
        navigate("/section-e");
        break;
      case "analytics":
        navigate("/analytics");
        break;
      case "admin":
        navigate("/admin");
        break;
      default:
        break;
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen text-gray-800">
      <Sidebar collapsed={sidebarCollapsed} onNavigate={navigateToModule} />
      <SidebarToggle
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Header */}
      <Header collapsed={sidebarCollapsed} />

      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? "sidebar-collapsed-margin" : "with-sidebar"}`}
      >
        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
          {/* Landing Page View */}
          {currentView === "landing" && (
            <div id="landingView">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">🏠</span>
                Service Management Modules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div
                  className="module-card requests bg-white rounded-xl p-6 shadow-md cursor-pointer animate-fadeInUp hover:-translate-y-2 hover:shadow-xl transition-all"
                  style={{ animationDelay: "0.1s" }}
                  onClick={showRequests}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-3xl text-red-500">📋</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        ITSM Module
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Requests
                      </h3>
                    </div>
                  </div>
                  <ul className="mb-5 text-sm text-gray-600">
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> Service
                      request management
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> Ticket
                      tracking & SLA
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span>{" "}
                      Priority classification
                    </li>
                  </ul>
                  <button className="w-full py-3 px-5 bg-gradient-to-br from-blue-900 to-blue-500 text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    View Requests
                  </button>
                </div>
                <div
                  className="module-card problems bg-white rounded-xl p-6 shadow-md cursor-pointer animate-fadeInUp hover:-translate-y-2 hover:shadow-xl transition-all"
                  style={{ animationDelay: "0.2s" }}
                  onClick={showProblems}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-3xl text-orange-500">⚠️</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        ITSM Module
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Problems
                      </h3>
                    </div>
                  </div>
                  <ul className="mb-5 text-sm text-gray-600">
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> Root
                      cause analysis
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> Known
                      error database
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> Problem
                      tracking
                    </li>
                  </ul>
                  <button className="w-full py-3 px-5 bg-gradient-to-br from-blue-900 to-blue-500 text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    View Problems
                  </button>
                </div>
                <div
                  className="module-card changes bg-white rounded-xl p-6 shadow-md cursor-pointer animate-fadeInUp hover:-translate-y-2 hover:shadow-xl transition-all"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-3xl text-violet-500">🔄</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        ITSM Module
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Changes
                      </h3>
                    </div>
                  </div>
                  <ul className="mb-5 text-sm text-gray-600">
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> Change
                      request workflow
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span>{" "}
                      Approval management
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span>{" "}
                      Implementation tracking
                    </li>
                  </ul>
                  <button className="w-full py-3 px-5 bg-gradient-to-br from-blue-900 to-blue-500 text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    View Changes
                  </button>
                </div>
                <div
                  className="module-card assets bg-white rounded-xl p-6 shadow-md cursor-pointer animate-fadeInUp hover:-translate-y-2 hover:shadow-xl transition-all"
                  style={{ animationDelay: "0.4s" }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-3xl text-amber-500">💻</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        CMDB
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Assets
                      </h3>
                    </div>
                  </div>
                  <ul className="mb-5 text-sm text-gray-600">
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span>{" "}
                      Hardware inventory
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span>{" "}
                      Software licenses
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> Asset
                      lifecycle
                    </li>
                  </ul>
                  <button className="w-full py-3 px-5 bg-gradient-to-br from-blue-900 to-blue-500 text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    View Assets
                  </button>
                </div>
                <div
                  className="module-card solutions bg-white rounded-xl p-6 shadow-md cursor-pointer animate-fadeInUp hover:-translate-y-2 hover:shadow-xl transition-all"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-3xl text-emerald-500">💡</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        Knowledge Base
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Solutions
                      </h3>
                    </div>
                  </div>
                  <ul className="mb-5 text-sm text-gray-600">
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span>{" "}
                      Knowledge articles
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span>{" "}
                      Self-service portal
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> FAQ
                      management
                    </li>
                  </ul>
                  <button className="w-full py-3 px-5 bg-gradient-to-br from-blue-900 to-blue-500 text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    View Solutions
                  </button>
                </div>
                <div
                  className="module-card admin bg-white rounded-xl p-6 shadow-md cursor-pointer animate-fadeInUp hover:-translate-y-2 hover:shadow-xl transition-all"
                  style={{ animationDelay: "0.6s" }}
                  onClick={() => navigate("/admin")}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-3xl text-gray-500">⚙️</span>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                        Administration
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Settings
                      </h3>
                    </div>
                  </div>
                  <ul className="mb-5 text-sm text-gray-600">
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> User
                      management
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> System
                      configuration
                    </li>
                    <li className="py-2 flex items-center gap-2">
                      <span className="text-blue-500 font-bold">✓</span> Reports
                      & analytics
                    </li>
                  </ul>
                  <button className="w-full py-3 px-5 bg-gradient-to-br from-blue-900 to-blue-500 text-white rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Requests View */}
          {currentView === "requests" && (
            <div id="requestsView" className="space-y-6 ">
              <div className="relative overflow-hidden rounded-[28px] shadow-2xl border border-[#0d255f]/40 bg-gradient-to-r from-[#071536] via-[#102e6f] to-[#1f63f3]">
                <div
                  className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60"
                  aria-hidden="true"
                ></div>
                <div className="px-6 md:px-8 py-7 flex flex-wrap items-center justify-between gap-6 text-white relative">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[22px] bg-white/15 flex items-center justify-center text-3xl border border-white/20">
                      📋
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold mt-1">
                        Job Order Requests
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {summaryStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-[#5e667c] text-white px-4 py-2.5 rounded-xl border border-white/10 shadow-md min-w-[100px] text-center"
                      >
                        <p className="text-lg font-bold leading-none">
                          {stat.value}
                        </p>
                        <p className="text-[11px] uppercase tracking-wide text-white/90 mt-1">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-wrap items-center gap-4">
                <button
                  className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:border-[#1c4ecf] hover:text-[#1c4ecf] flex items-center gap-2 transition-all"
                  onClick={showLanding}
                >
                  ← Back
                </button>
                <div className="flex gap-2 bg-gray-100 rounded-2xl p-1 border border-gray-200">
                  {[
                    { id: "unassigned", label: "Unassigned", icon: "🔓" },
                    { id: "assigned", label: "Assigned", icon: "👤" },
                    { id: "open", label: "Open", icon: "📂" },
                    { id: "onhold", label: "On hold", icon: "⏸️" },
                    { id: "all", label: "All", icon: "📁" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      className={`px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                        filter === tab.id
                          ? "bg-gradient-to-r from-[#1d3dbb] to-[#1f61f5] text-white shadow-md"
                          : "text-gray-600 hover:text-[#1c4ecf]"
                      }`}
                      onClick={() => setFilter(tab.id)}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#f4f6fb] border-b border-gray-200 text-gray-600 uppercase text-[12px] tracking-wide">
                      <tr>
                        <th className="text-left p-4" width="120">
                          ID
                        </th>
                        <th className="text-left p-4">Subject</th>
                        <th className="text-left p-4">Requester</th>
                        <th className="text-left p-4">Assigned To</th>
                        <th className="text-left p-4">Due By</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Priority</th>
                        {filter !== "assigned" && (
                          <th className="text-left p-4">Assign</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((req) => (
                        <tr
                          key={req.id}
                          className={`cursor-pointer transition-all border-b border-gray-100 last:border-b-0 ${
                            req.assigned
                              ? "bg-[#eef2ff] hover:bg-[#e0e7ff]"
                              : "bg-[#fff5f2] hover:bg-[#ffe9e1]"
                          }`}
                          onClick={() => openRequestModal(req.id)}
                        >
                          <td className="px-4 py-3 font-semibold text-[#1a3bb5] whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {/* <span className="text-lg"></span> */}
                              <span className="hover:underline">{req.id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-800 max-w-[320px]">
                            <div className="font-semibold">{req.subject}</div>
                            <p className="text-xs text-gray-500">
                              Created {req.createdDate}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {req.requester}
                          </td>
                          <td className="px-4 py-3">
                            {req.assignedTo ? (
                              <span className="bg-[#1c4fcf] text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                                {req.assignedTo}
                              </span>
                            ) : (
                              <span className="text-gray-500">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {req.dueBy}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(req.status)}
                          </td>
                          <td className="px-4 py-3">
                            {getPriorityBadge(req.priority) || "-"}
                          </td>
                          {filter !== "assigned" && (
                            <td className="px-4 py-3">
                              {!req.assignedTo ? (
                                <button
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1f5cf4] rounded-md shadow-sm hover:bg-[#1844b0]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openAssignModal(req);
                                    setSelectedTicket(req.id)
                                  }}
                                >
                                  Assign
                                </button>
                              ) : (
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
                                  Assigned
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Problems View */}
          {currentView === "problems" && (
            <div id="problemsView">
              <div className="bg-white p-5 rounded-xl shadow-md mb-6 border border-gray-100 flex items-center gap-4">
                <button
                  className="bg-white border-2 border-gray-200 px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-500 flex items-center gap-2"
                  onClick={showLanding}
                >
                  ← Back
                </button>
                <button className="px-5 py-2.5 bg-gradient-to-br from-blue-900 to-blue-500 text-white rounded-lg font-semibold shadow-md">
                  ⚠️ Open Problems
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead className="bg-gradient-to-br from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <tr>
                        <th
                          className="text-left p-3.5 font-semibold text-gray-700 uppercase tracking-wide"
                          width="40"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-blue-500"
                          />
                        </th>
                        <th
                          className="text-left p-3.5 font-semibold text-gray-700 uppercase tracking-wide"
                          width="80"
                        >
                          ID
                        </th>
                        <th className="text-left p-3.5 font-semibold text-gray-700 uppercase tracking-wide">
                          Problem Description
                        </th>
                        <th className="text-left p-3.5 font-semibold text-gray-700 uppercase tracking-wide">
                          Category
                        </th>
                        <th className="text-left p-3.5 font-semibold text-gray-700 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-left p-3.5 font-semibold text-gray-700 uppercase tracking-wide">
                          Priority
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {problemsData.map((problem) => (
                        <tr
                          key={problem.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                        >
                          <td className="p-3.5">
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-blue-500"
                            />
                          </td>
                          <td className="p-3.5 font-semibold text-blue-500">
                            {problem.id}
                          </td>
                          <td className="p-3.5">{problem.description}</td>
                          <td className="p-3.5">{problem.category}</td>
                          <td className="p-3.5">
                            <span
                              className={`inline-block px-3 py-1.5 rounded-md text-xs font-semibold uppercase ${problem.status === "Investigating" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
                            >
                              {problem.status}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {getPriorityBadge(problem.priority)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Detail Modal */}
      {showRequestModal && selectedRequest && (
        <div
          className="fixed inset-0 z-[1000] flex justify-center items-start bg-black/50 backdrop-blur-sm pt-10 overflow-y-auto"
          onClick={closeRequestModal}
        >
          <div
            className="relative bg-white w-full max-w-4xl mx-4 mt-10 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={closeRequestModal}
                >
                  ← Back
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={toggleEditMode}
                >
                  Edit
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={openAssignModal}
                >
                  Assign
                </button>
              </div>
              <button
                className="text-2xl text-gray-400 hover:text-gray-600"
                onClick={closeRequestModal}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <span className="text-4xl">📋</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-500 font-semibold">
                      #{selectedRequest.id}
                    </span>
                    <span className="text-xl font-bold text-gray-800">
                      {selectedRequest.subject}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    by <strong>{selectedRequest.requester}</strong> on{" "}
                    <span>{selectedRequest.createdDate}</span>
                    <span className="mx-2">|</span>
                    Due:{" "}
                    <span className="text-red-500 font-medium">
                      {selectedRequest.dueBy}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 border-b border-gray-200 mb-6">
                <button
                  className={`px-4 py-3 text-sm font-semibold ${activeTab === "details" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => switchTab("details")}
                >
                  Details
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "resolution" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => switchTab("resolution")}
                >
                  Resolution
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "tasks" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => switchTab("tasks")}
                >
                  Tasks
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "checklists" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => switchTab("checklists")}
                >
                  Checklists
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "workLogs" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setActiveTab("workLogs")}
                >
                  Work Logs
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "history" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => switchTab("history")}
                >
                  History
                </button>
                <button
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "report" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => switchTab("report")}
                >
                  Generate Report
                </button>
              </div>

              {/* Details Tab */}
              {activeTab === "details" && (
                <div id="detailsTab">
                  <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
                    <h3 className="text-[15px] font-bold text-gray-800 mb-4">
                      Description
                    </h3>
                    {editMode ? (
                      <textarea
                        className="w-full p-3 border border-dashed border-blue-300 bg-blue-50/50 rounded-md text-[13px]"
                        rows="4"
                        defaultValue={selectedRequest.details.description}
                      />
                    ) : (
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {selectedRequest.details.description}
                      </p>
                    )}
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-[15px] font-bold text-gray-800 mb-4">
                      Properties
                    </h3>
                    <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded">
                      <div className="bg-white p-3 flex">
                        <span className="text-[13px] text-gray-500 w-32">
                          Status
                        </span>
                        {editMode ? (
                          <input
                            className="w-full p-2 border border-dashed border-blue-300 rounded text-[13px]"
                            defaultValue={selectedRequest.status}
                          />
                        ) : (
                          <span className="text-[13px] font-medium">
                            {selectedRequest.status}
                          </span>
                        )}
                      </div>
                      <div className="bg-white p-3 flex">
                        <span className="text-[13px] text-gray-500 w-32">
                          Priority
                        </span>
                        {editMode ? (
                          <input
                            className="w-full p-2 border border-dashed border-blue-300 rounded text-[13px]"
                            defaultValue={
                              selectedRequest.priority || "P2 - High"
                            }
                          />
                        ) : (
                          <span className="text-[13px] font-medium">
                            {selectedRequest.priority || "P2 - High"}
                          </span>
                        )}
                      </div>
                      <div className="bg-white p-3 flex">
                        <span className="text-[13px] text-gray-500 w-32">
                          Category
                        </span>
                        {editMode ? (
                          <input
                            className="w-full p-2 border border-dashed border-blue-300 rounded text-[13px]"
                            defaultValue={selectedRequest.category || "ICT"}
                          />
                        ) : (
                          <span className="text-[13px] font-medium">
                            {selectedRequest.category || "ICT"}
                          </span>
                        )}
                      </div>
                      <div className="bg-white p-3 flex">
                        <span className="text-[13px] text-gray-500 w-32">
                          Technician
                        </span>
                        {editMode ? (
                          <input
                            className="w-full p-2 border border-dashed border-blue-300 rounded text-[13px]"
                            defaultValue={
                              selectedRequest.technician || "John Doe"
                            }
                          />
                        ) : (
                          <span className="text-[13px] font-medium">
                            {selectedRequest.technician || "John Doe"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resolution Tab */}
              {activeTab === "resolution" && (
                <div id="resolutionTab">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-[15px] font-bold text-gray-800 mb-4">
                      Resolution
                    </h3>

                    {/* Empty State */}
                    {resolutionState === "empty" && (
                      <div className="flex flex-col items-center justify-center py-12 min-h-[300px] relative">
                        <button
                          className="absolute top-0 right-0 px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700"
                          onClick={showResolutionInput}
                        >
                          + Add Resolution
                        </button>
                        <div className="relative mb-4">
                          <div className="text-7xl text-gray-300 opacity-60">
                            ⚙️
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-5xl text-gray-300 opacity-80">
                              🔍
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-500 text-[13px] font-medium">
                          No Resolution Found
                        </p>
                      </div>
                    )}

                    {/* Input State */}
                    {resolutionState === "input" && (
                      <div>
                        <textarea
                          className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:border-blue-500"
                          placeholder="Enter resolution details..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                        />
                        <div className="flex gap-3 mt-4">
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700"
                            onClick={saveResolution}
                          >
                            Save Resolution
                          </button>
                          <button
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-[13px] font-medium hover:bg-gray-50"
                            onClick={() => saveResolution(true)}
                          >
                            Save as Draft
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Display State */}
                    {resolutionState === "display" && currentResolution && (
                      <div>
                        <div className="bg-white border border-gray-200 rounded-md p-4 min-h-[200px]">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {currentResolution.authorInitials || "JD"}
                            </div>
                            <div className="text-[13px] text-gray-600">
                              <span className="font-medium">
                                {currentResolution.author}
                              </span>
                              <span className="text-gray-500 ml-2">
                                {currentResolution.createdAt instanceof Date
                                  ? formatDateTime(currentResolution.createdAt)
                                  : formatDateTime(
                                      new Date(currentResolution.createdAt),
                                    )}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-[13px] leading-relaxed whitespace-pre-wrap">
                            {currentResolution.content}
                          </p>
                        </div>
                        <div className="flex gap-3 mt-4 justify-end">
                          <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-[13px] font-medium hover:bg-gray-300"
                            onClick={() => setShowResolutionHistoryModal(true)}
                          >
                            Edit History
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-[13px] font-medium hover:bg-gray-300"
                            onClick={editResolution}
                          >
                            Edit
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md text-[13px] font-medium hover:bg-red-700"
                            onClick={deleteResolution}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Edit State */}
                    {resolutionState === "edit" && currentResolution && (
                      <div>
                        <div className="bg-white border border-gray-200 rounded-md p-4 min-h-[200px] relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {currentResolution.authorInitials || "JD"}
                            </div>
                            <div className="text-[13px] text-gray-600">
                              <span className="font-medium">
                                {currentResolution.author}
                              </span>
                              <span className="text-gray-500 ml-2">
                                {currentResolution.savedAt instanceof Date
                                  ? formatDateTime(currentResolution.savedAt)
                                  : formatDateTime(
                                      new Date(currentResolution.savedAt),
                                    )}
                              </span>
                            </div>
                          </div>
                          <textarea
                            className="w-full min-h-[200px] p-3 border border-gray-300 rounded-md text-[13px] focus:outline-none focus:border-blue-500"
                            placeholder="Enter resolution details..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-3 mt-4 justify-end">
                          <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-[13px] font-medium hover:bg-gray-300"
                            onClick={cancelEditResolution}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700"
                            onClick={updateResolution}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Checklists Tab */}
              {activeTab === "checklists" && (
                <div id="checklistsTab">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[15px] font-bold text-gray-800">
                        Checklist
                      </h3>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded transition-colors flex items-center"
                        onClick={() => openAddItemModal()}
                      >
                        + Add Item
                      </button>
                    </div>
                    {selectedRequest &&
                    selectedRequest.checklists &&
                    selectedRequest.checklists.length > 0 ? (
                      <div className="space-y-2">
                        {selectedRequest.checklists.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-0 bg-white border border-blue-200 rounded-md"
                          >
                            <div className="flex items-center w-full gap-2">
                              <input
                                type="checkbox"
                                className="w-[18px] h-[18px] mt-0.5 accent-blue-500 cursor-pointer ml-4"
                                checked={item.completed || false}
                                onChange={() =>
                                  toggleChecklistItemCompletion(item.id)
                                }
                              />
                              <div className="flex-1 pl-1 flex flex-col justify-center min-h-[54px] py-3">
                                <div
                                  className={`text-[15px] font-bold text-gray-800 mb-1 ${item.completed ? "line-through text-gray-400" : ""}`}
                                >
                                  {item.title || item.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Requested: {item.name}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 pr-5">
                                <button
                                  className="text-xs text-blue-600 font-medium hover:text-blue-800 hover:underline"
                                  onClick={() => openAddItemModal(item)}
                                >
                                  Edit
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  className="text-xs text-red-600 font-medium hover:text-red-800 hover:underline"
                                  onClick={() => deleteChecklistItem(item.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg h-64 flex flex-col justify-center items-center bg-white">
                        <div className="mb-3 text-gray-300">
                          <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                            <line x1="12" y1="15" x2="12" y2="15.01"></line>
                          </svg>
                        </div>
                        <h4 className="text-[15px] font-bold text-gray-400">
                          No Item Found
                        </h4>
                      </div>
                    )}
                  </div>
                  {/* Checklist Modal */}
                  {showAddItemModal && (
                    <div className="fixed inset-0 z-[2000] flex justify-center items-center bg-black/50 backdrop-blur-sm">
                      <div
                        className="bg-white rounded-lg shadow-2xl w-full max-w-[420px] mx-4 animate-fadeIn overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                          <h3 className="text-[16px] font-bold text-gray-800">
                            {editingItem ? "Edit Item" : "Add Item"}
                          </h3>
                          <button
                            className="text-gray-400 hover:text-gray-600 border border-gray-200 rounded p-1 hover:bg-gray-100 transition-colors"
                            onClick={closeAddItemModal}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                        <div className="p-6 space-y-4 bg-white">
                          <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1">
                              Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                              placeholder="Enter name..."
                              value={itemName}
                              onChange={(e) => setItemName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1">
                              Title <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                              placeholder="Enter title..."
                              value={itemTitle}
                              onChange={(e) => setItemTitle(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-[13px] font-bold text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              rows="3"
                              className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                              placeholder="Enter description..."
                              value={itemDescription}
                              onChange={(e) =>
                                setItemDescription(e.target.value)
                              }
                            />
                          </div>
                          <div className="flex justify-end gap-3">
                            <button
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-[13px] font-medium hover:bg-gray-300"
                              onClick={closeAddItemModal}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700"
                              onClick={saveChecklistItem}
                            >
                              {editingItem ? "Update" : "Save"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Work Logs Tab */}
              {activeTab === "workLogs" && (
                <div id="workLogsTab">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[15px] font-bold text-gray-800">
                        Work Log History
                      </h3>
                      <button
                        onClick={() => openWorkLogModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded transition-colors flex items-center"
                      >
                        + Add Work Log
                      </button>
                    </div>

                    {selectedRequest.workLogs &&
                    selectedRequest.workLogs.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {selectedRequest.workLogs.map((log) => (
                          <div
                            key={log.id}
                            className="border border-gray-200 rounded-lg bg-white px-6 py-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:gap-5"
                          >
                            {/* Avatar + Info */}
                            <div className="flex-shrink-0 flex flex-col items-center w-full sm:w-36 mb-2 sm:mb-0">
                              {/* Avatar */}
                              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mb-1">
                                {log.authorInitials ||
                                  (
                                    log.author &&
                                    log.author
                                      .split(" ")
                                      .map((w) => w[0])
                                      .join("")
                                  ).toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500 text-center">
                                <span className="font-semibold text-gray-800 block">
                                  {log.author}
                                </span>
                                <span className="block text-gray-400">
                                  {log.timestamp}
                                </span>
                              </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-base font-bold text-gray-800 truncate">
                                  {log.title}
                                </div>
                                <button
                                  className="text-xs text-red-600 font-medium hover:text-red-800 ml-4"
                                  onClick={() => requestDeleteWorkLog(log.id)}
                                >
                                  Delete
                                </button>
                              </div>
                              <div className="text-[13px] text-gray-700 leading-relaxed mb-2 whitespace-pre-line break-words">
                                {log.description}
                              </div>
                              {/* Replies recursive */}
                              <div className="mt-3 space-y-3">
                                {log.replies &&
                                  log.replies.map((reply) => (
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
                                  value={replyDrafts[`${log.id}-root`] || ""}
                                  onChange={(e) =>
                                    setReplyDrafts((prev) => ({
                                      ...prev,
                                      [`${log.id}-root`]: e.target.value,
                                    }))
                                  }
                                ></textarea>
                                <div className="flex justify-end gap-2 border-t border-gray-200 p-2 text-xs">
                                  <button
                                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                                    onClick={() =>
                                      setReplyDrafts((prev) => ({
                                        ...prev,
                                        [`${log.id}-root`]: "",
                                      }))
                                    }
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="px-3 py-1 text-blue-600 hover:text-blue-800 font-semibold"
                                    onClick={() => addReply(log.id)}
                                  >
                                    Post
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg h-80 flex flex-col justify-center items-center bg-white">
                        <div className="mb-4 opacity-50">
                          <svg
                            width="80"
                            height="80"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-400"
                          >
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            <line x1="9" y1="14" x2="15" y2="14"></line>
                            <line x1="12" y1="11" x2="12" y2="17"></line>
                          </svg>
                        </div>
                        <h4 className="text-[16px] font-bold text-gray-300">
                          No Work Log Found
                        </h4>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isWorkLogModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white rounded-lg shadow-2xl w-full max-w-[600px] mx-4 overflow-hidden">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="text-[16px] font-bold text-gray-800">
                        + Add Work Log
                      </h3>
                      <button
                        onClick={closeWorkLogModal}
                        className="text-gray-400 hover:text-gray-600 border border-gray-200 rounded p-1 hover:bg-gray-100 transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <div className="p-6 space-y-5 bg-white">
                      <div>
                        <label className="block text-[13px] font-bold text-gray-700 mb-2">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter work log title..."
                          className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                          value={workLogTitle}
                          onChange={(e) => setWorkLogTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows="5"
                          placeholder="Enter description..."
                          className="w-full border border-gray-300 rounded-[4px] px-3 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                          value={workLogDescription}
                          onChange={(e) =>
                            setWorkLogDescription(e.target.value)
                          }
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100 bg-white">
                      <button
                        onClick={closeWorkLogModal}
                        className="px-4 py-2 text-[13px] font-semibold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveWorkLog}
                        className="px-6 py-2 text-[13px] font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === "tasks" && (
                <div id="tasksTab">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-[15px] font-bold text-gray-800">
                        Tasks
                      </h3>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-[13px] font-medium hover:bg-blue-700"
                        onClick={openNewTaskModal}
                      >
                        + Add Task
                      </button>
                    </div>
                    {selectedRequest.tasks &&
                    selectedRequest.tasks.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRequest.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-3 bg-white border border-blue-200 rounded-md"
                          >
                            <input
                              type="checkbox"
                              className="w-[18px] h-[18px] mt-0.5 accent-blue-500 cursor-pointer"
                              checked={task.completed || false}
                              onChange={() => toggleTaskCompletion(task.id)}
                            />
                            <div className="flex-1">
                              <div
                                className={`text-sm font-bold text-gray-800 mb-1 ${task.completed ? "line-through text-gray-400" : ""}`}
                              >
                                {task.title || task.description}
                              </div>
                              <div className="text-xs text-gray-500">
                                {task.completed
                                  ? `Completed: ${task.due}`
                                  : `Assigned to: ${task.assignedTo || "Unassigned"} | Due: ${task.due}`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="text-xs text-blue-600 font-medium hover:text-blue-800 hover:underline"
                                onClick={() => openAssignTaskModal(task)}
                              >
                                Edit
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                className="text-xs text-red-600 font-medium hover:text-red-800 hover:underline"
                                onClick={() => deleteTask(task.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg h-64 flex flex-col justify-center items-center bg-white">
                        <div className="mb-3 text-gray-300">
                          <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                            <line x1="12" y1="15" x2="12" y2="15.01"></line>
                          </svg>
                        </div>
                        <h4 className="text-[15px] font-bold text-gray-400">
                          No Task Found
                        </h4>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <div id="historyTab">
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="text-[15px] font-bold text-gray-800 mb-4">
                      Activity History
                    </h3>
                    <div className="space-y-4">
                      {selectedRequest.history.length > 0 && selectedRequest.history.map((event, index) => (
                        <div
                          key={index}
                          className="flex gap-3 pb-4 border-b border-gray-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                            {event.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm text-gray-800">
                              <strong>{event.name}</strong> {event.action}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Report Tab */}
              {activeTab === "report" && (
                <div id="reportTab">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="space-y-4 max-w-3xl">
                      <div>
                        <p className="text-sm uppercase tracking-[0.4em] text-gray-400 font-semibold">
                          Export
                        </p>
                        <h3 className="text-2xl font-bold text-gray-800">
                          Generate Job Order Report
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Confirm the key ticket details and click generate to
                          preview the printable report.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          {
                            label: "Ticket ID",
                            value: selectedRequest.id,
                          },
                          {
                            label: "Due By",
                            value: selectedRequest.dueBy,
                          },
                          {
                            label: "Requester",
                            value: selectedRequest.requester,
                          },
                          {
                            label: "Assigned To",
                            value: selectedRequest.assignedTo || "Unassigned",
                          },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                          >
                            <p className="text-[10px] uppercase text-gray-500">
                              {stat.label}
                            </p>
                            <p className="text-lg font-semibold text-gray-800 truncate">
                              {stat.value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <button
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm hover:shadow-md gap-2"
                        onClick={openReportModal}
                      >
                        <span>📄</span>
                        Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Request Modal */}
      {showAssignModal && (
        <div
          className="fixed inset-0 z-[1100] flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeAssignModal}
        >
          <div
            className="relative bg-white w-full max-w-2xl mx-4 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-600"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Assign Request
                </h3>
              </div>
              <button
                className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-100 transition-colors"
                onClick={closeAssignModal}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Department Field */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-4 border border-gray-300 rounded-lg text-base text-gray-700 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={assignRequestTitle}
                  onChange={(e) => {
                    setAssignRequestTitle(e.target.value);
                    setSelectedTechnician(null);
                  }}
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((dept) => (
                    <option value={dept.id} key={dept.id}>
                    {dept.name}
                  </option>))}
                </select>
              </div>

              {/* Select Technician */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Technician <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {
                    filteredTechnicians.map((tech) => (
                    <div
                      key={tech.id}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-blue-400 ${
                        selectedTechnician === tech.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                      onClick={() => setSelectedTechnician(tech.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Radio Button */}
                        <div className="mt-1">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedTechnician === tech.id
                                ? "border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedTechnician === tech.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            )}
                          </div>
                        </div>

                        {/* Status Indicator */}
                        <div className="mt-1">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              tech.status === "online"
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            }`}
                          ></div>
                        </div>

                        {/* Technician Info */}
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-blue-600">
                            {tech.name}
                          </h4>
                          <p className="text-sm text-red-500 font-medium">
                            {tech.role}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {tech.department} • {tech.assignedTickets}{" "}
                            {tech.taskLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scheduled Start Date Range */}
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Scheduled Start
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="dd/mm/yyyy"
                      value={scheduledStartDate}
                      onChange={(e) => setScheduledStartDate(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                  </div>
                  <span className="text-gray-400 font-medium">-</span>
                  <div className="relative flex-1">
                    <input
                      type="date"
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="dd/mm/yyyy"
                      value={scheduledEndDate}
                      onChange={(e) => setScheduledEndDate(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end items-center gap-3 p-5 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                onClick={closeAssignModal}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm"
                onClick={confirmAssignment}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isReportModalOpen && selectedRequest && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={closeReportModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Generate Report: #{selectedRequest.id}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={closeReportModal}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6 bg-gray-50">
              <div className="flex flex-col items-center gap-4">
                <div className="text-sm text-gray-500">
                  Preview report layout
                </div>
                <div className="bg-white border border-gray-200 rounded p-4 shadow-inner">
                  <div className="bg-white border border-gray-300 rounded-sm w-[210px] h-[300px] shadow flex flex-col text-[9px] text-gray-700">
                    <div className="text-center border-b border-gray-200 px-3 py-2">
                      <p className="text-[8px] font-semibold tracking-[0.3em] text-gray-600">
                        GLOBAL COMFORT GROUP
                      </p>
                      <p className="text-[8px] text-gray-500">ICT Department</p>
                      <p className="text-[8px] text-gray-500 mt-0.5">
                        JOR #{selectedRequest.id}
                      </p>
                    </div>
                    <div className="flex-1 p-3 space-y-2">
                      <div className="border border-gray-200 rounded-md">
                        <div className="flex justify-between px-2 py-1 bg-gray-50">
                          <span className="uppercase text-[7px] text-gray-500">
                            Requester
                          </span>
                          <span className="text-[7px] font-semibold text-gray-700">
                            {selectedRequest.requester}
                          </span>
                        </div>
                        <div className="flex justify-between px-2 py-1">
                          <span className="uppercase text-[7px] text-gray-500">
                            Assigned
                          </span>
                          <span className="text-[7px] font-semibold text-gray-700">
                            {selectedRequest.assignedTo || "Unassigned"}
                          </span>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-md">
                        <div className="px-2 py-1 bg-gray-50 text-[7px] uppercase text-gray-500">
                          Job Description
                        </div>
                        <div className="px-2 py-1 text-[8px] text-gray-700 overflow-hidden text-ellipsis">
                          {selectedRequest.subject}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[7px] text-gray-600">
                        <div className="border border-gray-200 rounded-md p-1 text-center">
                          <p className="uppercase text-gray-400">Issue</p>
                          <p className="font-semibold text-gray-700">
                            {selectedRequest.status || "Open"}
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-md p-1 text-center">
                          <p className="uppercase text-gray-400">Tech</p>
                          <p className="font-semibold text-gray-700">
                            {selectedRequest.technician || "John Doe"}
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-md p-1 text-center">
                          <p className="uppercase text-gray-400">Due</p>
                          <p className="font-semibold text-gray-700">
                            {selectedRequest.dueBy}
                          </p>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-md px-2 py-1">
                        <p className="uppercase text-[7px] text-gray-400">
                          Action Taken
                        </p>
                        <p className="text-[8px] text-gray-700">
                          Pending technician confirmation.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[7px]">
                        <div className="border border-gray-200 rounded-md px-2 py-2">
                          <p className="uppercase text-gray-400 mb-1">
                            Requested By
                          </p>
                          <p className="font-semibold text-gray-700">
                            {selectedRequest.requester}
                          </p>
                        </div>
                        <div className="border border-gray-200 rounded-md px-2 py-2">
                          <p className="uppercase text-gray-400 mb-1">
                            Approved By
                          </p>
                          <p className="font-semibold text-gray-700">
                            John Doe
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100"
                  onClick={closeReportModal}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-sm hover:shadow-md flex items-center gap-2"
                  onClick={exportReport}
                >
                  <span></span>
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resolution Edit History Modal */}
      {showResolutionHistoryModal && (
        <div
          className="fixed inset-0 z-[1100] flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowResolutionHistoryModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M6 5a3 3 0 013-3h6a3 3 0 013 3v2.382a3 3 0 01.879 2.12v7.494l.828 1.657A2 2 0 0120 19.618V20a2 2 0 01-2 2H6a2 2 0 01-2-2v-.382a2 2 0 01.293-1.045l.828-1.657V9.502a3 3 0 01.879-2.12V5zm3-1a1 1 0 00-1 1v2h8V5a1 1 0 00-1-1H9zm-2 12.236V19.618A.618.618 0 006.618 20h10.764a.618.618 0 00.618-.618v-2.382a.991.991 0 00-.095-.418l-.838-1.678A1 1 0 0117 14.842V9.502A1 1 0 0015.998 8.5h-8a1 1 0 00-1 1v7.494c0 .307.111.6.307.818l.838 1.678a.991.991 0 00.095.418zM8 
                    9.5h8v5.342c0 .267.105.514.293.703l.838 1.678c.07.139.129.314.129.514zM6 19.618V17.236c0-.067.017-.132.047-.189l.838-1.678A.991.991 0 017 14.842V9.502A1 1 0 008.002 8.5h7.996l.002.002v5.34c0 .267.106.515.294.704l.838 1.678a.991.991 0 01.047.188v2.382A.618.618 0 0117.382 20H6.618A.618.618 0 016 19.618z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="text-lg font-bold text-gray-800">
                  Edit History
                </span>
              </span>
              <button
                className="text-gray-400 hover:text-gray-600 border border-gray-200 rounded p-1 hover:bg-gray-100 transition-colors"
                onClick={() => setShowResolutionHistoryModal(false)}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6 pb-2">
              <table className="w-full text-[14px] border border-gray-200 mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 border-b border-gray-200 text-left font-semibold text-xs text-gray-500">
                      Date
                    </th>
                    <th className="px-3 py-2 border-b border-gray-200 text-left font-semibold text-xs text-gray-500">
                      Edited by
                    </th>
                    <th className="px-3 py-2 border-b border-gray-200 text-left font-semibold text-xs text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {currentResolution?.history &&
                    currentResolution.history
                      .slice()
                      .reverse()
                      .map((edit, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 border-b border-gray-100 whitespace-nowrap">
                            {edit.date
                              ? typeof edit.date === "string"
                                ? edit.date
                                : new Date(edit.date).toLocaleString(
                                    undefined,
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )
                              : ""}
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100 whitespace-nowrap">
                            {edit.author}
                          </td>
                          <td className="px-3 py-2 border-b border-gray-100">
                            {edit.isCurrent && (
                              <span className="inline-block px-3 py-1 text-xs font-medium border border-gray-200 rounded bg-gray-100">
                                Current
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
                  onClick={() => setShowResolutionHistoryModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[1100] flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >
          <div
            className="relative bg-white w-full max-w-sm mx-4 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                Delete Resolution
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-sm mb-6">
                Are you sure you want to delete this saved resolution? This
                action cannot be undone.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                onClick={confirmResolutionDeletion}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 left-4 z-[3000] animate-slideInLeft">
          <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-3 flex items-center gap-2 shadow-xl">
            <span className="text-purple-400 text-lg">✓</span>
            <span className="text-white text-sm font-medium">
              {successMessage}
            </span>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-[2000] flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeSuccessModal}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl p-8 max-w-sm mx-4 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {successTitle}
              </h2>
              <button
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                onClick={closeSuccessModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Log Delete Confirmation */}
      {showWorkLogDeleteModal && (
        <div
          className="fixed inset-0 z-[2000] flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={cancelDeleteWorkLog}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Delete</h3>
            </div>
            <div className="p-5">
              <p className="text-gray-700 text-[17px] mb-6">
                Are you sure you want to delete this?
              </p>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
              <button
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                onClick={cancelDeleteWorkLog}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                onClick={confirmDeleteWorkLog}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignTaskModal && (
        <div
          className="fixed inset-0 z-[1200] flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeAssignTaskModal}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-xl">👤</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  {editingTask ? "Edit Task" : "Assign Task"}
                </h3>
              </div>
              <button
                className="text-2xl text-gray-400 hover:text-gray-600"
                onClick={closeAssignTaskModal}
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Enter task title..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 min-h-[100px]"
                  placeholder="Enter description..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                onClick={closeAssignTaskModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                onClick={handleSaveNewTask}
              >
                {editingTask ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW Assign Task Modal (Matches the Image) */}
      {showNewTaskModal && (
        <div
          className="fixed inset-0 z-[1200] flex justify-center items-center bg-black/50 backdrop-blur-sm"
          onClick={closeNewTaskModal}
        >
          <div
            className="relative bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* User Icon SVG to match image */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-gray-800"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">Assign Task</h3>
              </div>

              {/* Boxed Close Button */}
              <button
                className="p-1 border border-gray-300 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={closeNewTaskModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Enter task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 min-h-[120px] resize-none"
                  placeholder="Enter description..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50/30">
              <button
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                onClick={closeNewTaskModal}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                onClick={handleSaveNewTask}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 
          0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7); } 
          70% { box-shadow: 0 0 0 8px rgba(251, 191, 36, 0); } 
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); } 
        }
        @keyframes pulse-green { 
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 
          70% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); } 
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } 
        }
        @keyframes fadeInUp { 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes slideInLeft { 
          from { transform: translateX(-100%); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
        @keyframes fadeIn { 
          from { opacity: 0; transform: scale(0.9); } 
          to { opacity: 1; transform: scale(1); } 
        }
        .animate-pulse-custom { animation: pulse 2s infinite; }
        .animate-pulse-green { animation: pulse-green 2s infinite; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease forwards; opacity: 0; transform: translateY(20px); }
        .animate-slideInLeft { animation: slideInLeft 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .edit-field { display: none; }
        .edit-mode .view-value { display: none; }
        .edit-mode .edit-field { display: block; }
      `}</style>
    </div>
  );
}

export default Request;

// Helper component for nested replies
const ReplyThread = ({
  reply,
  logId,
  replyDrafts,
  setReplyDrafts,
  addReply,
  deleteReply,
}) => {
  return (
    <div className="border border-gray-200 rounded-md px-3 py-2 bg-gray-50">
      <div className="flex items-center gap-2 text-[12px] text-gray-500 mb-1">
        <span className="font-semibold text-gray-700">{reply.author}</span>
        <span className="text-gray-400">{reply.timestamp}</span>
      </div>
      <div className="text-[13px] text-gray-700 leading-relaxed">
        {reply.text}
      </div>
      <div className="flex gap-3 text-[12px] text-blue-600 mt-2">
        <button
          className="hover:underline"
          onClick={() => {
            const key = `${logId}-${reply.id}`;
            setReplyDrafts((prev) => ({ ...prev, [key]: prev[key] || "" }));
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
            value={replyDrafts[`${logId}-${reply.id}`] || ""}
            onChange={(e) =>
              setReplyDrafts((prev) => ({
                ...prev,
                [`${logId}-${reply.id}`]: e.target.value,
              }))
            }
          />
          <div className="flex justify-end gap-2 border-t border-gray-200 p-2 text-xs">
            <button
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
              onClick={() =>
                setReplyDrafts((prev) => {
                  const next = { ...prev };
                  delete next[`${logId}-${reply.id}`];
                  return next;
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
          {reply.replies.map((child) => (
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
  );
};
