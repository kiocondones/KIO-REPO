import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import SidebarToggle from "../components/SidebarToggle";
import Header from "../components/Header";

import {getUsers, createUser} from "../api/adminApi.js"

const adminModules = [
  {
    id: "users",
    icon: "👥",
    title: "User Management",
    desc: "Manage users, roles, and permissions",
  },
  {
    id: "roles",
    icon: "🔐",
    title: "Roles & Permissions",
    desc: "Configure role-based access control",
  },
  {
    id: "sla",
    icon: "⏱️",
    title: "SLA Policies",
    desc: "Define and manage SLA policies",
  },
  {
    id: "settings",
    icon: "⚙️",
    title: "System Settings",
    desc: "General system configuration",
  },
];

// Toggle to quickly show or hide the System Settings maintenance experience
const isSettingsUnderMaintenance = true;

const rolesData = [
  { id: 1, name: "Admin", users: 3, permissions: ["All Access"] },
  {
    id: 2,
    name: "Manager",
    users: 8,
    permissions: ["View All", "Approve", "Reports"],
  },
  {
    id: 3,
    name: "Technician",
    users: 25,
    permissions: ["View Assigned", "Update Status", "Add Notes"],
  },
  { id: 4, name: "Viewer", users: 12, permissions: ["View Only"] },
];

function AdminSettings() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("users");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [permissions, setPermissions] = useState([
    {
      id: 1,
      page: "Dashboard",
      view: true,
      edit: false,
      create: false,
      enabled: true,
    },
    {
      id: 2,
      page: "My View",
      view: true,
      edit: true,
      create: false,
      enabled: true,
    },
    {
      id: 3,
      page: "Requests",
      view: true,
      edit: true,
      create: true,
      enabled: true,
    },
    {
      id: 4,
      page: "Service Configuration",
      view: true,
      edit: true,
      create: true,
      enabled: false,
    },
    {
      id: 5,
      page: "Financial",
      view: false,
      edit: false,
      create: false,
      enabled: false,
    },
    {
      id: 6,
      page: "Admin",
      view: true,
      edit: true,
      create: true,
      enabled: true,
    },
  ]);

  const [newPermissionSet, setNewPermissionSet] = useState({
    name: "",
    department: "",
    description: "",
    permissions: [
      {
        id: 1,
        page: "Dashboard",
        view: false,
        edit: false,
        create: false,
        enabled: true,
      },
      {
        id: 2,
        page: "My View",
        view: false,
        edit: false,
        create: false,
        enabled: true,
      },
      {
        id: 3,
        page: "Requests",
        view: false,
        edit: false,
        create: false,
        enabled: true,
      },
      {
        id: 4,
        page: "Service Configuration",
        view: false,
        edit: false,
        create: false,
        enabled: true,
      },
      {
        id: 5,
        page: "Financial",
        view: false,
        edit: false,
        create: false,
        enabled: true,
      },
      {
        id: 6,
        page: "Admin",
        view: false,
        edit: false,
        create: false,
        enabled: true,
      },
    ],
  });

  
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([
    "Requestor",
    "Admin",
    "Technician"
  ]);
  const [departments, setDepartments] = useState([
    "CED - Corporate Engineering Depart.",
    "BIG - Business Intelligence Group",
    "CMD - Corporate Marketing Depart.",
    "HRD - Human Resources Depart.",
    "ICT - Information Communication Technologies",
    "BDD - Business Development Department",
    "CNC - Credit and Collection",
    "CTD - Corporate Treasury Department",
    "ACTG - Accouting Department",
    "CPD - Corporate Purchasing Department",
    "GCERC - Global Comfort Employees Relations Council"
  ]);

  // New Account creation details
  const [idNumber, setIdNumber] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole]= useState("")
  const [department, setDepartment] = useState("")

  // SLA Policies state
  const [slaPolicies, setSlaPolicies] = useState([
    { id: 1, priority: "P1", label: "Critical", responseTime: "15 mins", resolutionTime: "4 hours", escalationL1: "30 mins", escalationL2: "1 hour", color: "bg-red-500" },
    { id: 2, priority: "P2", label: "High", responseTime: "30 mins", resolutionTime: "8 hours", escalationL1: "2 hours", escalationL2: "4 hours", color: "bg-amber-500" },
    { id: 3, priority: "P3", label: "Medium", responseTime: "2 hours", resolutionTime: "24 hours", escalationL1: "8 hours", escalationL2: "12 hours", color: "bg-blue-500" },
    { id: 4, priority: "P4", label: "Low", responseTime: "4 hours", resolutionTime: "72 hours", escalationL1: "24 hours", escalationL2: "48 hours", color: "bg-gray-500" },
  ]);
  const [showAddSLAModal, setShowAddSLAModal] = useState(false);
  const [editingSLA, setEditingSLA] = useState(null);
  const [slaForm, setSlaForm] = useState({
    priority: "",
    label: "",
    responseTime: "",
    resolutionTime: "",
    escalationL1: "",
    escalationL2: "",
    color: "bg-gray-500"
  });

  const priorityColors = [
    { value: "bg-red-500", label: "Red (Critical)" },
    { value: "bg-amber-500", label: "Amber (High)" },
    { value: "bg-blue-500", label: "Blue (Medium)" },
    { value: "bg-gray-500", label: "Gray (Low)" },
    { value: "bg-emerald-500", label: "Green" },
    { value: "bg-purple-500", label: "Purple" },
  ];

  const priorityOptions = [
    { priority: "P1", label: "Critical", color: "bg-red-500" },
    { priority: "P2", label: "High", color: "bg-amber-500" },
    { priority: "P3", label: "Medium", color: "bg-blue-500" },
    { priority: "P4", label: "Low", color: "bg-gray-500" },
    { priority: "P5", label: "Very Low", color: "bg-emerald-500" },
  ];

  const handlePriorityChange = (priorityCode) => {
    const selected = priorityOptions.find(p => p.priority === priorityCode);
    if (selected) {
      setSlaForm({
        ...slaForm,
        priority: selected.priority,
        label: selected.label,
        color: selected.color
      });
    } else {
      setSlaForm({
        ...slaForm,
        priority: priorityCode,
        label: "",
        color: "bg-gray-500"
      });
    }
  };

  const openAddSLAModal = () => {
    setEditingSLA(null);
    setSlaForm({
      priority: "",
      label: "",
      responseTime: "",
      resolutionTime: "",
      escalationL1: "",
      escalationL2: "",
      color: "bg-gray-500"
    });
    setShowAddSLAModal(true);
  };

  const openEditSLAModal = (policy) => {
    setEditingSLA(policy);
    setSlaForm({
      priority: policy.priority,
      label: policy.label,
      responseTime: policy.responseTime,
      resolutionTime: policy.resolutionTime,
      escalationL1: policy.escalationL1,
      escalationL2: policy.escalationL2,
      color: policy.color
    });
    setShowAddSLAModal(true);
  };

  const handleSaveSLA = () => {
    if (!slaForm.priority || !slaForm.label || !slaForm.responseTime || !slaForm.resolutionTime) {
      alert("Please fill in all required fields");
      return;
    }
    if (editingSLA) {
      setSlaPolicies(slaPolicies.map(p => 
        p.id === editingSLA.id ? { ...p, ...slaForm } : p
      ));
    } else {
      const newPolicy = {
        id: Date.now(),
        ...slaForm
      };
      setSlaPolicies([...slaPolicies, newPolicy]);
    }
    setShowAddSLAModal(false);
  };

  const handleDeleteSLA = (id) => {
    if (window.confirm("Are you sure you want to delete this SLA policy?")) {
      setSlaPolicies(slaPolicies.filter(p => p.id !== id));
    }
  };

  const handleCreateAccount = async() => {
    try{
      const res = await createUser(name, email, phone, role, department);

      if(res.success){
        alert(`New account password: ${res.defaultPassword} and email: ${res.email}`)

        fetchUsers();
        setShowAddUserModal(false)
      }
    } catch(err) {
      console.error(err);
    }
  }

  const togglePermission = (id, field) => {
    setPermissions(
      permissions.map((perm) =>
        perm.id === id ? { ...perm, [field]: !perm[field] } : perm,
      ),
    );
  };

  const toggleNewPermission = (id, field) => {
    setNewPermissionSet({
      ...newPermissionSet,
      permissions: newPermissionSet.permissions.map((perm) =>
        perm.id === id ? { ...perm, [field]: !perm[field] } : perm,
      ),
    });
  };

  const handleAddPermission = () => {
    if (!newPermissionSet.name || !newPermissionSet.department) {
      alert("Please fill in permission set name and department");
      return;
    }
    // Here you would save the permission set
    alert(
      `Permission set "${newPermissionSet.name}" added for ${newPermissionSet.department}!`,
    );
    setShowAddPermissionModal(false);
    // Reset form
    setNewPermissionSet({
      name: "",
      department: "",
      description: "",
      permissions: [
        {
          id: 1,
          page: "Dashboard",
          view: false,
          edit: false,
          create: false,
          enabled: true,
        },
        {
          id: 2,
          page: "My View",
          view: false,
          edit: false,
          create: false,
          enabled: true,
        },
        {
          id: 3,
          page: "Requests",
          view: false,
          edit: false,
          create: false,
          enabled: true,
        },
        {
          id: 4,
          page: "Service Configuration",
          view: false,
          edit: false,
          create: false,
          enabled: true,
        },
        {
          id: 5,
          page: "Financial",
          view: false,
          edit: false,
          create: false,
          enabled: true,
        },
        {
          id: 6,
          page: "Admin",
          view: false,
          edit: false,
          create: false,
          enabled: true,
        },
      ],
    });
  };

  const navigateToModule = (module) => {
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

  async function fetchUsers() {
      try {
        const res = await getUsers(); // call your API function

        if(res.success){
          setUsers(res?.users || []);
          // Keep hardcoded roles unless API provides them
          if(res?.roles && res.roles.length > 0) {
            setRoles(res.roles);
          }
          // Keep hardcoded departments unless API provides them
          if(res?.departments && res.departments.length > 0) {
            setDepartments(res.departments);
          }
        }
      } catch(err) {
        console.error(err);
      }
    }

  useEffect(() => {
    fetchUsers();
  }, []);

  // removes all user details
  useEffect(() => {
    setIdNumber("")
    setName("")
    setEmail("")
    setPhone("")
    setRole("")
    setDepartment("")
  },[showAddUserModal])

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        const filteredUsers = roleFilter === "all" 
          ? users 
          : users.filter(user => user.role.toLowerCase() === roleFilter.toLowerCase());
      
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                User Management
              </h2>
              <div className="flex gap-3 items-center">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-800 rounded-lg text-sm font-medium bg-white hover:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="all">All Roles</option>
                  {roles.map((role) => (
                    <option value={role}>{role}</option>
                  ))}
                </select>
                <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900"
                  onClick={() => setShowAddUserModal(true)}
                >
                  + Add User
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      User
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Last Login
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${user.role === "Admin" ? "bg-red-100 text-red-700" : user.role === "Manager" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${user.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{user.lastLogin}</td>
                      <td className="p-4 text-center">
                        <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "roles":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Roles & Permissions
              </h2>
              <div className="flex gap-3">
                <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900"
                  onClick={() => setShowAddPermissionModal(true)}
                >
                  + Create Role
                </button>
                {/* <button className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900">
                  + Create Role
                </button> */}
              </div>
            </div>

            {/* Existing Roles Grid */}
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 mb-4">Role Templates</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rolesData.map((role) => (
                <div
                  key={role.id}
                  className="bg-white rounded-xl p-5 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">{role.name}</h3>
                      <div className="text-sm text-gray-500">
                        {role.users} users
                      </div>
                    </div>
                    <button className="text-blue-600 text-sm font-medium hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((perm, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "sla":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">SLA Policies</h2>
              <button 
                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900"
                onClick={openAddSLAModal}
              >
                + Add Policy
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">
                      Priority
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700">
                      Response Time
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700">
                      Resolution Time
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700">
                      Escalation L1
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700">
                      Escalation L2
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {slaPolicies.map((policy) => (
                    <tr key={policy.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <span className={`px-2 py-1 ${policy.color} text-white rounded text-xs font-bold`}>
                          {policy.priority} - {policy.label}
                        </span>
                      </td>
                      <td className="p-4 text-center font-medium">{policy.responseTime}</td>
                      <td className="p-4 text-center font-medium">{policy.resolutionTime}</td>
                      <td className="p-4 text-center font-medium">{policy.escalationL1}</td>
                      <td className="p-4 text-center font-medium">{policy.escalationL2}</td>
                      <td className="p-4 text-center">
                        <button 
                          className="text-blue-600 text-sm font-medium hover:underline mr-3"
                          onClick={() => openEditSLAModal(policy)}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 text-sm font-medium hover:underline"
                          onClick={() => handleDeleteSLA(policy.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {slaPolicies.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        No SLA policies defined. Click "Add Policy" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "settings":
        if (isSettingsUnderMaintenance) {
          return (
            <div className="bg-gradient-to-b from-white via-blue-50/60 to-white rounded-3xl border border-blue-100 p-10 text-center shadow-lg">
              <div className="inline-block mb-8 animate-bounce">
                <span className="text-8xl">🛠️</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">System Settings</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
                This area is currently undergoing scheduled maintenance while we roll out new controls
                and performance upgrades. Please check back soon.
              </p>
              <div className="bg-white border-2 border-blue-200 rounded-2xl p-8 shadow">
                <div className="flex items-start gap-4 text-left">
                  <span className="text-4xl">⏰</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Maintenance Window</h3>
                    <p className="text-gray-600">
                      We're enhancing the configuration experience so you can manage system policies with less effort.
                      Expect a refreshed layout and additional safeguards once the update is complete.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-10">
                {[
                  { icon: "🔧", title: "System Upgrade", desc: "Optimizing reliability" },
                  { icon: "🚀", title: "New Features", desc: "Launching soon" },
                  { icon: "🔒", title: "Security Hardening", desc: "Extra safeguards" },
                ].map((item) => (
                  <div key={item.title} className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <span className="text-3xl mb-2 block">{item.icon}</span>
                    <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-3">
                {[0, 0.2, 0.4].map((delay) => (
                  <span
                    key={delay}
                    className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${delay}s` }}
                  ></span>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-6">Thank you for your patience while we finish up the changes.</p>
            </div>
          );
        }

        return (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              System Settings
            </h2>
            <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  General Settings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                      defaultValue="GOLI ServiceDesk"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5">
                      <option>Asia/Manila (GMT+8)</option>
                      <option>Asia/Singapore (GMT+8)</option>
                      <option>Asia/Tokyo (GMT+9)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">
                  Notification Settings
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Email notifications for new tickets
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      SLA breach alerts
                    </span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-sm text-gray-700">
                      Daily summary report
                    </span>
                  </label>
                </div>
              </div>
              <button className="px-6 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900">
                Save Settings
              </button>
            </div>
          </div>
        );
      default:
        return null;
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
        className={`max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${sidebarCollapsed ? "sidebar-collapsed-margin" : "with-sidebar"}`}
      >
        {/* Module Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {adminModules.map((module) => (
            <div
              key={module.id}
              className={`bg-white rounded-xl p-5 border-2 cursor-pointer transition-all ${activeSection === module.id ? "border-gray-800 shadow-lg" : "border-gray-200 hover:border-gray-400"}`}
              onClick={() => setActiveSection(module.id)}
            >
              <div className="text-3xl mb-2">{module.icon}</div>
              <h3 className="font-bold text-gray-800">{module.title}</h3>
              <p className="text-sm text-gray-500">{module.desc}</p>
            </div>
          ))}
        </div>

        {/* Content Area */}
        {renderContent()}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddUserModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md m-4 max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Add New User</h3>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Enter ID number" onChange={(e) => setIdNumber(e.target.value)}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Enter name" onChange={(e) => setName(e.target.value)}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input type="tel" className="w-full border border-gray-300 rounded-lg px-4 py-2.5" placeholder="Enter phone number" onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5" onChange={(e) => setRole(e.target.value)}>
                    <option value={""}>
                      Select Role
                    </option>
                  {roles && roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              { role.toLowerCase() != "requestor" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="">
                      Select Department
                    </option>
                    {departments && departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50" onClick={() => setShowAddUserModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900" onClick={() => handleCreateAccount()}>Add User</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Permission Modal */}
      {showAddPermissionModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddPermissionModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Add New Role & Permission
            </h3>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                  placeholder="e.g., IT Admin Permissions"
                  value={newPermissionSet.name}
                  onChange={(e) =>
                    setNewPermissionSet({
                      ...newPermissionSet,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department / Division *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                  value={newPermissionSet.department}
                  onChange={(e) =>
                    setNewPermissionSet({
                      ...newPermissionSet,
                      department: e.target.value,
                    })
                  }
                >
                    <option value="">Select department...</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                  rows="3"
                  placeholder="Enter description..."
                  value={newPermissionSet.description}
                  onChange={(e) =>
                    setNewPermissionSet({
                      ...newPermissionSet,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Permissions Table */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-bold text-gray-800 mb-4">Page Permissions</h4>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-700">
                        Permission
                      </th>
                      <th className="text-center p-4 font-semibold text-gray-700">
                        View
                      </th>
                      <th className="text-center p-4 font-semibold text-gray-700">
                        Edit
                      </th>
                      <th className="text-center p-4 font-semibold text-gray-700">
                        Create
                      </th>
                      <th className="text-center p-4 font-semibold text-gray-700">
                        On / Off
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {newPermissionSet.permissions.map((perm) => (
                      <tr
                        key={perm.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="p-4 font-medium text-gray-800">
                          {perm.page}
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.view}
                            disabled={!perm.enabled}
                            onChange={() =>
                              toggleNewPermission(perm.id, "view")
                            }
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.edit}
                            disabled={!perm.enabled}
                            onChange={() =>
                              toggleNewPermission(perm.id, "edit")
                            }
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={perm.create}
                            disabled={!perm.enabled}
                            onChange={() =>
                              toggleNewPermission(perm.id, "create")
                            }
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={perm.enabled}
                              onChange={() =>
                                toggleNewPermission(perm.id, "enabled")
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                onClick={() => setShowAddPermissionModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900"
                onClick={handleAddPermission}
              >
                Add New Role & Permission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit SLA Policy Modal */}
      {showAddSLAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddSLAModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editingSLA ? "Edit SLA Policy" : "Add New SLA Policy"}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority <span className="text-red-500">*</span></label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                    value={slaForm.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                  >
                    <option value="">Select Priority</option>
                    {priorityOptions.map((opt) => (
                      <option key={opt.priority} value={opt.priority}>
                        {opt.priority} - {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50" 
                      value={slaForm.label}
                      readOnly
                      placeholder="Auto-filled based on priority"
                    />
                    {slaForm.color && (
                      <span className={`px-3 py-2 ${slaForm.color} text-white rounded-lg text-xs font-bold whitespace-nowrap`}>
                        {slaForm.priority || "P?"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Response Time <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5" 
                    placeholder="e.g., 15 mins, 2 hours" 
                    value={slaForm.responseTime}
                    onChange={(e) => setSlaForm({...slaForm, responseTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Time <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5" 
                    placeholder="e.g., 4 hours, 24 hours" 
                    value={slaForm.resolutionTime}
                    onChange={(e) => setSlaForm({...slaForm, resolutionTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Escalation L1</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5" 
                    placeholder="e.g., 30 mins" 
                    value={slaForm.escalationL1}
                    onChange={(e) => setSlaForm({...slaForm, escalationL1: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Escalation L2</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5" 
                    placeholder="e.g., 1 hour" 
                    value={slaForm.escalationL2}
                    onChange={(e) => setSlaForm({...slaForm, escalationL2: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50" 
                onClick={() => setShowAddSLAModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900" 
                onClick={handleSaveSLA}
              >
                {editingSLA ? "Update Policy" : "Add Policy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
