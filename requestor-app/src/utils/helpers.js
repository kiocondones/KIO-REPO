// src/utils/helpers.js

// Convert UTC ISO string to local time
const convertUTCToLocal = (dateString) => {
    if (!dateString) return new Date();
    
    // If the string doesn't end with Z or have timezone info, assume it's UTC
    let isoString = dateString;
    if (!dateString.endsWith('Z') && !dateString.match(/[+-]\d{2}:\d{2}$/)) {
        isoString = dateString + 'Z'; // Assume UTC if no timezone info
    }
    
    return new Date(isoString);
};

export const formatDate = (dateString) => {
    const date = convertUTCToLocal(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

export const getStatusClass = (status) => {
    // Normalize status: convert underscores to hyphens and handle 'onhold' variant
    let normalizedStatus = status ? String(status).toLowerCase().replace(/_/g, '-') : 'new';
    
    // Handle the 'onhold' spelling variant
    if (normalizedStatus === 'onhold') {
        normalizedStatus = 'on-hold';
    }
    
    const classes = {
        'all': 'bg-blue-600 text-white',
        'open': 'bg-green-100 text-green-700',
        'new': 'bg-blue-600 text-white',
        'assigned': 'bg-amber-100 text-amber-800',
        'in-progress': 'bg-indigo-100 text-indigo-800',
        'on-hold': 'bg-red-100 text-red-700',
        'completed': 'bg-green-100 text-green-700',
        'closed': 'bg-gray-100 text-gray-700',
        'rejected': 'bg-red-100 text-red-700'
    };
    return classes[normalizedStatus] || 'bg-gray-100 text-gray-700';
};

export const getStatusLabel = (status) => {
    // Normalize status: convert underscores to hyphens and handle 'onhold' variant
    let normalizedStatus = status ? String(status).toLowerCase().replace(/_/g, '-') : 'new';
    
    // Handle the 'onhold' spelling variant
    if (normalizedStatus === 'onhold') {
        normalizedStatus = 'on-hold';
    }
    
    const labels = {
        'all': 'All',
        'open': 'Open',
        'new': 'New',
        'assigned': 'Assigned',
        'in-progress': 'In Progress',
        'on-hold': 'On Hold',
        'completed': 'Completed',
        'closed': 'Closed',
        'rejected': 'Rejected'
    };
    return labels[normalizedStatus] || 'Unknown';
};