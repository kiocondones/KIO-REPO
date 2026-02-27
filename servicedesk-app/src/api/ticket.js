import { api } from "./axios";

export async function createTicket(templateId, description, attachments=[]) {
  try {
    // Create form data
    const form = new FormData();
    form.append("templateId", templateId);
    form.append("description", description);

    // Append files if any
    attachments.forEach((file) => {
      form.append("attachments", file);
    });

    // Make POST request
    const res = await api.post("/servicedesk/tickets", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (err) {
    console.error("Ticket creation failed:", err);
    throw err;
  }
}