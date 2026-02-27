import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from "../api/authApi.js"
import gcgLogo from '../assets/GCG.png'
import loginBg from '../assets/LoginBackGround.jpg' 

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('test3@gcg.com')
  const [password, setPassword] = useState('JohnDoe_8345')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    idNumber: '',
    role: '',
    department: ''
  })
  const [formErrors, setFormErrors] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    idNumber: '',
    role: '',
    department: ''
  })

  const roles = ['Requestor', 'Admin', 'Technician']
  const departments = [
    'CED - Corporate Engineering Depart.',
    'BIG - Business Intelligence Group',
    'CMD - Corporate Marketing Depart.',
    'HRD - Human Resources Depart.',
    'ICT - Information Communication Technologies',
    'BDD - Business Development Department',
    'CNC - Credit and Collection',
    'CTD - Corporate Treasury Department',
    'ACTG - Accouting Department',
    'CPD - Corporate Purchasing Department',
    'GCERC - Global Comfort Employees Relations Council'
  ]

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRemember(true)
    }
  }, []);

  const handleLogin = async(e) => {
    e.preventDefault()

    // Add validation for email and password
    // Add invalid credentials

    if (email && password) {
      setIsLoading(true)
      const res = await login(email, password)

      if (res.success){
        if (remember) {
          localStorage.setItem('rememberEmail', email)
        } else {
          sessionStorage.setItem('sogoUser', email)
          localStorage.removeItem('rememberEmail')
        }

        navigate('/servicedesk')
      }

      setIsLoading(false)
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    alert('Password reset link would be sent to your email.\n\nFor demo purposes, please use any email/password to login.')
  }

  const handleSignup = (e) => {
    e.preventDefault()
    setShowContactModal(true)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleContactFormChange = (field, value) => {
    if (field === 'contactNumber') {
      // Only allow numbers and limit to 11 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 11)
      setContactForm({ ...contactForm, [field]: numericValue })
    } else {
      setContactForm({ ...contactForm, [field]: value })
    }
    // Clear error for this field
    setFormErrors({ ...formErrors, [field]: '' })
  }

  const handleContactFormSubmit = (e) => {
    e.preventDefault()
    
    // Validate form
    const errors = {}
    
    if (!contactForm.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }
    
    if (!contactForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!validateEmail(contactForm.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!contactForm.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required'
    } else if (contactForm.contactNumber.length !== 11) {
      errors.contactNumber = 'Contact number must be exactly 11 digits'
    }
    
    if (!contactForm.idNumber.trim()) {
      errors.idNumber = 'ID number is required'
    }
    
    if (!contactForm.role) {
      errors.role = 'Role is required'
    }
    
    if (contactForm.role !== 'Requestor' && !contactForm.department) {
      errors.department = 'Department is required'
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    
    // Submit form (for now, just show success message)
    alert(`Contact request submitted!\n\nName: ${contactForm.fullName}\nEmail: ${contactForm.email}\nContact: ${contactForm.contactNumber}\nID: ${contactForm.idNumber}\nRole: ${contactForm.role}${contactForm.role !== 'Requestor' ? `\nDepartment: ${contactForm.department}` : ''}\n\nAn administrator will contact you soon.`)
    
    // Reset form and close modal
    setContactForm({ fullName: '', email: '', contactNumber: '', idNumber: '', role: '', department: '' })
    setFormErrors({ fullName: '', email: '', contactNumber: '', idNumber: '', role: '', department: '' })
    setShowContactModal(false)
  }

  const handleCloseModal = () => {
    setShowContactModal(false)
    setContactForm({ fullName: '', email: '', contactNumber: '', idNumber: '', role: '', department: '' })
    setFormErrors({ fullName: '', email: '', contactNumber: '', idNumber: '', role: '', department: '' })
  }

  return (
    <div className="login-container min-h-screen flex relative overflow-hidden flex-col md:flex-row">
      {/* Left side - Branding with colorful gradient */}
      <div className="flex-1 flex items-center justify-center p-10 relative z-10 min-h-[40vh] md:min-h-0" style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="text-center text-white max-w-[500px]">
          <div className="mb-1">
            <img src={gcgLogo} alt="GCG" className="w-[290px] h-auto object-contain mx-auto" />
          </div>
          <h1 className="text-[32px] font-bold mb-2 drop-shadow-lg leading-tight">Service Desk</h1>
          <p className="text-[14px] opacity-95 font-bold">Your service. Your support. Your solution.</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-10 bg-[#f5f5f5] relative z-10">
        <div className="bg-white rounded-[16px] p-10 shadow-lg w-full max-w-[420px]">
          <div className="text-center mb-6">
            <h3 className="text-[28px] font-bold text-gray-800 mb-1">Login</h3>
            <p className="text-sm text-gray-500">Sign in to access your dashboard</p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-600" htmlFor="email">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-3 px-4 pl-10 border border-gray-300 rounded-lg text-[14px] text-gray-800 transition-all duration-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                  placeholder="your@gcgoli.com"
                  required
                  autoComplete="email"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-blue-500">📧</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-600" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-3 px-4 pl-10 pr-10 border border-gray-300 rounded-lg text-[14px] text-gray-800 transition-all duration-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" 
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-blue-500">🔒</span>
                <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-base opacity-60 hover:opacity-100 transition-opacity"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-1">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  name="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-[16px] h-[16px] cursor-pointer accent-blue-600"
                />
                <label htmlFor="remember" className="text-[13px] text-gray-600 cursor-pointer">Remember me</label>
              </div>
              <a 
                href="#" 
                className="text-[13px] text-blue-600 no-underline transition-all hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 bg-[#3b82f6] text-white border-none rounded-lg text-[15px] font-semibold cursor-pointer transition-all duration-200 mt-3 hover:bg-[#2563eb] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-5">
            <p className="text-[13px] text-gray-600">
              Don't have an account?{' '}
              <a 
                href="#" 
                className="text-red-600 no-underline font-medium hover:underline"
                onClick={handleSignup}
              >
                Contact Admin
              </a>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5 p-2.5 bg-orange-50 rounded-md">
            <span className="text-sm">🔒</span>
            <span className="text-[11px] text-gray-700">Secured with 256-bit SSL encryption</span>
          </div>

          <div className="text-center mt-4 text-[10px] text-gray-400">
            © 2024 GOLI. All rights reserved.
          </div>
        </div>
      </div>

      {/* Contact Admin Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[16px] w-full max-w-[500px] shadow-2xl max-h-[75vh] flex flex-col animate-[slideIn_0.3s_ease-out]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 relative">
              <h3 className="text-[24px] font-bold text-gray-800 mb-2">Contact Admin</h3>
              <p className="text-sm text-gray-500">Fill out the form below and an administrator will contact you shortly</p>
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
              >
                ×
              </button>
            </div>

            {/* Contact Form - Scrollable */}
            <form onSubmit={handleContactFormSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-6 py-4 overflow-y-auto flex-1">
                <div className="flex flex-col gap-4">
              {/* Full Name Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={contactForm.fullName}
                  onChange={(e) => handleContactFormChange('fullName', e.target.value)}
                  className={`w-full py-3 px-4 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg text-[14px] text-gray-800 transition-all duration-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                  placeholder="Enter your full name"
                />
                {formErrors.fullName && (
                  <span className="text-[12px] text-red-500">{formErrors.fullName}</span>
                )}
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600" htmlFor="contactEmail">
                  Email Address
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  value={contactForm.email}
                  onChange={(e) => handleContactFormChange('email', e.target.value)}
                  className={`w-full py-3 px-4 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg text-[14px] text-gray-800 transition-all duration-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                  placeholder="your@email.com"
                />
                {formErrors.email && (
                  <span className="text-[12px] text-red-500">{formErrors.email}</span>
                )}
              </div>

              {/* Contact Number Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600" htmlFor="contactNumber">
                  Contact Number
                </label>
                <input
                  type="text"
                  id="contactNumber"
                  value={contactForm.contactNumber}
                  onChange={(e) => handleContactFormChange('contactNumber', e.target.value)}
                  className={`w-full py-3 px-4 border ${formErrors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg text-[14px] text-gray-800 transition-all duration-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                  placeholder="09123456789"
                  maxLength="11"
                />
                <span className="text-[11px] text-gray-500">
                  {contactForm.contactNumber.length}/11 digits
                </span>
                {formErrors.contactNumber && (
                  <span className="text-[12px] text-red-500">{formErrors.contactNumber}</span>
                )}
              </div>

              {/* ID Number Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600" htmlFor="idNumber">
                  ID Number
                </label>
                <input
                  type="text"
                  id="idNumber"
                  value={contactForm.idNumber}
                  onChange={(e) => handleContactFormChange('idNumber', e.target.value)}
                  className={`w-full py-3 px-4 border ${formErrors.idNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg text-[14px] text-gray-800 transition-all duration-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                  placeholder="Enter your ID number"
                />
                {formErrors.idNumber && (
                  <span className="text-[12px] text-red-500">{formErrors.idNumber}</span>
                )}
              </div>

              {/* Role Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-600" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  value={contactForm.role}
                  onChange={(e) => handleContactFormChange('role', e.target.value)}
                  className={`w-full py-3 px-4 border ${formErrors.role ? 'border-red-500' : 'border-gray-300'} rounded-lg text-[14px] text-gray-800 transition-all duration-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {formErrors.role && (
                  <span className="text-[12px] text-red-500">{formErrors.role}</span>
                )}
              </div>

              {/* Department Field - Only show if not Requestor */}
              {contactForm.role && contactForm.role !== 'Requestor' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-600" htmlFor="department">
                    Department
                  </label>
                  <select
                    id="department"
                    value={contactForm.department}
                    onChange={(e) => handleContactFormChange('department', e.target.value)}
                    className={`w-full py-3 px-4 border ${formErrors.department ? 'border-red-500' : 'border-gray-300'} rounded-lg text-[14px] text-gray-800 transition-all duration-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {formErrors.department && (
                    <span className="text-[12px] text-red-500">{formErrors.department}</span>
                  )}
                </div>
              )}
              </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-6 border-t border-gray-200 flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#3b82f6] text-white border-none rounded-lg text-[15px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#2563eb] active:scale-[0.98]"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-3 bg-gray-200 text-gray-700 border-none rounded-lg text-[14px] font-medium cursor-pointer transition-all duration-200 hover:bg-gray-300 active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
