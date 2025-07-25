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
  scopeOfWork: string
  projectTitle: string
  scopeOfWorkDetails: string
  deliverables: DeliverableItem[]
  extensionYear: string
  extensionDeliverables: DeliverableItem[]
  budget?: string
  specialRequirements?: string
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
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`

      try {
        const errorText = await response.text()
        console.error("❌ SOW API error response text:", errorText)

        try {
          errorData = JSON.parse(errorText)
          console.error("❌ SOW API error data:", errorData)

          // Extract the most relevant error message
          if (errorData.error) {
            errorMessage = errorData.error
          } else if (errorData.details) {
            errorMessage = errorData.details
          }

          // If it's a non-JSON response error, provide more context
          if (errorData.error === "External API returned non-JSON response") {
            errorMessage = `API returned invalid response format. Response length: ${errorData.responseLength || "unknown"}`
            if (errorData.rawResponse) {
              console.error("📄 Raw response preview:", errorData.rawResponse.substring(0, 200))
            }
          }
        } catch {
          // If not JSON, use the text as error message
          errorMessage = errorText || errorMessage
        }
      } catch {
        console.error("❌ Failed to read error response")
      }

      throw new Error(errorMessage)
    }

    let responseText: string
    try {
      responseText = await response.text()
      console.log("📄 Client received response text length:", responseText.length)
    } catch (textError) {
      console.error("❌ Failed to read response text:", textError)
      throw new Error("Failed to read response from server")
    }

    // Clean the response
    const cleanedResponse = responseText.trim()

    // Validate response looks like JSON
    if (!cleanedResponse.startsWith("{") && !cleanedResponse.startsWith("[")) {
      console.error("❌ Client: Response is not JSON:", cleanedResponse.substring(0, 200))
      throw new Error("Server returned invalid response format")
    }

    let data: ScopeOfWorkResponse
    try {
      data = JSON.parse(cleanedResponse)
      console.log("✅ SOW API response data received:", data)
    } catch (parseError) {
      console.error("❌ Client: Failed to parse JSON response:", parseError)
      console.error("❌ Raw response that failed:", cleanedResponse.substring(0, 500))
      throw new Error("Server returned invalid JSON response")
    }

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
