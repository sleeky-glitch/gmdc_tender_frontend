"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateRfpDocument } from "@/lib/document-generator"
import { generateRfpNumber } from "@/lib/rfp-utils"
import { FileUploader } from "@/components/file-uploader"
import { ScopeOfWorkForm, type ScopeOfWorkData } from "@/components/scope-of-work-form"
import { FileText, Calendar, FileCode, Download, Eye, InfoIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// RFP types
const RFP_TYPES = {
  CONSULTANCY: "consultancy",
  MAINTENANCE: "maintenance",
  SUPPLY: "supply",
  OTHER: "other",
}

// Function to calculate default tender fee based on estimated amount
function calculateDefaultTenderFee(estimatedAmount: number): number {
  if (estimatedAmount <= 2500000) {
    // Up to Rs. 25 Lakh
    return 1500
  } else if (estimatedAmount <= 5000000) {
    // Up to Rs. 50 Lakh
    return 2500
  } else if (estimatedAmount <= 10000000) {
    // Up to Rs. 1 Cr
    return 5000
  } else {
    // Above Rs. 1 Cr
    return 15000
  }
}

// Function to calculate default EMD based on estimated amount
function calculateDefaultEMD(estimatedAmount: number): number {
  // 3% of total estimated cost
  return Math.round(estimatedAmount * 0.03)
}

// Function to format currency with commas
function formatCurrency(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Function to parse currency string to number
function parseCurrency(value: string): number {
  return Number.parseInt(value.replace(/,/g, ""), 10) || 0
}

export function RfpForm() {
  const [activeTab, setActiveTab] = useState("details")
  const [rfpType, setRfpType] = useState(RFP_TYPES.CONSULTANCY) // Set default value
  const [rfpTypeFixed, setRfpTypeFixed] = useState(false) // Track if RFP type is fixed

  // Update the formData state to include scopeOfWork
  const [formData, setFormData] = useState({
    // Common fields
    tenderTitle: "",
    shortTenderTitle: "",
    locationName: "",
    departmentName: "",
    financialYear: "24-25",
    serialNumber: "01",
    month: "May",
    year: "2025",
    contractDuration: "12", // Added contract duration field with default value

    // Supply specific fields
    itemName: "",

    // File upload for Other type
    customDocument: null as File | null,

    // Scope of Work data
    scopeOfWork: null as ScopeOfWorkData | null,

    // New fields for bidding schedule
    rfpAvailableDate: "",
    queryDeadlineDate: "",
    preBidMeetingDate: "",
    priceBidDeadlineDate: "",
    technicalBidDeadlineDate: "",
    technicalBidOpeningDate: "",
    issuingAuthority: "",
    contactEmail: "",

    // Tender estimation and fee fields
    estimatedAmount: "",
    rfpFeeAmount: "",
    emdAmount: "",
  })

  const [rfpNumber, setRfpNumber] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)

  // Fix RFP type when moving away from details tab
  useEffect(() => {
    if (activeTab !== "details" && !rfpTypeFixed) {
      setRfpTypeFixed(true)
    }
  }, [activeTab, rfpTypeFixed])

  // Update tender fee and EMD when estimated amount changes
  useEffect(() => {
    if (formData.estimatedAmount) {
      const estimatedAmount = parseCurrency(formData.estimatedAmount)
      if (estimatedAmount > 0) {
        const tenderFee = calculateDefaultTenderFee(estimatedAmount)
        const emd = calculateDefaultEMD(estimatedAmount)

        setFormData((prev) => ({
          ...prev,
          rfpFeeAmount: formatCurrency(tenderFee),
          emdAmount: formatCurrency(emd),
        }))
      }
    }
  }, [formData.estimatedAmount])

  const handleRfpTypeChange = (type: string) => {
    if (!rfpTypeFixed) {
      setRfpType(type)
      // Reset preview when changing type
      setDocumentUrl(null)
    }
  }

  const handleChange = (field: string, value: string | File | null | ScopeOfWorkData) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-generate RFP number when required fields are filled
      if (
        field === "locationName" ||
        field === "departmentName" ||
        field === "shortTenderTitle" ||
        field === "financialYear" ||
        field === "serialNumber"
      ) {
        if (newData.locationName && newData.departmentName && newData.shortTenderTitle && newData.financialYear) {
          const generatedNumber = generateRfpNumber(
            newData.locationName,
            newData.departmentName,
            newData.shortTenderTitle,
            newData.serialNumber,
            newData.financialYear,
          )
          setRfpNumber(generatedNumber)
        }
      }

      return newData
    })
  }

  // Handle currency input fields
  const handleCurrencyChange = (field: string, value: string) => {
    // Remove non-numeric characters except commas
    const numericValue = value.replace(/[^\d,]/g, "")

    // Format with commas
    const formattedValue = numericValue ? formatCurrency(parseCurrency(numericValue)) : ""

    handleChange(field, formattedValue)
  }

  const handleFileChange = (file: File | null) => {
    handleChange("customDocument", file)
  }

  // Add a function to handle scope of work data
  const handleScopeOfWorkSave = (scopeData: ScopeOfWorkData) => {
    handleChange("scopeOfWork", scopeData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      // Make sure to include the scopeOfWork data in the document generation
      const url = await generateRfpDocument({
        ...formData,
        rfpNumber,
        rfpType,
        contractDuration: Number.parseInt(formData.contractDuration, 10) || 12,
        scopeOfWork: formData.scopeOfWork || undefined,
      })
      setDocumentUrl(url)
    } catch (error) {
      console.error("Error generating document:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const locations = ["Corporate Office", "Ahmedabad", "Vadodara", "Surat", "Rajkot", "Bhavnagar", "Jamnagar"]
  const departments = [
    "IT",
    "HR",
    "Finance",
    "Operations",
    "Legal",
    "Marketing",
    "Procurement",
    "Bauxite",
    "Cement",
    "CGM",
    "CS",
    "E-Auction",
    "Environment",
    "Facilities Management",
    "GEO",
    "GVT or CSR",
    "ICEM",
    "Ind AS",
    "Insurance",
    "ISO",
    "KEP",
    "LAND",
    "LP",
    "MM",
    "PD",
    "POWER",
    "PPD",
    "PR",
    "PUR",
    "PYRITE",
    "RE",
    "S & M",
    "SALE",
    "SCRAP",
    "Security",
    "SS",
    "Tech 2",
    "UMR",
  ]
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const currentYear = new Date().getFullYear()
  const years = [currentYear, currentYear + 1, currentYear + 2].map((year) => year.toString())
  const contractDurations = ["3", "6", "9", "12", "18", "24", "36"]

  // Function to navigate to the next tab
  const goToNextTab = () => {
    if (activeTab === "details") setActiveTab("schedule")
    else if (activeTab === "schedule") setActiveTab("scope")
  }

  // Function to navigate to the previous tab
  const goToPrevTab = () => {
    if (activeTab === "scope") setActiveTab("schedule")
    else if (activeTab === "schedule") setActiveTab("details")
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">RFP Type</h2>
        <Select value={rfpType} onValueChange={handleRfpTypeChange} disabled={rfpTypeFixed}>
          <SelectTrigger className={`bg-white ${rfpTypeFixed ? "opacity-80" : ""}`}>
            <SelectValue placeholder="Select RFP type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={RFP_TYPES.CONSULTANCY}>Consultancy Work</SelectItem>
            <SelectItem value={RFP_TYPES.MAINTENANCE}>Maintenance Service Work</SelectItem>
            <SelectItem value={RFP_TYPES.SUPPLY}>Supply and Maintenance Work</SelectItem>
            <SelectItem value={RFP_TYPES.OTHER}>Other</SelectItem>
          </SelectContent>
        </Select>
        {rfpTypeFixed && (
          <p className="text-sm text-amber-600">
            RFP type is fixed after moving to subsequent tabs. To change it, reset the form.
          </p>
        )}
      </div>

      {rfpType === RFP_TYPES.OTHER ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Custom RFP Template</h2>
            <FileUploader onFileChange={handleFileChange} />
            <p className="text-sm text-gray-500">
              Upload your custom RFP template document. Supported formats: PDF, DOCX, DOC.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenderTitle">Tender Title</Label>
              <Input
                id="tenderTitle"
                placeholder="Full title of the tender"
                value={formData.tenderTitle}
                onChange={(e) => handleChange("tenderTitle", e.target.value)}
                required
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={formData.month} onValueChange={(value) => handleChange("month", value)}>
                <SelectTrigger id="month" className="bg-white">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={formData.year} onValueChange={(value) => handleChange("year", value)}>
                <SelectTrigger id="year" className="bg-white">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={!formData.customDocument || !formData.tenderTitle}
            onClick={handleSubmit}
          >
            {isGenerating ? "Processing..." : "Process Custom Document"}
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                RFP Details
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Bidding Schedule
              </TabsTrigger>
              <TabsTrigger value="scope" className="flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                Scope of Work
              </TabsTrigger>
            </TabsList>

            {/* RFP Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">RFP Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tenderTitle">Tender Title</Label>
                        <Input
                          id="tenderTitle"
                          placeholder="Full title of the tender"
                          value={formData.tenderTitle}
                          onChange={(e) => handleChange("tenderTitle", e.target.value)}
                          required
                          className="bg-white"
                        />
                      </div>

                      {rfpType === RFP_TYPES.SUPPLY && (
                        <div className="space-y-2">
                          <Label htmlFor="itemName">Item Name</Label>
                          <Input
                            id="itemName"
                            placeholder="Name of the item for which RFP is issued"
                            value={formData.itemName}
                            onChange={(e) => handleChange("itemName", e.target.value)}
                            required
                            className="bg-white"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="shortTenderTitle">Short Tender Title</Label>
                        <Input
                          id="shortTenderTitle"
                          placeholder="Short title for RFP number (e.g., AITG)"
                          value={formData.shortTenderTitle}
                          onChange={(e) => handleChange("shortTenderTitle", e.target.value)}
                          required
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="locationName">Location</Label>
                        <Select
                          value={formData.locationName}
                          onValueChange={(value) => handleChange("locationName", value)}
                        >
                          <SelectTrigger id="locationName" className="bg-white">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="departmentName">Department</Label>
                        <Select
                          value={formData.departmentName}
                          onValueChange={(value) => handleChange("departmentName", value)}
                        >
                          <SelectTrigger id="departmentName" className="bg-white">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department} value={department}>
                                {department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contractDuration">Contract Duration (months)</Label>
                        <Select
                          value={formData.contractDuration}
                          onValueChange={(value) => handleChange("contractDuration", value)}
                        >
                          <SelectTrigger id="contractDuration" className="bg-white">
                            <SelectValue placeholder="Select contract duration" />
                          </SelectTrigger>
                          <SelectContent>
                            {contractDurations.map((duration) => (
                              <SelectItem key={duration} value={duration}>
                                {duration} months
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="serialNumber">Serial Number</Label>
                        <Input
                          id="serialNumber"
                          placeholder="Serial number (e.g., 01)"
                          value={formData.serialNumber}
                          onChange={(e) => handleChange("serialNumber", e.target.value)}
                          required
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="financialYear">Financial Year</Label>
                        <Input
                          id="financialYear"
                          placeholder="Financial year (e.g., 24-25)"
                          value={formData.financialYear}
                          onChange={(e) => handleChange("financialYear", e.target.value)}
                          required
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="month">Month</Label>
                        <Select value={formData.month} onValueChange={(value) => handleChange("month", value)}>
                          <SelectTrigger id="month" className="bg-white">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Select value={formData.year} onValueChange={(value) => handleChange("year", value)}>
                          <SelectTrigger id="year" className="bg-white">
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-md mt-6">
                      <div className="space-y-2">
                        <Label>Generated RFP Number</Label>
                        <div className="p-3 bg-white border rounded-md font-mono">
                          {rfpNumber || "RFP number will appear here"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={goToNextTab}
                  disabled={!formData.tenderTitle || !formData.departmentName || !formData.locationName}
                >
                  Next: Bidding Schedule
                </Button>
              </div>
            </TabsContent>

            {/* Bidding Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Bidding Schedule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="rfpAvailableDate">RFP Available Date</Label>
                        <Input
                          id="rfpAvailableDate"
                          type="date"
                          value={formData.rfpAvailableDate}
                          onChange={(e) => handleChange("rfpAvailableDate", e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="queryDeadlineDate">Query Deadline Date</Label>
                        <Input
                          id="queryDeadlineDate"
                          type="date"
                          value={formData.queryDeadlineDate}
                          onChange={(e) => handleChange("queryDeadlineDate", e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preBidMeetingDate">Pre-Bid Meeting Date</Label>
                        <Input
                          id="preBidMeetingDate"
                          type="date"
                          value={formData.preBidMeetingDate}
                          onChange={(e) => handleChange("preBidMeetingDate", e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priceBidDeadlineDate">Price Bid Deadline Date</Label>
                        <Input
                          id="priceBidDeadlineDate"
                          type="date"
                          value={formData.priceBidDeadlineDate}
                          onChange={(e) => handleChange("priceBidDeadlineDate", e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="technicalBidDeadlineDate">Technical Bid Deadline Date</Label>
                        <Input
                          id="technicalBidDeadlineDate"
                          type="date"
                          value={formData.technicalBidDeadlineDate}
                          onChange={(e) => handleChange("technicalBidDeadlineDate", e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="technicalBidOpeningDate">Technical Bid Opening Date</Label>
                        <Input
                          id="technicalBidOpeningDate"
                          type="date"
                          value={formData.technicalBidOpeningDate}
                          onChange={(e) => handleChange("technicalBidOpeningDate", e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="issuingAuthority">Issuing Authority</Label>
                        <Input
                          id="issuingAuthority"
                          placeholder="Name of issuing authority"
                          value={formData.issuingAuthority}
                          onChange={(e) => handleChange("issuingAuthority", e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="Email for queries"
                          value={formData.contactEmail}
                          onChange={(e) => handleChange("contactEmail", e.target.value)}
                          className="bg-white"
                        />
                      </div>

                      {/* Add Tender Estimation and Fee fields */}
                      <div className="col-span-1 md:col-span-2 mt-4">
                        <h3 className="font-medium text-lg mb-2">Tender Estimation and Fee Details</h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="estimatedAmount">Total Estimated Amount</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="h-4 w-4 text-gray-500" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Tender Fee and EMD are calculated based on the estimated amount:</p>
                                <ul className="list-disc pl-4 text-xs mt-1">
                                  <li>Up to Rs. 25 Lakh: Fee Rs. 1,500, EMD 3%</li>
                                  <li>Up to Rs. 50 Lakh: Fee Rs. 2,500, EMD 3%</li>
                                  <li>Up to Rs. 1 Cr: Fee Rs. 5,000, EMD 3%</li>
                                  <li>Above Rs. 1 Cr: Fee Rs. 15,000, EMD 3%</li>
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <Input
                            id="estimatedAmount"
                            placeholder="e.g., 5,000,000"
                            value={formData.estimatedAmount}
                            onChange={(e) => handleCurrencyChange("estimatedAmount", e.target.value)}
                            className="bg-white pl-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rfpFeeAmount">RFP Fee Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <Input
                            id="rfpFeeAmount"
                            placeholder="e.g., 5,000"
                            value={formData.rfpFeeAmount}
                            onChange={(e) => handleCurrencyChange("rfpFeeAmount", e.target.value)}
                            className="bg-white pl-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emdAmount">EMD Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                          <Input
                            id="emdAmount"
                            placeholder="e.g., 150,000"
                            value={formData.emdAmount}
                            onChange={(e) => handleCurrencyChange("emdAmount", e.target.value)}
                            className="bg-white pl-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goToPrevTab}>
                  Back: RFP Details
                </Button>
                <Button type="button" onClick={goToNextTab}>
                  Next: Scope of Work
                </Button>
              </div>
            </TabsContent>

            {/* Scope of Work Tab */}
            <TabsContent value="scope" className="space-y-6">
              {/* Pass isEmbedded={true} to prevent nested form elements */}
              {/* Pass additional props for API integration */}
              <ScopeOfWorkForm
                initialData={formData.scopeOfWork}
                onSave={handleScopeOfWorkSave}
                isEmbedded={true}
                department={formData.departmentName}
                tenderTitle={formData.tenderTitle}
                contractDuration={Number.parseInt(formData.contractDuration, 10) || 12}
                location={formData.locationName}
              />

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={goToPrevTab}>
                  Back: Bidding Schedule
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isGenerating || !rfpNumber}>
                  {isGenerating ? "Generating Document..." : "Generate RFP Document"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      )}

      {documentUrl && (
        <Card className="p-4 space-y-4 border-green-200 bg-green-50">
          <h3 className="font-semibold text-green-800">Document Generated Successfully</h3>
          <div className="flex justify-end">
            <Button asChild variant="outline" className="mr-2">
              <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview Document
              </a>
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a
                href={documentUrl}
                download={`GMDC_RFP_${formData.shortTenderTitle || "Document"}.docx`}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Word Document
              </a>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
