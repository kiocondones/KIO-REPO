import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import SidebarToggle from '../components/SidebarToggle'
import Header from '../components/Header'
import {getCategoriesAndTemplates, createCategory, createTicketTemplate, updateTicketTemplate} from "../api/serviceApi.js"

// const departments = [
//   { id: 'accounting', name: 'Accounting Department', code: 'AD' },
//   { id: 'audit', name: 'Audit', code: 'CAD' },
//   { id: 'business-dev', name: 'Business Development', code: 'BD' },
//   { id: 'business-intel', name: 'Business Intelligence Group', code: 'BIG' },
//   { id: 'caremasters', name: 'CareMasters Inc', code: 'CMI' },
//   { id: 'procurement', name: 'Corporate Procurement Department', code: 'CPD' },
//   { id: 'credit', name: 'Credit and Collection', code: 'C&C' },
//   { id: 'engineering', name: 'Engineering', code: 'CED' },
//   { id: 'executive', name: 'Executive', code: 'EXEC' },
//   { id: 'finance', name: 'Finance', code: 'FIN' },
//   { id: 'fp-analysis', name: 'Financial Planning & Analysis', code: 'FP&A' },
//   { id: 'food-bev', name: 'Food and Beverages', code: 'F&B' },
//   { id: 'hr', name: 'Human Resources', code: 'HR' },
//   { id: 'it', name: 'Information Technology', code: 'IT' },
//   { id: 'legal', name: 'Legal', code: 'LEGAL' },
//   { id: 'marketing', name: 'Marketing', code: 'MKT' },
//   { id: 'operations', name: 'Operations', code: 'OPS' },
//   { id: 'sales', name: 'Sales', code: 'SALES' },
// ];

const serviceCategories = [
  {
      id: 'ad',
      name: 'Accounting Department',
      code: 'AD',
      templates: [
          { id: 'ad1', name: 'Assistance in Financial Assessment Templates', type: 'service', desc: 'Request help with financial assessment document templates', code: 'AD01', baseRate: 5000, sla: '3-5 days' },
          { id: 'ad2', name: 'Assistance in Financial Budget Templates', type: 'service', desc: 'Request help with budget planning templates', code: 'AD02', baseRate: 5000, sla: '3-5 days' },
          { id: 'ad3', name: 'Inquiries & Follow up of Contractor\'s Billing', type: 'service', desc: 'Follow up on contractor billing inquiries', code: 'AD03', baseRate: 2000, sla: '1-2 days' },
          { id: 'ad4', name: 'Inquiries & Follow Up of Supplier\'s Payable Account', type: 'service', desc: 'Follow up on supplier payment status', code: 'AD04', baseRate: 2000, sla: '1-2 days' },
          { id: 'ad5', name: 'Request for AD Documents', type: 'service', desc: 'Request accounting department documents', code: 'AD05', baseRate: 1000, sla: '1 day' },
          { id: 'ad6', name: 'Request for Breakdown - Detailed Expenses aside from the seven (7) Critical Expenses', type: 'service', desc: 'Request detailed expense breakdown reports', code: 'AD06', baseRate: 8000, sla: '5-7 days' },
          { id: 'ad7', name: 'Payment Processing Error', type: 'incident', desc: 'Report issues with payment processing', code: 'AD-I01', baseRate: 0, sla: '4 hrs' },
          { id: 'ad8', name: 'Budget System Access Issue', type: 'incident', desc: 'Report problems accessing budget systems', code: 'AD-I02', baseRate: 0, sla: '2 hrs' }
      ]
  },
  {
      id: 'cad',
      name: 'Audit',
      code: 'CAD',
      templates: [
          { id: 'cad1', name: 'Internal Audit Request', type: 'service', desc: 'Request for internal audit services', code: 'CAD01', baseRate: 25000, sla: '15-30 days' },
          { id: 'cad2', name: 'Compliance Review Request', type: 'service', desc: 'Request compliance review for processes', code: 'CAD02', baseRate: 15000, sla: '10-15 days' },
          { id: 'cad3', name: 'Audit Report Access', type: 'service', desc: 'Request access to audit reports', code: 'CAD03', baseRate: 500, sla: '1 day' },
          { id: 'cad4', name: 'Audit Finding Follow-up', type: 'incident', desc: 'Report issues with audit findings resolution', code: 'CAD-I01', baseRate: 0, sla: '8 hrs' }
      ]
  },
  {
      id: 'bd',
      name: 'Business Development',
      code: 'BD',
      templates: [
          { id: 'bd1', name: 'New Client Onboarding Request', type: 'service', desc: 'Request support for new client onboarding', code: 'BD01', baseRate: 10000, sla: '5-7 days' },
          { id: 'bd2', name: 'Partnership Proposal Review', type: 'service', desc: 'Request review of partnership proposals', code: 'BD02', baseRate: 8000, sla: '3-5 days' },
          { id: 'bd3', name: 'Market Research Request', type: 'service', desc: 'Request market research analysis', code: 'BD03', baseRate: 20000, sla: '10-15 days' },
          { id: 'bd4', name: 'CRM System Issue', type: 'incident', desc: 'Report CRM system problems', code: 'BD-I01', baseRate: 0, sla: '4 hrs' }
      ]
  },
  {
      id: 'big',
      name: 'Business Intelligence Group',
      code: 'BIG',
      templates: [
          { id: 'big1', name: 'Feasibility Study Preparation', type: 'service', desc: 'Comprehensive feasibility study for new projects', code: 'BIG01', baseRate: 50000, sla: '45-90 days' },
          { id: 'big2', name: 'Data Analysis Request', type: 'service', desc: 'Request custom data analysis', code: 'BIG02', baseRate: 15000, sla: '7-14 days' },
          { id: 'big3', name: 'Dashboard Development', type: 'service', desc: 'Request new dashboard creation', code: 'BIG03', baseRate: 25000, sla: '14-21 days' },
          { id: 'big4', name: 'Report Generation', type: 'service', desc: 'Request automated report generation', code: 'BIG04', baseRate: 8000, sla: '5-7 days' },
          { id: 'big5', name: 'BI Tool Access Request', type: 'service', desc: 'Request access to BI tools', code: 'BIG05', baseRate: 2000, sla: '1-2 days' },
          { id: 'big6', name: 'Data Discrepancy Report', type: 'incident', desc: 'Report data inconsistencies', code: 'BIG-I01', baseRate: 0, sla: '8 hrs' },
          { id: 'big7', name: 'Dashboard Error', type: 'incident', desc: 'Report dashboard malfunction', code: 'BIG-I02', baseRate: 0, sla: '4 hrs' }
      ]
  },
  {
      id: 'cmi',
      name: 'CareMasters Inc',
      code: 'CMI',
      templates: [
          { id: 'cmi1', name: 'Healthcare Service Request', type: 'service', desc: 'Request healthcare-related services', code: 'CMI01', baseRate: 5000, sla: '2-3 days' },
          { id: 'cmi2', name: 'Medical Equipment Request', type: 'service', desc: 'Request medical equipment', code: 'CMI02', baseRate: 15000, sla: '5-10 days' },
          { id: 'cmi3', name: 'Patient Care Coordination', type: 'service', desc: 'Request patient care coordination support', code: 'CMI03', baseRate: 8000, sla: '1-2 days' },
          { id: 'cmi4', name: 'Healthcare System Issue', type: 'incident', desc: 'Report healthcare system problems', code: 'CMI-I01', baseRate: 0, sla: '1 hr' }
      ]
  },
  {
      id: 'cpd',
      name: 'Corporate Procurement Department',
      code: 'CPD',
      templates: [
          { id: 'cpd1', name: 'Purchase Request', type: 'service', desc: 'Submit new purchase request', code: 'CPD01', baseRate: 1000, sla: '3-5 days' },
          { id: 'cpd2', name: 'Vendor Registration', type: 'service', desc: 'Request new vendor registration', code: 'CPD02', baseRate: 2000, sla: '5-7 days' },
          { id: 'cpd3', name: 'Contract Review Request', type: 'service', desc: 'Request contract review', code: 'CPD03', baseRate: 5000, sla: '3-5 days' },
          { id: 'cpd4', name: 'PO Status Inquiry', type: 'service', desc: 'Inquire about purchase order status', code: 'CPD04', baseRate: 500, sla: '1 day' },
          { id: 'cpd5', name: 'Procurement System Error', type: 'incident', desc: 'Report procurement system issues', code: 'CPD-I01', baseRate: 0, sla: '4 hrs' }
      ]
  },
  {
      id: 'cc',
      name: 'Credit and Collection',
      code: 'C&C',
      templates: [
          { id: 'cc1', name: 'Credit Application Review', type: 'service', desc: 'Request credit application review', code: 'CC01', baseRate: 3000, sla: '2-3 days' },
          { id: 'cc2', name: 'Collection Status Inquiry', type: 'service', desc: 'Inquire about collection status', code: 'CC02', baseRate: 500, sla: '1 day' },
          { id: 'cc3', name: 'Payment Plan Request', type: 'service', desc: 'Request payment plan arrangement', code: 'CC03', baseRate: 2000, sla: '2-3 days' },
          { id: 'cc4', name: 'Credit System Issue', type: 'incident', desc: 'Report credit system problems', code: 'CC-I01', baseRate: 0, sla: '2 hrs' }
      ]
  },
  {
      id: 'ced',
      name: 'Engineering',
      code: 'CED',
      templates: [
          { id: 'ced1', name: 'Technical Support Request', type: 'service', desc: 'Request engineering technical support', code: 'CED01', baseRate: 5000, sla: '2-3 days' },
          { id: 'ced2', name: 'Equipment Maintenance Request', type: 'service', desc: 'Request equipment maintenance', code: 'CED02', baseRate: 8000, sla: '3-5 days' },
          { id: 'ced3', name: 'Facility Modification Request', type: 'service', desc: 'Request facility modifications', code: 'CED03', baseRate: 25000, sla: '15-30 days' },
          { id: 'ced4', name: 'Equipment Malfunction', type: 'incident', desc: 'Report equipment malfunction', code: 'CED-I01', baseRate: 0, sla: '2 hrs' },
          { id: 'ced5', name: 'Safety Hazard Report', type: 'incident', desc: 'Report safety hazards', code: 'CED-I02', baseRate: 0, sla: '30 mins' }
      ]
  },
  {
      id: 'exec',
      name: 'Executive',
      code: 'EXEC',
      templates: [
          { id: 'exec1', name: 'Executive Meeting Coordination', type: 'service', desc: 'Request executive meeting coordination', code: 'EXEC01', baseRate: 5000, sla: '1-2 days' },
          { id: 'exec2', name: 'Board Report Request', type: 'service', desc: 'Request board report preparation', code: 'EXEC02', baseRate: 15000, sla: '5-7 days' },
          { id: 'exec3', name: 'Executive Travel Arrangement', type: 'service', desc: 'Request executive travel arrangements', code: 'EXEC03', baseRate: 10000, sla: '2-3 days' },
          { id: 'exec4', name: 'Confidential Document Request', type: 'service', desc: 'Request confidential documents', code: 'EXEC04', baseRate: 2000, sla: '1 day' }
      ]
  },
  {
      id: 'fin',
      name: 'Finance',
      code: 'FIN',
      templates: [
          { id: 'fin1', name: 'Budget Allocation Request', type: 'service', desc: 'Request budget allocation', code: 'FIN01', baseRate: 5000, sla: '3-5 days' },
          { id: 'fin2', name: 'Financial Report Request', type: 'service', desc: 'Request financial reports', code: 'FIN02', baseRate: 3000, sla: '2-3 days' },
          { id: 'fin3', name: 'Expense Reimbursement', type: 'service', desc: 'Submit expense reimbursement', code: 'FIN03', baseRate: 500, sla: '3-5 days' },
          { id: 'fin4', name: 'Tax Document Request', type: 'service', desc: 'Request tax-related documents', code: 'FIN04', baseRate: 1000, sla: '2-3 days' },
          { id: 'fin5', name: 'Financial System Error', type: 'incident', desc: 'Report financial system issues', code: 'FIN-I01', baseRate: 0, sla: '1 hr' }
      ]
  },
  {
      id: 'fpa',
      name: 'Financial Planning & Analysis',
      code: 'FP&A',
      templates: [
          { id: 'fpa1', name: 'Forecast Analysis Request', type: 'service', desc: 'Request financial forecast analysis', code: 'FPA01', baseRate: 20000, sla: '10-15 days' },
          { id: 'fpa2', name: 'Variance Analysis Report', type: 'service', desc: 'Request variance analysis report', code: 'FPA02', baseRate: 15000, sla: '7-10 days' },
          { id: 'fpa3', name: 'Budget Planning Support', type: 'service', desc: 'Request budget planning assistance', code: 'FPA03', baseRate: 10000, sla: '5-7 days' },
          { id: 'fpa4', name: 'Financial Model Development', type: 'service', desc: 'Request financial model creation', code: 'FPA04', baseRate: 30000, sla: '15-20 days' },
          { id: 'fpa5', name: 'Planning Tool Issue', type: 'incident', desc: 'Report planning tool problems', code: 'FPA-I01', baseRate: 0, sla: '4 hrs' }
      ]
  },
  {
      id: 'fb',
      name: 'Food and Beverages',
      code: 'F&B',
      templates: [
          { id: 'fb1', name: 'Catering Service Request', type: 'service', desc: 'Request catering services', code: 'FB01', baseRate: 15000, sla: '3-5 days' },
          { id: 'fb2', name: 'Menu Planning Support', type: 'service', desc: 'Request menu planning assistance', code: 'FB02', baseRate: 5000, sla: '2-3 days' },
          { id: 'fb3', name: 'Food Quality Complaint', type: 'incident', desc: 'Report food quality issues', code: 'FB-I01', baseRate: 0, sla: '1 hr' },
          { id: 'fb4', name: 'Kitchen Equipment Issue', type: 'incident', desc: 'Report kitchen equipment problems', code: 'FB-I02', baseRate: 0, sla: '2 hrs' }
      ]
  },
  {
      id: 'hr',
      name: 'Human Resources',
      code: 'HR',
      templates: [
          { id: 'hr1', name: 'Leave Application', type: 'service', desc: 'Submit leave application', code: 'HR01', baseRate: 0, sla: '1-2 days' },
          { id: 'hr2', name: 'Training Request', type: 'service', desc: 'Request training enrollment', code: 'HR02', baseRate: 5000, sla: '5-7 days' },
          { id: 'hr3', name: 'Employee Certificate Request', type: 'service', desc: 'Request employee certificates', code: 'HR03', baseRate: 500, sla: '2-3 days' },
          { id: 'hr4', name: 'Benefits Inquiry', type: 'service', desc: 'Inquire about employee benefits', code: 'HR04', baseRate: 0, sla: '1 day' },
          { id: 'hr5', name: 'HRIS System Issue', type: 'incident', desc: 'Report HR system problems', code: 'HR-I01', baseRate: 0, sla: '4 hrs' },
          { id: 'hr6', name: 'Payroll Discrepancy', type: 'incident', desc: 'Report payroll issues', code: 'HR-I02', baseRate: 0, sla: '8 hrs' }
      ]
  },
  {
      id: 'it',
      name: 'Information Technology',
      code: 'IT',
      templates: [
          { id: 'it1', name: 'New User Account Request', type: 'service', desc: 'Request new user account creation', code: 'IT01', baseRate: 1000, sla: '1-2 days' },
          { id: 'it2', name: 'Software Installation Request', type: 'service', desc: 'Request software installation', code: 'IT02', baseRate: 2000, sla: '1-2 days' },
          { id: 'it3', name: 'Hardware Request', type: 'service', desc: 'Request new hardware equipment', code: 'IT03', baseRate: 5000, sla: '5-10 days' },
          { id: 'it4', name: 'Network Access Request', type: 'service', desc: 'Request network access', code: 'IT04', baseRate: 1000, sla: '1 day' },
          { id: 'it5', name: 'Password Reset', type: 'service', desc: 'Request password reset', code: 'IT05', baseRate: 0, sla: '30 mins' },
          { id: 'it6', name: 'Computer Not Working', type: 'incident', desc: 'Report computer malfunction', code: 'IT-I01', baseRate: 0, sla: '2 hrs' },
          { id: 'it7', name: 'Network Connectivity Issue', type: 'incident', desc: 'Report network problems', code: 'IT-I02', baseRate: 0, sla: '1 hr' },
          { id: 'it8', name: 'Email Issue', type: 'incident', desc: 'Report email problems', code: 'IT-I03', baseRate: 0, sla: '2 hrs' },
          { id: 'it9', name: 'System Slow Performance', type: 'incident', desc: 'Report system performance issues', code: 'IT-I04', baseRate: 0, sla: '4 hrs' }
      ]
  },
  {
      id: 'legal',
      name: 'Legal',
      code: 'LEGAL',
      templates: [
          { id: 'legal1', name: 'Contract Review Request', type: 'service', desc: 'Request legal contract review', code: 'LEG01', baseRate: 10000, sla: '5-7 days' },
          { id: 'legal2', name: 'Legal Opinion Request', type: 'service', desc: 'Request legal opinion', code: 'LEG02', baseRate: 15000, sla: '7-10 days' },
          { id: 'legal3', name: 'NDA Request', type: 'service', desc: 'Request NDA preparation', code: 'LEG03', baseRate: 5000, sla: '2-3 days' },
          { id: 'legal4', name: 'Compliance Query', type: 'service', desc: 'Submit compliance-related queries', code: 'LEG04', baseRate: 3000, sla: '2-3 days' }
      ]
  }
];

const metrics = [
  { id: 1, label: 'Active Requests', value: 0, icon: '📋' },
  { id: 2, label: 'Open Problems', value: 0, icon: '⚠️' },
  { id: 3, label: 'Pending Changes', value: 0, icon: '🔄' },
  { id: 4, label: 'Tasks Due Today', value: 0, icon: '✅' },
];

function TicketIntake() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState({})
  const [filterType, setFilterType] = useState('all')
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketType, setTicketType] = useState('service')
  const [addCategoryModal, setAddCategoryModal] = useState(false)
  const [addTemplateModal, setAddTemplateModal] = useState(false)
  const [moreFieldsModal, setMoreFieldsModal] = useState(false)
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState(false)

  const [searchTerm, setSearchTerm] = useState('');

  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [category, setCategory] = useState([]);
  const [priorities, setPriorities] = useState([])

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

  const getFilteredTemplates = () => {
    return templates.filter(template => {
      // Check for Type (all, incident, service)
      const matchesType = filterType === 'all' || template.type === filterType;

      // Check for Category
      const matchesCategory = !selectedCategory || template.category_id === selectedCategory;

      // Check for Search Term (name)
      const matchesSearch = !searchTerm || template.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Only include template if all conditions match
      return matchesType && matchesCategory && matchesSearch;
    });
  };

  const calculateSeverity = (baseRate, multiplier) => {
    return baseRate * multiplier;
  };

  const [severityMultiplier, setSeverityMultiplier] = useState(1); // Default is 1 (no change)

  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleCreateTicketTemplate = async () => {
  try {
    if(!selectedTemplate) return;

    const res = await createTicketTemplate(
      selectedTemplate.name,
      selectedTemplate.description,
      selectedTemplate.baseRate,
      selectedTemplate.sla,
      selectedTemplate.type,
      selectedTemplate.priority,
      selectedTemplate.category_id,
      selectedTemplate.status,
      selectedTemplate.serviceCode,
      selectedTemplate.jorType
    )

    if(res.success){
      fetchCategoriesAndTemplates()
      setAddTemplateModal(false)
      setSelectedTemplate({})
      alert(`✅ Template Created!\n\nType: ${ticketType.toUpperCase()}\nService: ${selectedTemplate?.name}\nCode: ${selectedTemplate?.code}\nEstimated Cost: ₱${selectedTemplate?.baseRate?.toLocaleString()}`)
    }
  } catch (err) {
    console.error("Failed to create template", err)
  }
}

const handleUpdateTicketTemplate = async() => {
  try {
    if(!selectedTemplate) return;

    const res = await updateTicketTemplate(
      selectedTemplate.id,
      selectedTemplate.name,
      selectedTemplate.description,
      selectedTemplate.baseRate,
      selectedTemplate.sla,
      selectedTemplate.type,
      selectedTemplate.priority,
      selectedTemplate.category_id,
      selectedTemplate.status,
      selectedTemplate.serviceCode,
      selectedTemplate.jorType
    )

    if(res.success){
      fetchCategoriesAndTemplates()
      setAddTemplateModal(false)
      setSelectedTemplate({})
      alert(`✅ Template Updated!\n\nType: ${ticketType.toUpperCase()}\nService: ${selectedTemplate?.name}\nCode: ${selectedTemplate?.code}\nEstimated Cost: ₱${selectedTemplate?.baseRate?.toLocaleString()}`)
    }
  } catch (err) {
    console.error("Failed to update template", err)
  }
}

  const fetchCategoriesAndTemplates = async() => {
    const res = await getCategoriesAndTemplates()

    if(res.success){
      setCategories(res.categories)
      setDepartments(res.departments)
      setTemplates(res.templates)
      setPriorities(res.priorities)
    }
  };
  
  const handleCreateCategory = async() => {
    const res = await createCategory(category.name, category.code, category.department_id)

    if(res.success){
      fetchCategoriesAndTemplates()
      alert("Successfully created new category")
      setAddCategoryModal(false)
    }
  }

  useEffect(() => {
    fetchCategoriesAndTemplates()
  }, [])

  return (
    <div className="font-sans bg-gray-50 min-h-screen text-gray-800">
      <Sidebar collapsed={sidebarCollapsed} onNavigate={navigateToModule} />
      <SidebarToggle collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Header */}
      <Header collapsed={sidebarCollapsed} />

      <div className={`max-w-max mx-auto py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${sidebarCollapsed ? 'sidebar-collapsed-margin' : 'with-sidebar'}`}>
        <div className="grid grid-cols-[320px_1fr] gap-6">
          {/* Sidebar - Categories */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-start justify-between">
              <h3 className="font-bold text-gray-800">Service Categories</h3>
              <button 
                className='bg-[#ef4444] text-white border-none text-[14px] cursor-pointer rounded-[4px] font-[600] px-3 py-1' 
                onClick={() => setAddCategoryModal(true)}
              >
                <p>+ Add</p>
              </button>
            </div>
            <div className="p-2">
              {categories.length > 0 && categories.map((category) => (
                <div
                  key={category.id}
                  className={`group p-3 mb-1 cursor-pointer transition-all flex items-center justify-between gap-3 border-l-4 ${
                    selectedCategory === category.id 
                      ? 'bg-blue-50 border-blue-600' // Light blue bg and distinct blue border
                      : 'bg-white border-transparent hover:bg-gray-50'
                  }`}
                  onClick={() => { setSelectedCategory(category.id); setSelectedTemplate(null); }}
                >
                  <div className="flex items-center justify-between w-full p-2 group cursor-pointer">
                    <div className="flex items-center gap-3">
                      {/* Icon Wrapper */}
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-xl text-gray-400">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>

                      {/* Text Details using your Category data */}
                      <div className="flex flex-col">
                        <div className={`text-[15px] font-medium leading-tight ${selectedCategory === category.code ? 'text-blue-600' : 'text-gray-800'}`}>
                          {category.name}
                        </div>
                        <div className="text-[14px] text-blue-500 font-medium">
                          [{category.code}]
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* The Number Badge on the side */}
                  <div className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full min-w-[24px] text-center">
                    {category.total_templates}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content - Templates */}
          <div>
            {/* Filter Bar */}
            <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 flex gap-4 items-center w-full">
              {/* Search Bar - flex-1 makes it stretch */}
              <div className="relative flex items-center flex-1">
                <svg 
                  className="absolute left-3 text-gray-400" 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>

                <input 
                  type="search" 
                  placeholder="Search templates..." 
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value);}}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md outline-none transition-all text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                />
              </div>

              {/* Create Ticket Button - Matching the blue in the image */}
              <button
                className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                onClick={() => {
                  setIsCreatingNewTemplate(true);
                  setSelectedTemplate({
                    name: '',
                    status: '',
                    jorType: '',
                    serviceCode: '',
                    description: '',
                    baseRate: '',
                    sla: '',
                    type: filterType === 'all' ? 'service' : filterType,
                    priority: '',
                    category_id: selectedCategory
                  });
                  setAddTemplateModal(true);
                }}
              >
                <span className="text-lg font-light">+</span> Create Template
              </button>
                  
              {/* Segmented Filter Group */}
              <div className="flex border border-gray-200 rounded-md overflow-hidden">
                {['all', 'incident', 'service'].map((type) => (
                  <button
                    key={type}
                    className={`px-5 py-2 text-sm font-medium transition-all first:border-l-0 border-l border-gray-200 ${
                      filterType === type 
                      ? 'bg-[#ef4444] text-white' // Red background for active as seen in image
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setFilterType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
                  
            </div>
            <div className='p-5 bg-white rounded-lg border border-solid border-gray-200'>
              <p>Select a <strong>Service Category</strong> from the left panel, then choose a template to create your ticket. Templates help standardize requests and make it easier for you to find them.</p>
              <p><strong>Incident templates</strong> are marked by a paper with an error and edit icon whereas <strong>service request templates</strong> are marked by a paper on a hand icon.</p>
            </div>
            {getFilteredTemplates().length > 0 && (selectedCategory || searchTerm.length > 0)? (
              <>
                {/* Templates Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-gray-50">
                  {getFilteredTemplates().map((template) => (
                    <div
                      key={template.id}
                      className={`bg-white rounded-xl p-5 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        selectedTemplate?.id === template.id 
                          ? 'border-blue-500 shadow-lg' 
                          : 'border-gray-100 hover:border-blue-300 hover:shadow-md'
                      }`}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsCreatingNewTemplate(false);
                        setAddTemplateModal(true);
                      }}
                    >
                      {/* Header Section: Icon and Title side-by-side */}
                      <div className="flex gap-4 items-start mb-2">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          template.type === 'service' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {template.type === 'service' ? (
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <path d="M9 15h6"></path>
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                              <line x1="12" y1="9" x2="12" y2="13"></line>
                              <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex flex-col">
                          <h4 className="font-bold text-gray-700 leading-tight mb-1">{template.name}</h4>
                          <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            template.type === 'service' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {template.type === 'service' ? 'Service' : 'Incident'}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-500 my-4 line-clamp-2">{template.desc}</p>

                      {/* Footer Section */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                        <div className="font-extrabold text-red-500">
                          {template.baseRate === 0 ? 'Free' : `₱${template.baseRate.toLocaleString()}`}
                        </div>
                        <div className="bg-green-50 px-3 py-1 rounded-full border border-green-100">
                          <span className="text-[11px] font-medium text-green-600">SLA: {template.sla} days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
                <div className="text-5xl mb-4">📂</div>
                <div className="text-lg font-semibold text-gray-800 mb-2">Select a Category</div>
                <div className="text-sm text-gray-500">Choose a service category from the sidebar to view available templates</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTicketModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl m-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 p-4 border-b border-gray-200 flex items-end justify-between bg-white">
              <h2 className="text-lg font-bold text-gray-800">Create New Ticket</h2>
              <span  
                className='cursor-pointer hover:text-slate-500 text-3xl'
                onClick={() => setShowTicketModal(false)}
              >
                &times;
              </span>
            </div>
            <div className="p-4 space-y-4">
              {/* Ticket Type */}
              <div>
                <h1 className='text-base font-semibold mb-3'>🎫 Ticket Type</h1>
                <label className="flex items-start text-sm font-semibold text-gray-700 mb-2 ">
                  <p>Select Ticket Type</p>
                  <p className='text-red-600'>*</p>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${ticketType === 'incident' ? 'border-blue-800 bg-blue-50' : 'border-gray-500 hover:border-blue-800 hover:bg-blue-50 hover:border-5'}`}
                    onClick={() => setTicketType('incident')}
                  >
                    <div className="text-4xl mb-2 mt-2">🚨</div>
                    <div className="font-semibold text-base pt-2 pb-2">Incident Report</div>
                    <div className="text-sm text-gray-500 mb-2">Unexpected issues or emergencies</div>
                  </div>
                  <div
                    className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${ticketType === 'service' ? 'border-blue-800 bg-blue-50' : 'border-gray-500 hover:border-blue-800 hover:bg-blue-50 hover:border-5'}`}
                    onClick={() => setTicketType('service')}
                  >
                    <div className="text-4xl mb-2 mt-2">🔧</div>
                    <div className="font-semibold text-base pt-2 pb-2">Service Request</div>
                    <div className="text-sm text-gray-500 mb-2">Planned service request</div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <div className='flex items-start justify-start'>
                  <h1 className='text-base font-semibold pr-2'>📍 Location</h1>
                  <p className='text-green-800 bg-green-100 w-24 px-2 py-1 text-xs text-center font-semibold rounded-md mt-1'>AUTO-FILLED</p>
                </div>

                {/* Location */}
                <div className='mt-3'>
                  <p className='font-semibold text-sm'>Room / Area</p>
                  <input 
                    type="text" 
                    placeholder="Corporate Office - 5th Floor" 
                    readOnly 
                    className='bg-green-50 border-green-300 border-2 border-solid w-full rounded-[3px] h-[2.5rem] pl-4 placeholder:text-black text-sm' 
                  />
                  <p className='text-xs text-gray-400 pt-2'>Auto-populated from current location/branch</p>
                </div>              
              </div>

              {/* Service Provider & Request Details */}
              <div className='mt-2'>
                <div className='flex items-start justify-start'>
                  <h1 className='text-base font-semibold pr-2'>🖥️ Service Provider & Request Details</h1>
                </div>

                {/* Service Provider */}
                <div className='mt-3'>
                  <div>
                    <label className="flex items-start text-sm font-semibold text-gray-700 mb-2 ">
                      <p>Service Provider</p>
                      <p className='text-red-600'>*</p>
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-blue-500 text-sm"
                      value={selectedCategory || ''}
                      onChange={(e) => { setSelectedCategory(e.target.value); setSelectedTemplate(null); }}
                    >
                      <option value="">Select category</option>
                      {serviceCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Service */}
                <div className='mt-3'>
                  <div>
                    <label className="flex items-start text-sm font-semibold text-gray-700 mb-2 ">
                      <p>Service</p>
                      <p className='text-red-600'>*</p>
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-blue-500 text-sm"
                      value={selectedTemplate?.id || ''}
                      onChange={(e) => {
                        const cat = serviceCategories.find(c => c.id === selectedCategory)
                        const template = cat?.templates.find(t => t.id === e.target.value)
                        setSelectedTemplate(template)
                      }}
                      disabled={!selectedCategory}
                    >
                      <option value="">Select service</option>
                      {getFilteredTemplates().map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                    <p className='text-xs text-gray-400 pt-2'>Available services will appear based on selected provider</p>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="">
                <div className='mt-3'>
                <label className="flex items-start text-sm font-semibold text-gray-700 mb-2 ">
                      <p>Subject</p>
                      <p className='text-red-600'>*</p>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter ticket subject..." 
                      className='border-gray-300 border border-solid w-full rounded-[3px] h-[2.5rem] pl-4 outline-blue-500 text-sm' 
                    />
                  </div>
                
              </div>

              {/* Description */}
              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700 mb-2 ">
                  <p>Description</p>
                  <p className='text-red-600'>*</p>
                </label>
                <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 outline-blue-500 text-sm" placeholder="Provide detailed description of the request..."></textarea>
              </div>

              {/* Pricing Preview */}
              {selectedTemplate && (
                <div className="rounded-lg p-3 border border-gray-200">
                  <div className="text-base font-semibold mb-2">💰 Service Pricing</div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className='border-1 bg-gray-100 p-3 rounded-md'>
                      <div className="text-sm text-gray-500 font-semibold">Service Code</div>
                      <div className="text-lg font-bold text-red-600 pt-1">{selectedTemplate.code}</div>
                    </div>
                    <div className='border-1 bg-gray-100 p-3 rounded-md'>
                      <div className="text-sm text-gray-500 font-semibold">SLA</div>
                      <div className="text-lg font-bold text-green-600 pt-1">{selectedTemplate.sla}</div>
                    </div>
                    <div className='border-1 bg-gray-100 p-3 rounded-md'>
                      <div className="text-sm text-gray-500 font-semibold">Base Rate</div>
                      <div className="text-lg font-bold text-blue-600 pt-1">₱{selectedTemplate.baseRate.toLocaleString()}</div>
                    </div>           
                  </div>
                  <div className='mt-3'>
                    <p className='font-semibold mb-2 text-sm'>Severity Adjustment</p>
                    <select 
                      className='w-full rounded-[3px] h-[2.5rem] pl-4 border border-solid border-gray-300 outline-blue-400 text-sm'
                      onChange={(e) => setSeverityMultiplier(parseFloat(e.target.value))}
                      value={severityMultiplier}
                    >
                      <option value="1">Normal (No adjustment)</option>
                      <option value="1.25">High (+25%)</option>
                      <option value="1.5">Urgent (+50%)</option>
                    </select>
                  </div>
                  <div className='mt-3 flex justify-between items-center p-4 bg-red-50 border border-red-200 border-l-[6px] border-l-red-500 rounded-md shadow-sm'>
                    {/* Left Side: Label */}
                    <p className="text-[11px] uppercase tracking-widest text-red-800 font-bold">
                      Total Cost
                    </p>

                    {/* Right Side: Price */}
                    <div className="text-right">
                      <span className="text-2xl font-black text-red-600">
                        ₱{((selectedTemplate?.baseRate || 0) * severityMultiplier).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>            
              )}

              {/* Attachments */}
              <div>
                <div className='flex items-start justify-start'>
                  <h1 className='text-base font-semibold pr-2'>📎 Attachments</h1>
                </div>

                {/* Attachment Body */}
                <div className='mt-3'>
                  {/* Hidden File Input */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".png,.jpg,.pdf"
                  />

                  {/* Styled Drop Zone */}
                  <div 
                    onClick={handleBoxClick}
                    className='border-2 border-dashed rounded-md border-gray-400 cursor-pointer hover:border-blue-500 p-5 hover:bg-blue-50 transition-colors group'
                  >
                    <div className='flex flex-col items-center justify-center text-center'>
                      <p className='font-semibold text-black bg-gray-200 border border-gray-300 px-3 py-1.5 rounded-md group-hover:bg-blue-100 group-hover:border-blue-300 transition-all text-sm'>
                        📁 {file ? file.name : "Click to upload or drag and drop"}
                      </p>
                      
                      <p className='text-xs text-gray-400 mt-2'>
                        {file ? `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB` : "PNG, JPG, PDF up to 10MB"}
                      </p>
                    </div>
                  </div>

                  {/* Preview/Remove Section (Optional) */}
                  {file && (
                    <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded text-sm">
                      <span className="truncate flex-1">{file.name}</span>
                      <button 
                        onClick={() => setFile(null)} 
                        className="text-red-500 hover:text-red-700 ml-4 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>             
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-sm" onClick={() => setShowTicketModal(false)}>Cancel</button>
              <button 
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 cursor-pointer text-sm" 
                onClick={() => {
                  if(selectedTemplate.id){
                    handleUpdateTicketTemplate()
                    return;
                  }

                  handleCreateTicketTemplate()
                }} 
                disabled={!selectedTemplate}>
                  ✓ {selectedTemplate.id ? "Update Ticket Template" : "Create Ticket Template"}
                </button>
            </div>
          </div>
        </div>
      )}

      

      {addTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => {setAddTemplateModal(false); setSelectedTemplate({})}}>
          <div className="bg-white rounded-xl w-full max-w-3xl m-4 shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="sticky top-0 z-10 p-4 border-b border-gray-200 flex items-end justify-between bg-white">
              <h2 className="text-lg font-bold text-gray-800">{isCreatingNewTemplate ? 'Create New Template' : 'Service Template'}</h2>
              <span className='cursor-pointer hover:text-slate-500 text-3xl' onClick={() => {setAddTemplateModal(false); setSelectedTemplate({})}}>&times;</span>
            </div>

            <div className='p-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Title</p>
                  <p className='text-red-600'>*</p>
                </label>
                <input 
                  type="text" 
                  onChange={(e) => setSelectedTemplate((prev) => ({...prev, name: e.target.value}))}
                  value={selectedTemplate?.name || ''} 
                  className='pl-3 border border-solid border-gray-200 bg-gray-50 text-gray-600 outline-none mt-2 w-full h-[2.5rem] rounded-sm text-sm' 
                />
              </div>

              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Status</p>
                  <p className='text-red-600'>*</p>
                </label>
                <select 
                  className='pl-3 border border-solid border-gray-200 outline-gray-400 mt-2 w-full h-[2.5rem] rounded-sm bg-white text-sm'
                  value={selectedTemplate.status ?? ''}
                  onChange={(e) => setSelectedTemplate((prev) => ({...prev, status: e.target.value}))}>
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className='pl-4 pr-4 pb-3'>
              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>JOR Type</p>
                </label>
                <select
                  value={selectedTemplate?.jorType || ''}
                  onChange={(e) => setSelectedTemplate((prev) => ({...prev, jorType: e.target.value}))}
                  className='pl-3 border border-solid border-gray-200 bg-gray-50 text-gray-600 mt-2 w-full h-[2.5rem] rounded-sm text-sm'>
                  <option value="">Select JOR Type</option>
                  <option value="JOR">JOR</option>
                  <option value="NonJOR">Non JOR</option>
                </select> 
              </div>
            </div>

            <div className='pl-4 pr-4 pb-3'>
              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Service Code</p>
                </label>
                <input 
                  type="text" 
                  onChange={(e) => setSelectedTemplate((prev) => ({...prev, serviceCode: e.target.value}))}
                  value={selectedTemplate?.serviceCode || ''}
                  placeholder="e.g., AD01, BIG02"
                  className='pl-3 border border-solid border-gray-200 bg-gray-50 text-gray-600 mt-2 w-full h-[2.5rem] rounded-sm text-sm'
                />
              </div>
            </div>

            <div className='pl-4 pr-4 pb-3'>
              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Service Category</p>
                </label>
                <select
                  value={selectedTemplate?.category_id || ''}
                  className='pl-3 border border-solid border-gray-200 bg-gray-50 text-gray-600 mt-2 w-full h-[2.5rem] rounded-sm text-sm'
                  onChange={(e) => setSelectedTemplate((prev) => ({...prev, category_id: e.target.value}))}>
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} [{cat.code}]
                    </option>
                  ))}
                </select> 
              </div>
            </div>

            <div className='pl-4 pr-4 pb-3'>
              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Description</p>
                </label>
                <textarea  
                  onChange={(e) => setSelectedTemplate((prev) => ({...prev, description: e.target.value}))}
                  value={selectedTemplate?.description || ''}
                  rows="3" 
                  className='w-full pl-3 pt-2 border border-solid border-gray-200 bg-gray-50 text-gray-600 outline-none rounded-sm mt-2 text-sm'
                />
              </div>
            </div>

            <div className='pl-4 pr-4 pb-3'>
              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>SLA (Days)</p>
                </label>
                <input 
                  type="text" 
                  onChange={(e) => setSelectedTemplate((prev) => ({...prev, sla: e.target.value}))}
                  value={selectedTemplate?.sla || ''}
                  className='pl-3 border border-solid border-gray-200 bg-gray-50 text-gray-600 mt-2 w-full h-[2.5rem] rounded-sm text-sm' 
                />
              </div>
            </div>

            <div className='pl-4 pr-4 pb-3'>
              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Base Rate</p>
                </label>
                <input 
                  type="text" 
                  onChange={(e) => setSelectedTemplate((prev) => ({...prev, baseRate: e.target.value}))}
                  value={selectedTemplate?.baseRate || ''}
                  placeholder="Enter base rate"
                  className='pl-3 border border-solid border-gray-200 bg-gray-50 text-gray-600 mt-2 w-full h-[2.5rem] rounded-sm text-sm'
                />
              </div>
            </div>


            <div className='pl-4 pr-4 pb-3 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Priority</p>
                  <p className='text-red-600'>*</p>
                </label>
                <select 
                  className='pl-3 border border-solid border-gray-200 outline-gray-400 mt-2 w-full h-[2.5rem] rounded-sm bg-white text-sm'
                  onChange={(e) => setSelectedTemplate((prev) => ({...prev, priority: e.target.value}))}
                  value={selectedTemplate.priority ?? ''}>
                  <option value="">Select Priority</option>
                    {priorities.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Task Type</p>
                  <p className='text-red-600'>*</p>
                </label>
                <select
                  value={selectedTemplate?.type || ''}
                  onChange={(e) => setSelectedTemplate((prev) => ({...prev, type: e.target.value}))}
                  className='pl-3 border border-solid border-gray-200 bg-gray-50 text-gray-600 mt-2 w-full h-[2.5rem] rounded-sm text-sm'>
                  <option value="">Select Task Type</option>
                  <option value="service">Service</option>
                  <option value="incident">Incident</option>
                </select> 
              </div>
            </div>

            {/* <div className='pl-4 pr-4 pb-3'>
              <p className='text-sm font-semibold text-gray-700'>Scheduled Start</p>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <input type="date" className='pl-3 border border-solid border-gray-200 outline-gray-400 mt-2 w-full h-[2.5rem] rounded-sm bg-white text-sm'/>
                <input type="date" className='pl-3 border border-solid border-gray-200 outline-gray-400 mt-2 w-full h-[2.5rem] rounded-sm bg-white text-sm'/>
              </div>
            </div> */}

            {/* <div className='pl-4 pr-4 pb-2'>
              <p 
                className="p-1.5 bg-gray-200 w-fit px-3 rounded-md cursor-pointer font-semibold text-sm"
                onClick={() => setMoreFieldsModal(!moreFieldsModal)}
              >
                More fields
              </p>
            </div> */}

            {/* {moreFieldsModal && (
              <div className="mx-4 mb-3 p-3 bg-gray-50 border border-gray-200 rounded-sm">
                <div className='pt-2 pb-2'>
                  <label className="block text-sm font-bold text-gray-500 tracking-tight mb-2">Service Code</label>
                  <input 
                    type="text" 
                    readOnly
                    value={selectedTemplate?.code || ''}
                    className="w-full h-[2.5rem] pl-3 bg-white border border-gray-200 rounded-sm text-gray-600 text-sm focus:outline-none"
                  />
                </div>
                <div className='pt-2 pb-2'>
                  <label className="block text-sm font-bold text-gray-500 tracking-tight mb-2">Base Rate (₱)</label>
                  <input 
                    type="text" 
                    readOnly
                    value={selectedTemplate?.baseRate ? `₱${selectedTemplate.baseRate.toLocaleString()}` : '₱0.00'}
                    className="w-full h-[2.5rem] pl-3 bg-white border border-gray-200 rounded-sm text-gray-600 text-sm focus:outline-none"
                  />
                </div>
              </div>
            )} */}

            {/* <div className='pl-4 pr-4 pb-4'>
              <h1 className='text-sm font-semibold'>Attachments</h1>
              <div className='mt-2'>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".png,.jpg,.pdf" />
                <div 
                  onClick={handleBoxClick}
                  className='border-2 border-dashed rounded-md border-gray-400 cursor-pointer hover:border-blue-500 p-5 hover:bg-blue-50 transition-colors group text-center'
                >
                  <p className='inline-block font-semibold text-black bg-gray-200 border border-gray-300 px-3 py-1.5 rounded-md group-hover:bg-blue-100 transition-all text-sm'>
                    📎 {file ? file.name : "Attach file"}
                  </p>
                  {file && (
                    <div className="mt-3 text-xs text-gray-600">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB — <span className="text-red-500 font-bold" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove</span>
                    </div>
                  )}
                </div>
              </div>
            </div> */}

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-sm" onClick={() => {setAddTemplateModal(false); setSelectedTemplate({})}}>Cancel</button>
              <button 
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 cursor-pointer text-sm" 
                onClick={() => {
                  if(selectedTemplate.id){
                    handleUpdateTicketTemplate()
                    return;
                  }
                  handleCreateTicketTemplate()
                }} 
                disabled={!selectedTemplate}>
                  ✓ {selectedTemplate.id ? "Update Ticket" : "Create Ticket"}
              </button>
            </div>

          </div>
        </div>
      )}

      {addCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setAddCategoryModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg m-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="sticky top-0 z-10 p-4 border-b border-gray-200 flex items-end justify-between bg-white">
              <h2 className="text-lg font-bold text-gray-800">Service Categories</h2>
              <span className='cursor-pointer hover:text-slate-500 text-3xl' onClick={() => setAddCategoryModal(false)}>&times;</span>
            </div>

            {/* Form Content */}
            <div className='p-4 space-y-4 max-h-[70vh] overflow-y-auto'>
              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Category Name</p>
                  <p className='text-red-600'>*</p>
                </label>
                <input 
                  type="text" 
                  placeholder="Enter category name"
                  onChange={(e) => setCategory((cat) => ({...cat, name: e.target.value}))}
                  value={category.name}
                  className='pl-3 border border-solid border-gray-300 outline-blue-500 mt-2 w-full h-[2.5rem] rounded-sm text-sm' 
                />
              </div>

              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Department</p>
                  <p className='text-red-600'>*</p>
                </label>
                <select 
                  onChange={(e) => setCategory((cat) => ({...cat, department_id: e.target.value}))}
                  value={category.department_id} 
                  className='pl-3 border border-solid border-gray-300 outline-blue-500 mt-2 w-full h-[2.5rem] rounded-sm bg-white text-sm'>
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Category Code</p>
                  <p className='text-red-600'>*</p>
                </label>
                <input 
                  type="text" 
                  onChange={(e) => setCategory((cat) => ({...cat, code: e.target.value}))}
                  value={category.code} 
                  placeholder="Enter category code"
                  className='pl-3 border border-solid border-gray-300 outline-blue-500 mt-2 w-full h-[2.5rem] rounded-sm text-sm' 
                />
              </div>

              <div>
                {/* <label className="flex items-start text-sm font-semibold text-gray-700">
                  <p>Description</p>
                </label>
                <textarea  
                  placeholder="Enter category description"
                  rows="3" 
                  className='w-full pl-3 pt-2 border border-solid border-gray-300 outline-blue-500 rounded-sm mt-2 text-sm'
                /> */}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-sm" onClick={() => setAddCategoryModal(false)}>Cancel</button>
              <button onClick={handleCreateCategory} className="px-3 py-1.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 cursor-pointer text-sm">✓ Add Category</button>
            </div>

          </div>
        </div>
      )}

      
    </div>
  )
}

export default TicketIntake
