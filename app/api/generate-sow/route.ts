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
    console.log("=== SOW API Route Started ===")

    // Parse request body
    let body: SowConsultancyRequest
    try {
      body = await request.json()
      console.log("✅ Request body parsed successfully:", JSON.stringify(body, null, 2))
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
        },
        { status: 400 },
      )
    }

    // Get API URL
    const apiUrl = process.env.SOW_API_URL || "http://172.29.100.196:8000/api/SOW_consultancy"
    console.log("🌐 Using API URL:", apiUrl)
    console.log("🔧 Environment variable SOW_API_URL:", process.env.SOW_API_URL ? "SET" : "NOT SET")

    // Make request to external API
    console.log("📤 Making request to external API...")
    let response: Response
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(body),
      })
      console.log("📥 External API response received. Status:", response.status)
      console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()))
    } catch (fetchError) {
      console.error("❌ Network error calling external API:", fetchError)
      return NextResponse.json(
        {
          error: "Network error calling external API",
          details: fetchError instanceof Error ? fetchError.message : "Unknown network error",
          apiUrl: apiUrl,
        },
        { status: 502 },
      )
    }

    // Handle non-OK responses
    if (!response.ok) {
      console.error(`❌ External API returned error status: ${response.status}`)

      let errorText: string
      let errorData: any = null

      try {
        errorText = await response.text()
        console.log("📄 Raw error response:", errorText)

        // Try to parse as JSON
        try {
          errorData = JSON.parse(errorText)
          console.log("📋 Parsed error data:", errorData)
        } catch {
          console.log("📄 Error response is not JSON, using as text")
        }
      } catch (textError) {
        console.error("❌ Failed to read error response:", textError)
        errorText = "Failed to read error response"
      }

      return NextResponse.json(
        {
          error: "External API error",
          status: response.status,
          statusText: response.statusText,
          details: errorData || errorText,
          apiUrl: apiUrl,
        },
        { status: response.status },
      )
    }

    // Parse successful response
    let data: any
    try {
      data = await response.json()
      console.log("✅ External API response parsed successfully")
      console.log("📊 Response data keys:", Object.keys(data))
    } catch (parseError) {
      console.error("❌ Failed to parse successful response as JSON:", parseError)
      const textResponse = await response.text()
      console.log("📄 Raw response text:", textResponse)

      return NextResponse.json(
        {
          error: "Invalid JSON response from external API",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          rawResponse: textResponse,
        },
        { status: 502 },
      )
    }

    console.log("✅ SOW API Route completed successfully")
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Unexpected error in SOW API route:", error)
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  console.log("🔧 CORS preflight request received")
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
