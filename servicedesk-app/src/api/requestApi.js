
import { api } from "./axios";

export async function getRequestTickets(){
    try{
        const res = await api.get("/servicedesk/service-management/requests")
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}

export async function getRequestTickeyById(ticketId){
    try{
        const res = await api.get(`/servicedesk/service-management/requests/${ticketId}`)
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}

export async function assignTechnician(ticketId, technicianId){
    try{
        const res = await api.patch(`/servicedesk/tickets/${ticketId}/assign/${technicianId}`)
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}

export async function addResolution(ticketId, description, draft=false){
    try{
        const res = await api.post(`/servicedesk/service-management/${ticketId}/resolution`, {description, draft})
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}

export async function addTask(ticketId, title, description){
    try{
        const res = await api.post(`/servicedesk/service-management/${ticketId}/tasks`, {title, description})
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}

export async function editTask(ticketId, title, description, taskId){
    try{
        const res = await api.put(`/servicedesk/service-management/${ticketId}/tasks/${taskId}`, {title, description})
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}

export async function deleteTaskRequest(ticketId, selectedtaskId){
    try{
        const res = await api.delete(`/servicedesk/service-management/${ticketId}/tasks/${selectedtaskId}`)
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}

export async function addChecklist(ticketId, name, title, description){
    try{
        const res = await api.post(`/servicedesk/service-management/${ticketId}/checklist`, {name, title, description})
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}

export async function editChecklist(ticketId, checklistId, name, title, description){
    try{
        const res = await api.put(`/servicedesk/service-management/${ticketId}/checklist/${checklistId}`, {name, title, description})
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}

export async function deleteChecklist(ticketId, checklistId){
    try{
        const res = await api.delete(`/servicedesk/service-management/${ticketId}/checklist/${checklistId}`)
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}