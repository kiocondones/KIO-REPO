import { api } from "./axios";

// Fetch all users
export async function getUsers() {
    try {
        const res = await api.get("/servicedesk/user-management")

        return res.data
    }catch (err) {
        console.error("Fetching users failed:", err);
        throw err; 
    }
}

// Create new user
export async function createUser(name, email, phone, role, department) {
    try {
        if(role.toLowerCase() === "viewer") {
            department = null
        }

        console.log(role)
        console.log(department)

        const res = await api.post("/servicedesk/user-management", {
            name, email, phone, role, department
        })

        return res.data
    }catch (err) {
        console.error("Fetching users failed:", err);
        throw err; 
    }
}