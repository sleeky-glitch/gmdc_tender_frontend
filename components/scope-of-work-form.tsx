"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Wand2 } from "lucide-react"
import { generateScopeOfWork } from "@/lib/sow-api"
import { useToast } from "@/hooks/use-toast"

export interface DeliverableItem {
  description: string
  timeline: string
}

export interface ExtensionDeliverableItem {
  description: string
  timeline: string
}

export interface ScopeOfWorkData {
  projectTitle: string
  scopeOfWorkDetails: string
  deliverables: DeliverableItem[]
  extensionYear: string
  extensionDeliverables: ExtensionDeliverableItem[]
  budget?: string
  specialRequirements?: string
}

interface ScopeOfWorkFormProps {
  initialData?: ScopeOfWorkData | null
  onSave: (data: ScopeOfWorkData) => void
  isEmbedded?: boolean // New prop to indicate if this form is embedded in another form
  department?: string // Department for API
  tenderTitle?: string // Tender title for API
  contractDuration?: number // Contract duration for API
  location?: string // Location for API
}

const defaultFormData: ScopeOfWorkData = {
  projectTitle: "",
  scopeOfWorkDetails: "",
  deliverables: [{ description: "", timeline: "" }],
  extensionYear: "1",
  extensionDeliverables: [{ description: "", timeline: "" }],
  budget: "",
  specialRequirements: "",
}

export function ScopeOfWorkForm({
  initialData,
  onSave,
  isEmbedded = false,
  department = "",
  tenderTitle = "",
  contractDuration = 12,
  location = "",
}: ScopeOfWorkFormProps) {
  // Initialize form data safely
  const [formData, setFormData] = useState<ScopeOfWorkData>(() => {
    // If we have initialData, use that
    if (initialData) {
      return initialData
    }

    // Otherwise create a new default with the tender title if available
    return {
      ...defaultFormData,
      projectTitle: tenderTitle || "",
    }
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  // Handle tender title changes - only update if project title is empty or matches previous tender title
  useEffect(() => {
    if (tenderTitle && (!formData.projectTitle || formData.projectTitle === tenderTitle)) {
      setFormData((prev) => ({
        ...prev,
        projectTitle: tenderTitle,
      }))
    }
  }, [tenderTitle])

  // Auto-save when form data changes, but with debounce to prevent excessive saves
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only save if we have some meaningful data
      if (formData.scopeOfWorkDetails || formData.projectTitle || formData.budget) {
        onSave(formData)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [formData, onSave])

  const handleChange = (
    field: keyof ScopeOfWorkData,
    value: string | DeliverableItem[] | ExtensionDeliverableItem[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDeliverableChange = (index: number, field: keyof DeliverableItem, value: string) => {
    const updatedDeliverables = [...formData.deliverables]
    updatedDeliverables[index] = {
      ...updatedDeliverables[index],
      [field]: value,
    }
    handleChange("deliverables", updatedDeliverables)
  }

  const handleExtensionDeliverableChange = (index: number, field: keyof ExtensionDeliverableItem, value: string) => {
    const updatedDeliverables = [...formData.extensionDeliverables]
    updatedDeliverables[index] = {
      ...updatedDeliverables[index],
      [field]: value,
    }
    handleChange("extensionDeliverables", updatedDeliverables)
  }

  const addDeliverable = () => {
    handleChange("deliverables", [...formData.deliverables, { description: "", timeline: "" }])
  }

  const removeDeliverable = (index: number) => {
    const updatedDeliverables = formData.deliverables.filter((_, i) => i !== index)
    handleChange("deliverables", updatedDeliverables)
  }

  const addExtensionDeliverable = () => {
    handleChange("extensionDeliverables", [...formData.extensionDeliverables, { description: "", timeline: "" }])
  }

  const removeExtensionDeliverable = (index: number) => {
    const updatedDeliverables = formData.extensionDeliverables.filter((_, i) => i !== index)
    handleChange("extensionDeliverables", updatedDeliverables)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleGenerateScopeOfWork = async () => {
    if (!department || !tenderTitle) {
      toast({
        title: "Missing information",
        description: "Department and tender title are required to generate scope of work.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await generateScopeOfWork({
        tenderTitle,
        departmentName: department,
        contractDuration,
        location,
        projectType: "Consultancy", // Default value, could be made dynamic
        budget: formData.budget || "", // Use budget from form
        specialRequirements: formData.specialRequirements || "", // Use special requirements from form
      })

      if (response && response.scopeOfWork) {
        setFormData(response.scopeOfWork)
        // Explicitly save the generated scope of work
        onSave(response.scopeOfWork)
        toast({
          title: "Success",
          description: "Scope of work generated successfully.",
        })
      } else {
        throw new Error("Failed to generate scope of work")
      }
    } catch (error) {
      console.error("Error generating scope of work:", error)
      toast({
        title: "Error",
        description: "Failed to generate scope of work. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Extract the form content to be used with or without a form wrapper
  const formContent = (
    <Card>
      <CardHeader className="bg-[#4CAF50] text-white py-2 px-4">
        <CardTitle className="text-center">TERMS OF REFERENCE / SCOPE OF WORK</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Project Title - Centered and italicized */}
        <div className="space-y-2">
          <Label htmlFor="projectTitle">
            Project Title <span className="text-sm text-gray-500">(Pre-filled from RFP title)</span>
          </Label>
          <Input
            id="projectTitle"
            value={formData.projectTitle}
            onChange={(e) => handleChange("projectTitle", e.target.value)}
            placeholder="Enter project title"
            className="bg-white"
          />
        </div>

        {formData.projectTitle && <div className="text-center italic mb-4">{formData.projectTitle}</div>}

        {/* Budget and Special Requirements - Added these fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              value={formData.budget || ""}
              onChange={(e) => handleChange("budget", e.target.value)}
              placeholder="e.g., ₹50,00,000"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialRequirements">Special Requirements</Label>
            <Textarea
              id="specialRequirements"
              value={formData.specialRequirements || ""}
              onChange={(e) => handleChange("specialRequirements", e.target.value)}
              placeholder="Enter any special requirements or qualifications"
              className="h-[80px] bg-white"
            />
          </div>
        </div>

        {/* Generate button */}
        {department && tenderTitle && (
          <div className="flex justify-end mb-6">
            <Button
              type="button"
              onClick={handleGenerateScopeOfWork}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-[#4CAF50] hover:bg-[#3e8e41]"
            >
              {isGenerating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  Generate Scope of Work
                </>
              )}
            </Button>
          </div>
        )}

        {/* Scope of Work Details */}
        <div className="space-y-2">
          <Label htmlFor="scopeOfWorkDetails" className="text-base font-bold">
            1. Scope of Work
          </Label>
          <Textarea
            id="scopeOfWorkDetails"
            value={formData.scopeOfWorkDetails}
            onChange={(e) => handleChange("scopeOfWorkDetails", e.target.value)}
            placeholder="[Details to be provided in this section]"
            className="min-h-[150px] bg-white"
          />
        </div>

        {/* Deliverables */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-base font-bold">2. Deliverables</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDeliverable}
              className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Deliverable
            </Button>
          </div>

          <div className="text-sm mb-2">The deliverables of the Scope are specified below.</div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70%] text-center bg-gray-100">Deliverables</TableHead>
                <TableHead className="w-[25%] text-center bg-gray-100">Timeline</TableHead>
                <TableHead className="w-[5%] bg-gray-100"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.deliverables.map((deliverable, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={deliverable.description}
                      onChange={(e) => handleDeliverableChange(index, "description", e.target.value)}
                      placeholder="To be defined"
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={deliverable.timeline}
                      onChange={(e) => handleDeliverableChange(index, "timeline", e.target.value)}
                      placeholder="(T+ Months) format"
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    {formData.deliverables.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeDeliverable(index)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="text-sm text-gray-500 italic">
            "T" is defined as commencement date. The Commencement date shall be seven days from the date of signing of
            the Agreement or mutually agreed early date when the Service provider shall commence the work.
          </div>
        </div>

        {/* Contract Extension */}
        <div className="space-y-4 mt-8">
          <div className="flex items-start space-x-2">
            <div className="text-sm">(i)</div>
            <div className="text-sm flex-1">
              In case GMDC decides to extend the Contract beyond
              <Input
                id="extensionYear"
                value={formData.extensionYear}
                onChange={(e) => handleChange("extensionYear", e.target.value)}
                className="w-16 mx-2 inline-block bg-white"
              />
              year then the it shall issue Notice to Proceed by providing time period of 7 days. In case of extension,
              the tentative deliverables and timeline as envisaged at this time are provided below.
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Label>Extension Deliverables</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExtensionDeliverable}
              className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Deliverable
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[70%] text-center bg-gray-100">Deliverables</TableHead>
                <TableHead className="w-[25%] text-center bg-gray-100">Timeline</TableHead>
                <TableHead className="w-[5%] bg-gray-100"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.extensionDeliverables.map((deliverable, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={deliverable.description}
                      onChange={(e) => handleExtensionDeliverableChange(index, "description", e.target.value)}
                      placeholder="To be defined"
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={deliverable.timeline}
                      onChange={(e) => handleExtensionDeliverableChange(index, "timeline", e.target.value)}
                      placeholder="(T1+ Months format)"
                      className="bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    {formData.extensionDeliverables.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExtensionDeliverable(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="text-sm text-gray-500 italic">
            "T1" is defined as 15 days from the date of Notice to proceed to be issued by GMDC if contract period is
            extended as per the provision of this RFP.
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // If embedded in another form, just return the content without a form wrapper
  if (isEmbedded) {
    return <div className="space-y-8">{formContent}</div>
  }

  // Otherwise, wrap in a form element
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {formContent}
      <Button type="submit" className="w-full">
        Save Scope of Work
      </Button>
    </form>
  )
}
