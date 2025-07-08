import { RfpForm } from "@/components/rfp-form"
import { LogoImage } from "@/components/logo-image"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 mb-2">
                <LogoImage />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800">GMDC Tender Generation System</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Generate standardized RFP documents for consultancy work with our easy-to-use form. Fill in the details,
              customize the scope of work, and download your document in minutes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <RfpForm />
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Gujarat Mineral Development Corporation Limited. All rights reserved.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
