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

    // Make request to external API with timeout
    console.log("📤 Making request to external API...")
    let response: Response
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log("📥 External API response received. Status:", response.status)
      console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()))
    } catch (fetchError) {
      console.error("❌ Network error calling external API:", fetchError)

      let errorMessage = "Network error calling external API"
      let errorDetails = "Unknown network error"

      if (fetchError instanceof Error) {
        errorDetails = fetchError.message

        if (fetchError.name === "AbortError") {
          errorMessage = "Request timeout - external API took too long to respond"
          errorDetails = "The external API did not respond within 30 seconds"
        } else if (fetchError.message.includes("ECONNREFUSED")) {
          errorMessage = "Connection refused - external API is not accessible"
          errorDetails = "The external API server is not running or not accessible"
        } else if (fetchError.message.includes("ENOTFOUND")) {
          errorMessage = "DNS resolution failed - cannot find external API server"
          errorDetails = "The external API server hostname could not be resolved"
        } else if (fetchError.message.includes("ETIMEDOUT")) {
          errorMessage = "Connection timeout - external API is not responding"
          errorDetails = "The connection to the external API timed out"
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          apiUrl: apiUrl,
          timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
        },
        { status: response.status },
      )
    }

    // Parse successful response
    let rawResponseText: string
    try {
      rawResponseText = await response.text()
      console.log("📄 Raw successful response text length:", rawResponseText.length)
      console.log("🔤 First 500 characters:", rawResponseText.substring(0, 500))
      console.log("🔤 Last 100 characters:", rawResponseText.substring(Math.max(0, rawResponseText.length - 100)))
    } catch (textError) {
      console.error("❌ Failed to read response as text:", textError)
      return NextResponse.json(
        {
          error: "Failed to read response from external API",
          details: textError instanceof Error ? textError.message : "Unknown error",
        },
        { status: 502 },
      )
    }

    // Clean and validate the response
    const cleanedResponse = rawResponseText.trim()
    console.log("🧹 Cleaned response length:", cleanedResponse.length)

    // More flexible JSON detection
    const looksLikeJson =
      (cleanedResponse.startsWith("{") && cleanedResponse.endsWith("}")) ||
      (cleanedResponse.startsWith("[") && cleanedResponse.endsWith("]"))

    if (!looksLikeJson) {
      console.error("❌ Response doesn't appear to be JSON")
      console.error("📄 Full response:", rawResponseText)
      return NextResponse.json(
        {
          error: "External API returned non-JSON response",
          details: "Response does not appear to be valid JSON",
          rawResponse: rawResponseText.substring(0, 1000),
          responseLength: rawResponseText.length,
        },
        { status: 502 },
      )
    }

    let data: any
    try {
      data = JSON.parse(cleanedResponse)
      console.log("✅ External API response parsed successfully")
      console.log("📊 Response data keys:", Object.keys(data))
    } catch (parseError) {
      console.error("❌ Failed to parse successful response as JSON:", parseError)
      console.log("📄 Raw response that failed to parse:", cleanedResponse.substring(0, 500))

      return NextResponse.json(
        {
          error: "Invalid JSON response from external API",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          rawResponse: cleanedResponse.substring(0, 1000),
          responseLength: cleanedResponse.length,
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
