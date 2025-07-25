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
    console.log("🚀 Starting SOW generation with params:", params)

    const response = await fetch("/api/generate-sow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    })

    console.log("📥 SOW API response status:", response.status)
    console.log("📥 SOW API response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorData: any
      try {
        errorData = await response.json()
        console.error("❌ SOW API error data:", errorData)
      } catch {
        const errorText = await response.text()
        console.error("❌ SOW API error text:", errorText)
        errorData = { error: errorText }
      }

      throw new Error(`API error: ${response.status} - ${errorData.error || errorData.details || "Unknown error"}`)
    }

    const data = await response.json()
    console.log("✅ SOW API response data received:", data)
    return data
  } catch (error) {
    console.error("❌ Error generating scope of work:", error)

    // Re-throw with more context
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error("Unknown error occurred while generating scope of work")
    }
  }
}
