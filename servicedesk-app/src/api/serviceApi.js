import { api } from "./axios";

export async function getCategoriesAndTemplates(){
    try{
        const res = await api.get("/servicedesk/service-configurations")
        const data = res.data;

        return data
    } catch (err) {
        console.error("Fetch Failed:", err);
        throw err; 
    }
}

export async function createCategory(name, code, department_id){
    try{
        const res = await api.post("/servicedesk/service-configurations/categories", {name: name, code: code, department_id:department_id})
        const data = res.data
        
        return data;
    } catch (err) {
        console.error("Create category failed:", err);
        throw err; 
    }
}


export async function createTicketTemplate(
    name,
    description,
    baseRate,
    sla,
    type,
    priority,
    category,
    status,
    code,
    templateType
) {
  try {
    const [minDays, maxDays] = sla
      .replace(/\s+/g, "")
      .split("-")
      .map(Number)

      console.log(category)

    const res = await api.post(
      "/servicedesk/service-configurations/templates",
      {
        name,
        description,
        baseRate: Number(baseRate),
        minDays,
        maxDays,
        type,
        priority,
        category,
        status,
        code,
        templateType
      }
    )

    return res.data
  } catch (err) {
    console.error("Create template failed:", err)
    throw err
  }
}


export async function updateTicketTemplate(
    id,
    name,
    description,
    baseRate,
    sla,
    type,
    priority,
    category,
    status,
    code,
    template_type
) {
  try {
    const [minDays, maxDays] = sla
      .replace(/\s+/g, "")
      .split("-")
      .map(Number)

      console.log(category)

    const res = await api.put(
      `/servicedesk/service-configurations/templates/${id}`,
      {
        name,
        description,
        baseRate: Number(baseRate),
        minDays,
        maxDays,
        type,
        priority,
        category,
        status,
        code,
        template_type
      }
    )

    return res.data
  } catch (err) {
    console.error("Create template failed:", err)
    throw err
  }
}

