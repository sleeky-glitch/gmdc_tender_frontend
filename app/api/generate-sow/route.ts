import { type NextRequest, NextResponse } from "next/server"

interface SowConsultancyRequest {
  [key: string]: any // Define the structure based on your expected request body
}

export async function POST(request: NextRequest) {
  try {
    const body: SowConsultancyRequest = await request.json()

    // Use environment variable for API URL, fallback to the provided URL
    const apiUrl = process.env.SOW_API_URL || "http://172.29.100.196:8000/api/SOW_consultancy"

    // Call the external API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API error: ${response.status} - ${errorText}`)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating scope of work:", error)
    return NextResponse.json(
      { error: "Failed to generate scope of work", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
