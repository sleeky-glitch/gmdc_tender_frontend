export interface SowConsultancyRequest {
  tenderTitle: string
  departmentName: string
  contractDuration: number
  projectType?: string
  location?: string
  budget?: string
  specialRequirements?: string
}

export interface DeliverableItem {
  description: string
  timeline: string
}

export interface ScopeOfWorkResponse {
  scopeOfWork: {
    projectTitle: string
    scopeOfWorkDetails: string
    deliverables: DeliverableItem[]
    extensionYear: string
    extensionDeliverables: DeliverableItem[]
  }
}

export async function generateScopeOfWork(params: SowConsultancyRequest): Promise<ScopeOfWorkResponse | null> {
  try {
    const response = await fetch("/api/generate-sow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error generating scope of work:", error)
    throw error
  }
}
