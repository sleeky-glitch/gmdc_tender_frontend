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
    budget?: string
    specialRequirements?: string
  }
}

export async function generateScopeOfWork(params: SowConsultancyRequest): Promise<ScopeOfWorkResponse | null> {
  try {
    console.log("Calling SOW API with params:", params)

    const response = await fetch("/api/generate-sow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    console.log("SOW API response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("SOW API error:", errorData)
      throw new Error(`API error: ${response.status} - ${errorData.error || "Unknown error"}`)
    }

    const data = await response.json()
    console.log("SOW API response data:", data)
    return data
  } catch (error) {
    console.error("Error generating scope of work:", error)
    return null
  }
}
