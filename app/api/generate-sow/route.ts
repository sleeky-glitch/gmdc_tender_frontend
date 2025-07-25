import { type NextRequest, NextResponse } from "next/server"

interface SowConsultancyRequest {
  tenderTitle: string
  departmentName: string
  contractDuration: number
  projectType?: string
  location?: string
  budget?: string
  specialRequirements?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log("SOW API route called")

    const body: SowConsultancyRequest = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    // Use environment variable for API URL, fallback to the provided URL
    const apiUrl = process.env.SOW_API_URL || "http://172.29.100.196:8000/api/SOW_consultancy"
    console.log("API URL:", apiUrl)

    // Call the external API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("External API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`External API error: ${response.status} - ${errorText}`)

      return NextResponse.json(
        {
          error: "External API error",
          status: response.status,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("External API response data:", JSON.stringify(data, null, 2))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in SOW API route:", error)

    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error("Error details:", { message: errorMessage, stack: errorStack })

    return NextResponse.json(
      {
        error: "Failed to generate scope of work",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
