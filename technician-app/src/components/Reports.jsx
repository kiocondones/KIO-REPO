import React, { useState } from "react";

function Reports({ mockTickets }) {
    const [selectedTicket, setSelectedTicket] = useState(null);

    return (
        <div className="px-5 pt-5">
            <h2 className="text-2xl font-bold text-gray-700 mb-1">Summary of Reports</h2>
            <div className="h-0.5 bg-gray-200 w-full mb-6"></div>

            {/* Added Search function */}
            <div className="relative mb-6">
                {/* The SVG Icon */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg 
                        className="w-5 h-5 text-gray-500" 
                        aria-hidden="true" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 20 20"
                    >
                    <path 
                        stroke="currentColor" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                    </svg>
                </div>

                {/* The Input - Note the 'pl-10' to make room for the icon */}
                <input 
                    type="search" 
                    placeholder="Search Ticket No. or Ticket Title"
                    className="block w-full p-2 pl-10 bg-gray-100 text-black border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            {/* End of Search function */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-4 py-4 font-semibold text-black">Date</th>
                            <th className="px-4 py-4 font-semibold text-black">Ticket No.</th>
                            <th className="px-4 py-4 font-semibold text-black text-center">Status</th> {/* The idea is to remove Status but no confirmation from TL yet */}
                            <th className="px-4 py-4 font-semibold text-black text-center">Summary</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockTickets && mockTickets.map((ticket) => {
                            const isInProgress = ticket.status === 'In Progress' || ticket.status === 'Assigned';
                            return (
                                <tr key={ticket.id} className="border-t border-gray-200 last:border-b-0">
                                    <td className={`px-4 py-4 ${isInProgress ? 'text-gray-300' : 'text-black'}`}>01-14-2025</td> {/* Date is not in mockTickets so i hardcoded the date */}
                                    <td className={`px-4 py-4 ${isInProgress ? 'text-gray-300' : 'text-black'}`}>{ticket.number}</td> {/* number in mockTickets */}
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-bold inline-block w-24 uppercase tracking-wider
                                            ${ticket.status === 'Completed' || ticket.status === 'Closed' 
                                                ? 'bg-[#71ef81] text-white' 
                                                : 'bg-[#cccccc] text-[#999999]'}`}>
                                            {ticket.status === 'Completed' ? 'Closed' : ticket.status}
                                        </span>
                                    </td> {/* status in mockTickets. also checks if the status is either closed or completed */}
                                    <td className="px-4 py-4 text-center">
                                        <button 
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="inline-flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-sm"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                            </svg>
                                            View PDF
                                        </button>
                                    </td> {/* view design */}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* PDF Sample Only */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white w-full max-w-[450px] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                            <h3 className="text-xl font-medium text-gray-500">
                                Generate Report: <span className="font-bold">#{selectedTicket.number}</span>
                            </h3>
                            <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 flex justify-center">
                            <div className="bg-blue-400 text-black font-semibold p-8 pt-4 pb-4">Some file here</div>
                        </div>

                        <div className="p-6 flex gap-3 border-t border-gray-100">
                            <button 
                                onClick={() => setSelectedTicket(null)}
                                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button className="flex-1 py-3 px-4 bg-[#3b82f6] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors" onClick={(() => alert(`Exporting..... Successfully exported!`))}>
                                Export PDF
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;