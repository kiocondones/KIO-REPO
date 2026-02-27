import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SidebarToggle from '../components/SidebarToggle';

// 1. Import Chart.js components
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,    // Added
    ArcElement,
    RadialLinearScale, // Added for PolarArea
    Title,
    Tooltip,
    Legend,
    Filler,
  } from 'chart.js';

  import { Line, Doughnut, Bar, PolarArea } from 'react-chartjs-2';

// 2. Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,    // Added
  ArcElement,
  RadialLinearScale, // Added
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 1. Line Chart: Best for showing progress over time
  const JobsCompleted = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Jobs Completed',
      data: [67, 59, 80, 81, 56, 95],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  // 2. Bar Chart: Best for comparing categories like "Average Time"
  const AveTimePerJob = {
    labels: ['Repair', 'Install', 'Maintenance', 'Consult'],
    datasets: [{
      label: 'Minutes per Job',
      data: [45, 120, 60, 30],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
    }],
  };

  // 3. Doughnut Chart: Best for "Fix Rate" (Part of a Whole)
  const FirstTimeFixRate = {
    labels: ['Fixed First Visit', 'Requires Follow-up'],
    datasets: [{
      data: [85, 15],
      backgroundColor: ['#10B981', '#EF4444'],
    }],
  };

  // 4. Polar Area Chart: Great for displaying Star Ratings or scores
  const CustomerRating = {
    labels: ['Quality', 'Punctuality', 'Communication', 'Value'],
    datasets: [{
      data: [4.8, 3.9, 4.5, 4.2],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
    }],
  };


  const navigateToModule = (module) => {
    switch(module) {
      case 'dashboard': navigate('/dashboard'); break;
      case 'myview': navigate('/servicedesk'); break;
      case 'requests': navigate('/requests'); break;
      case 'intake': navigate('/ticket-intake'); break;
      case 'analytics': navigate('/analytics'); break;
      case 'financial': navigate('/section-e'); break;
      case 'admin': navigate('/admin'); break;
      default: break;
    }
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen text-gray-800">
        <Sidebar collapsed={sidebarCollapsed} onNavigate={navigateToModule} />
        <SidebarToggle collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <Header collapsed={sidebarCollapsed} />

        <div className={`transition-all duration-300 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
  
          <h1 className="text-2xl font-bold mb-8 text-center">Analytics Dashboard</h1>

          <hr className="border-t-2 border-gray-300 my-8" />

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full max-w-7xl">


            {/* Jobs Completed */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 flex flex-col items-center">
              <div className="w-full flex justify-between items-start mb-4">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Jobs Completed</h3>
                <span className="text-green-500 text-xs font-bold">↑ 6.7%</span>
              </div>
              <div className="w-full">
                <Line data={JobsCompleted} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
            </div>

            {/* Ave time per job */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500 flex flex-col items-center">
              <div className="w-full flex justify-between items-start mb-4">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Ave. Time</h3>
                <span className="text-green-500 text-xs font-bold">↑ 0.4</span>
              </div>
              <div className="w-full">
                <Bar data={AveTimePerJob} options={{ plugins: { legend: { display: false } } }} />
              </div>
            </div>

            {/* First-time fix rate */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-400 flex flex-col items-center">
              <div className="w-full flex justify-between items-start mb-4">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">First-Time Fix</h3>
                <span className="text-red-500 text-xs font-bold">↓ 33%</span>
              </div>
              <div className="w-full max-w-[200px]">
                <Doughnut data={FirstTimeFixRate} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />
              </div>
            </div>

            {/* Customer Rating */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex flex-col items-center">
              <div className="w-full flex justify-between items-start mb-4">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Customer Rating</h3>
                <span className="text-green-500 text-xs font-bold">↑ 7.6%</span>
              </div>
              <div className="w-full max-w-[200px]">
                <PolarArea data={CustomerRating} options={{ plugins: { legend: { display: false } } }} />
              </div>
            </div>

            {/* Star Rating */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 flex flex-col">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6">Star Rating</h3>
              <div className="space-y-4">
                {CustomerRating.labels.map((label, index) => {
                  const score = CustomerRating.datasets[0].data[index];
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase">{label}</span>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < Math.round(score) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
          
        </div>
    </div>
  );
};

export default Analytics;