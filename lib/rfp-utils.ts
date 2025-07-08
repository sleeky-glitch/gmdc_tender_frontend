/**
 * Generates an RFP number based on the GMDC format
 * Format: GMDC/LocationName/DepartmentName/ShortTenderTitle/SerialNumber/FinancialYear
 */
export function generateRfpNumber(
  locationName: string,
  departmentName: string,
  shortTenderTitle: string,
  serialNumber: string,
  financialYear: string,
): string {
  return `GMDC/${locationName}/${departmentName}/${shortTenderTitle}/${serialNumber}/${financialYear}`
}
