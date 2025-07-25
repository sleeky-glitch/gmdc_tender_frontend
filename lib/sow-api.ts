export interface SowConsultancyRequest {
  tenderTitle: string
  departmentName: string
  contractDuration: number
  projectType?: string
  location?: string
  budget?: string
  specialRequirements?: string
}

export async function generateScopeOfWork(params: SowConsultancyRequest) {
  const response = await fetch("/api/generate-sow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error("Failed to generate scope of work")
  }

  return await response.json()
}
