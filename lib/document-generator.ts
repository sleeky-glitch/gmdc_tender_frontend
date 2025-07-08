"use client"

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  AlignmentType,
  TableOfContents,
  Header,
  Footer,
  PageNumber,
} from "docx"
import type { ScopeOfWorkData } from "@/components/scope-of-work-form"

// Update the RfpDocumentData interface to include the new fields
interface RfpDocumentData {
  tenderTitle: string
  rfpNumber: string
  month: string
  year: string
  locationName: string
  departmentName: string
  shortTenderTitle: string
  serialNumber: string
  financialYear: string
  rfpType: string
  itemName?: string
  customDocument?: File | null
  contractDuration?: number
  scopeOfWork?: ScopeOfWorkData

  // New fields for bidding schedule
  rfpAvailableDate?: string
  queryDeadlineDate?: string
  preBidMeetingDate?: string
  priceBidDeadlineDate?: string
  technicalBidDeadlineDate?: string
  technicalBidOpeningDate?: string
  issuingAuthority?: string
  contactEmail?: string

  // Tender estimation and fee fields
  estimatedAmount?: string
  rfpFeeAmount?: string
  emdAmount?: string
}

/**
 * Generates an RFP document based on the provided data
 * @returns URL to the generated document
 */
export async function generateRfpDocument(data: RfpDocumentData): Promise<string> {
  // Handle custom document upload for "other" type
  if (data.rfpType === "other" && data.customDocument) {
    return await processCustomDocument(data.customDocument, data)
  }

  // Create a new Word document
  let doc: Document

  // Generate document based on RFP type
  switch (data.rfpType) {
    case "consultancy":
      doc = await generateConsultancyRfp(data)
      break
    case "maintenance":
      doc = await generateMaintenanceRfp(data)
      break
    case "supply":
      doc = await generateSupplyRfp(data)
      break
    default:
      doc = await generateConsultancyRfp(data)
  }

  // Generate the document as a blob
  const blob = await Packer.toBlob(doc)

  // Return the document as a data URL
  return URL.createObjectURL(blob)
}

/**
 * Generates a Consultancy RFP document
 */
async function generateConsultancyRfp(data: RfpDocumentData): Promise<Document> {
  // Create sections for the document
  const children = [
    // Table of Contents
    new Paragraph({
      text: "TABLE OF CONTENTS",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      thematicBreak: true,
      spacing: {
        before: 400,
        after: 400,
      },
    }),

    new TableOfContents({
      hyperlink: true,
      headingStyleRange: "1-5",
      stylesWithLevels: [
        {
          styleId: "Heading1",
          level: 1,
        },
        {
          styleId: "Heading2",
          level: 2,
        },
        {
          styleId: "Heading3",
          level: 3,
        },
      ],
    }),

    // Disclaimer
    new Paragraph({
      text: "DISCLAIMER",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      pageBreakBefore: true,
      spacing: {
        before: 400,
        after: 400,
      },
    }),

    new Paragraph({
      text: `This RFP is being issued by the Gujarat Mineral Development Corporation Ltd (GMDC) (hereunder called "Authority"/ "GMDC") to the Bidder interested in assisting GMDC in ${data.tenderTitle} (RFP name).`,
      spacing: {
        before: 200,
        after: 200,
      },
    }),

    new Paragraph({
      text: `It is hereby clarified that this RFP is not an agreement, and the purpose of this RFP is to provide the Bidder(s) with information to assist in the formulation of their Proposals/Bids. While the RFP has been prepared in good faith with due care and caution, GMDC does not accept any liability or responsibility for the accuracy, reasonableness, or completeness of the information, or for any errors, omissions or misstatements, negligent or otherwise, in the information provided, or those in any documents, implied or referred herein. It is suggested that each Bidder/Bidder should conduct its own investigations and analysis and should check the accuracy, reliability and completeness of the information in this RFP and where necessary obtain independent advice from appropriate sources.`,
      spacing: {
        before: 200,
        after: 200,
      },
    }),

    new Paragraph({
      text: `Bidder should carefully examine and analyze the RFP and bring to the notice of GMDC any error, omission or inaccuracies therein that are apparent and to carry out its own investigation with respect to all matters related to the captioned subject, seek professional advice on technical, financial, legal, regulatory and taxation matters and satisfy himself of consequences of entering into any agreement and / or arrangement relating to the captioned subject. GMDC and its employees make no representation or warranty, express or implied, and shall incur no liability under any law, statute, rules or regulations as to the accuracy, reliability or completeness of the information contained in the RFP or in any material on which this RFP is based or with respect to any written or verbal information made available to any Proposer or its representative(s).`,
      spacing: {
        before: 200,
        after: 200,
      },
    }),

    // Definitions section
    new Paragraph({
      text: "DEFINITIONS",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      pageBreakBefore: true,
      spacing: {
        before: 400,
        after: 400,
      },
    }),

    new Paragraph({
      text: "In this RFP, the following word (s), unless repugnant to the context or meaning thereof, shall have the meaning(s) assigned to them herein below:",
      spacing: {
        before: 200,
        after: 200,
      },
    }),
  ]

  // Define definitions
  const definitions = [
    {
      number: "1.",
      text: `"GMDC"/Authority" shall mean the Gujarat Mineral Development Corporation Limited who shall appoint the Service provider for the captioned work.`,
    },
    {
      number: "2.",
      text: `"Bidder" shall mean any firm or body corporate registered in India which submits the bid including paying the RFP Fees and Bid Security/EMD as per the terms of this RFP within the stipulated time. It should be either Limited Liability Partnership firm registered under LLP act or a Company under the India Companies Act 1956/2013.`,
    },
    {
      number: "3.",
      text: `Bid/Proposal" means the Bid submitted by the Bidder(s) in response to this RFP in accordance with the provisions hereof including Technical Bid and Price Bid along with all other documents forming part and in support thereof as specified in this RFP.`,
    },
    {
      number: "4.",
      text: `"Bid Due Date" means last date of Bid submission as set out in Clause 1.6 of SECTION III`,
    },
    {
      number: "5.",
      text: `"Service provider" shall mean the successful Bidder who is selected by Authority/GMDC as per the process outlined in this RFP Document for assisting in preparing ${data.tenderTitle} for GMDC as per the Scope of Work.`,
    },
    {
      number: "6.",
      text: `"Consortium" shall mean the group of legally constituted entities, who have come together to participate in captioned work. A Consortium is not permitted to participate in this Project/Assignment as per the criteria specified in clause 5.1.`,
    },
    {
      number: "7.",
      text: `"Agreement/Contract" is the agreement to be entered into between 'Gujarat Mineral Development Corporation (GMDC)' and 'Service provider' comprising of all terms and conditions stated in this RFP.`,
    },
    {
      number: "8.",
      text: `"Corrupt Practice" shall have the meaning ascribed thereto under clause 8 of SECTION III this RFP.`,
    },
    {
      number: "9.",
      text: `"Conflict of Interest" shall have a meaning specified in clause 9 of SECTION III.`,
    },
    {
      number: "10.",
      text: `"Fees/Service Charges/Service Fees" shall mean the charges payable by GMDC for the Services rendered by the Service provider.`,
    },
    {
      number: "11.",
      text: `"Composite Score" shall mean score obtained by Service provider as per the formula provided in clause 5.5.`,
    },
    {
      number: "12.",
      text: `"Contract Price" shall mean the Service Fees as specified in Letter of Award issued by GMDC to the Service provider.`,
    },
    {
      number: "13.",
      text: `"Pre-Qualification Criteria" means criteria specified in clause 5.1 of SECTION III`,
    },
    {
      number: "14.",
      text: `"Evaluation Process" means steps of evaluation specified in clause 6 of SECTION III`,
    },
    {
      number: "15.",
      text: `"EMD/ Bid Security" means the Bid security/ earnest money deposit to be submitted by the Bidder as per clause 2.5 of SECTION III. All Bidders are exempted from the submission of EMD/ Bid Security.`,
    },
    {
      number: "16.",
      text: `Financial Score shall mean score obtained by the Bidder as per the formula provided in clause 5.4 of SECTION III.`,
    },
    {
      number: "17.",
      text: `Letter of Award" shall have the meaning ascribed thereto under clause 7.1 of RFP SECTION III.`,
    },
    {
      number: "18.",
      text: `"Parties" means the parties to the Agreement and "Party" means either of them, as the context may admit or require.`,
    },
    {
      number: "19.",
      text: `"Preferred Bidder "shall have a meaning specified in clause 6.4 (ii) of RFP SECTION III.`,
    },
    {
      number: "20.",
      text: `"Successful Bidder" means the Preferred Bidder selected in terms hereof and to whom GMDC shall issue the Letter of Award in accordance with the provisions hereof and who shall undertake the Terms of Reference as per the terms specified in RFP.`,
    },
    {
      number: "21.",
      text: `"Terms of Reference/Scope of Work" means all activities as per the Terms of Reference or Scope of Work mentioned in Section II of this RFP which the Service provider is required to carry out as per Good Industry Practice.`,
    },
    {
      number: "22.",
      text: `Technical Score shall mean score obtained by the Bidder as per the Technical Score system provided in clause 5.2 of RFP SECTION III.`,
    },
    {
      number: "23.",
      text: `"Third Party" means any Person other than GMDC and the Service provider.`,
    },
  ]

  // Add each definition to the children array
  definitions.forEach((def) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: def.number, bold: true }),
          new TextRun({ text: " " }),
          new TextRun({ text: def.text }),
        ],
        spacing: {
          before: 200,
          after: 200,
        },
      }),
    )
  })

  // Add final paragraph for definitions
  children.push(
    new Paragraph({
      text: "Any other term(s), not defined herein above but defined elsewhere in this RFP shall have the meaning(s) ascribed to such term(s) therein and shall be deemed to have been included in this Section.",
      spacing: {
        before: 200,
        after: 400,
      },
    }),
  )

  // Background Section
  children.push(
    new Paragraph({
      text: "SECTION I: BACKGROUND",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      pageBreakBefore: true,
      spacing: {
        before: 400,
        after: 400,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: `Gujarat Mineral Development Corporation Ltd (GMDC) is a leading Public Sector Mining and Minerals Company of Gujarat with operational experience of over 60 years. GMDC's product portfolio spans across mining, value added products and power. Its power portfolio includes clean energy sources such as solar and wind besides thermal power.`,
      spacing: {
        before: 200,
        after: 200,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: `GMDC's mining activities are spread across Gujarat in Kutch, Devbhoomi Dwarka, Panchmahal, Vadodara, Bhavnagar, Bharuch, Surat and Chhotaudepur districts of the State. It is currently mining minerals like Lignite with five operational lignite mines, Bauxite (11 operating mines), Fluorspar, Manganese, Ball Clay, Silica Sand, Bentonitic Clay and Limestone. GMDC also value adds to minerals through works such as Pyrite removal from Lignite, Beneficiation of Bauxite, Beneficiation of Low-Grade Manganese and Beneficiation of Fluorspar. The Company has set up a 250 MW lignite based Thermal Power Station at Nani Chher in Kutch as a forward integration, Wind power plant of 200.9 MW at Maliya, Jodiya, Godsar, Bhanvad, Bada, Verbala, Rojmal and Solar Power plant of 5 MW at Panandhro Project. GMDC's existing Metallic mineral portfolio includes Fluorspar, Manganese, Bauxite, and Multimetals in addition to other associated minerals like silica sand, Bentonite, Ball Clay and Limestone.`,
      spacing: {
        before: 200,
        after: 200,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: `GMDC has undertaken a strategic transformation exercise over the last few years with a view to achieve growth milestones, diversity its product portfolio, leverage existing assets, provide inputs to the industry and contribute to the growth of the state's economy. As part of its strategic transformation exercise, GMDC is already in the process of expanding its mining operations by setting up six new lignite-based projects in Kutch and South Gujarat. Further, GMDC through its metal division also intends to expand and develop metal mining portfolio by developing existing metal mining projects and exploring new opportunities in metal mining sector in India. A number of other projects are in the pipeline based on identified thrust areas. Leveraging its capabilities in lignite thus, one of the key strategic diversifications for GMDC is in the area of domestic coal mining, where it would like to access domestic coal mostly occurring in the eastern part of India. As part of this strategy, it has participated in auctions of commercial blocks conducted by the Ministry of Mines, Government of India. GMDC won the bids for Burapahar block, the Baitarani West coal block and more recently at Kudanali Lubri block, (all blocks in the state of Odisha in India).`,
      spacing: {
        before: 200,
        after: 200,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: `In line with GMDC's strategic vision for growth and diversification, the Corporation seeks to engage a qualified Service Provider for ${data.tenderTitle}. This initiative aims to enhance GMDC's capabilities in the ${data.departmentName} department, ensuring sustainable growth and operational excellence. The duration of this assignment is expected to be ${data.contractDuration || 12} months from the date of contract signing, subject to satisfactory performance and deliverables as outlined in the scope of work.`,
      spacing: {
        before: 200,
        after: 200,
      },
    }),
  )

  // Add estimated amount if available
  if (data.estimatedAmount) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "The total estimated amount for this tender is Rs. ", bold: false }),
          new TextRun({ text: data.estimatedAmount, bold: true }),
          new TextRun({ text: "/-" }),
        ],
        spacing: {
          before: 200,
          after: 200,
        },
      }),
    )
  }

  // Scope of Work Section
  children.push(
    new Paragraph({
      text: "SECTION II: TERMS OF REFERENCE / SCOPE OF WORK",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      pageBreakBefore: true,
      spacing: {
        before: 400,
        after: 400,
      },
    }),
  )

  // Add project title if available
  if (data.scopeOfWork?.projectTitle) {
    children.push(
      new Paragraph({
        text: data.scopeOfWork.projectTitle,
        alignment: AlignmentType.CENTER,
        style: "wellSpaced",
        spacing: {
          before: 200,
          after: 400,
        },
      }),
    )
  }

  // Add budget if available
  if (data.scopeOfWork?.budget) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Budget: ", bold: true }), new TextRun({ text: data.scopeOfWork.budget })],
        style: "wellSpaced",
        spacing: {
          before: 200,
          after: 200,
        },
      }),
    )
  }

  // Add special requirements if available
  if (data.scopeOfWork?.specialRequirements) {
    // Split by newlines to handle formatting
    const specialReqLines = data.scopeOfWork.specialRequirements.split("\n")

    children.push(
      new Paragraph({
        children: [new TextRun({ text: "Special Requirements: ", bold: true })],
        style: "wellSpaced",
        spacing: {
          before: 200,
          after: 100,
        },
      }),
    )

    // Add each line as a separate paragraph
    specialReqLines.forEach((line) => {
      if (line.trim()) {
        children.push(
          new Paragraph({
            text: line,
            style: "wellSpaced",
            spacing: {
              before: 100,
              after: 100,
            },
          }),
        )
      }
    })
  }

  // Add Scope of Work heading
  children.push(
    new Paragraph({
      text: "1. Scope of Work",
      heading: HeadingLevel.HEADING_2,
      spacing: {
        before: 300,
        after: 200,
      },
    }),
  )

  // Add Scope of Work content
  if (data.scopeOfWork?.scopeOfWorkDetails) {
    // Split by newlines to handle formatting
    const scopeLines = data.scopeOfWork.scopeOfWorkDetails.split("\n")

    // Add each line as a separate paragraph
    scopeLines.forEach((line) => {
      if (line.trim()) {
        children.push(
          new Paragraph({
            text: line,
            style: "wellSpaced",
            spacing: {
              before: 100,
              after: 100,
            },
          }),
        )
      }
    })
  } else {
    children.push(
      new Paragraph({
        text: "[Details to be provided in this section]",
        style: "wellSpaced",
        spacing: {
          before: 200,
          after: 300,
        },
      }),
    )
  }

  // Add Deliverables heading
  children.push(
    new Paragraph({
      text: "2. Deliverables",
      heading: HeadingLevel.HEADING_2,
      spacing: {
        before: 300,
        after: 200,
      },
    }),
  )

  // Add Deliverables introduction text
  children.push(
    new Paragraph({
      text: "The deliverables of the Scope are specified below.",
      style: "wellSpaced",
      spacing: {
        before: 200,
        after: 300,
      },
    }),
  )

  // Create deliverables table
  const deliverableRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: {
            size: 70,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: "F2F2F2",
          },
          children: [
            new Paragraph({
              text: "Deliverables",
              alignment: AlignmentType.CENTER,
              style: "tableHeader",
            }),
          ],
        }),
        new TableCell({
          width: {
            size: 30,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: "F2F2F2",
          },
          children: [
            new Paragraph({
              text: "Timeline",
              alignment: AlignmentType.CENTER,
              style: "tableHeader",
            }),
          ],
        }),
      ],
    }),
  ]

  // Add deliverable rows
  if (data.scopeOfWork?.deliverables && data.scopeOfWork.deliverables.length > 0) {
    data.scopeOfWork.deliverables.forEach((deliverable) => {
      // Process description - split by newlines
      const descriptionParagraphs = deliverable.description
        ? deliverable.description.split("\n").map(
            (line) =>
              new Paragraph({
                text: line.trim(),
                style: "tableCell",
              }),
          )
        : [
            new Paragraph({
              text: "To be defined",
              style: "tableCell",
            }),
          ]

      // Process timeline - split by newlines
      const timelineParagraphs = deliverable.timeline
        ? deliverable.timeline.split("\n").map(
            (line) =>
              new Paragraph({
                text: line.trim(),
                style: "tableCell",
              }),
          )
        : [
            new Paragraph({
              text: "(T+ Months) format",
              style: "tableCell",
            }),
          ]

      deliverableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: descriptionParagraphs,
            }),
            new TableCell({
              children: timelineParagraphs,
            }),
          ],
        }),
      )
    })
  } else {
    // Add default empty row
    deliverableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: "To be defined",
                style: "tableCell",
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: "(T+ Months) format",
                style: "tableCell",
              }),
            ],
          }),
        ],
      }),
    )
  }

  // Add the deliverables table
  children.push(
    new Table({
      rows: deliverableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        bottom: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        left: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        right: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        insideHorizontal: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        insideVertical: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
    }),
  )

  // Add T definition note
  children.push(
    new Paragraph({
      text: '"T" is defined as commencement date. The Commencement date shall be seven days from the date of signing of the Agreement or mutually agreed early date when the Service provider shall commence the work.',
      style: "italic",
      spacing: {
        before: 200,
        after: 400,
      },
    }),
  )

  // Add extension details
  children.push(
    new Paragraph({
      text: `(i) In case GMDC decides to extend the Contract beyond ${data.scopeOfWork?.extensionYear || "___"} year then the it shall issue Notice to Proceed by providing time period of 7 days. In case of extension, the tentative deliverables and timeline as envisaged at this time are provided below.`,
      style: "wellSpaced",
      spacing: {
        before: 300,
        after: 300,
      },
    }),
  )

  // Create extension deliverables table
  const extensionRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: {
            size: 70,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: "F2F2F2",
          },
          children: [
            new Paragraph({
              text: "Deliverables",
              alignment: AlignmentType.CENTER,
              style: "tableHeader",
            }),
          ],
        }),
        new TableCell({
          width: {
            size: 30,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: "F2F2F2",
          },
          children: [
            new Paragraph({
              text: "Timeline",
              alignment: AlignmentType.CENTER,
              style: "tableHeader",
            }),
          ],
        }),
      ],
    }),
  ]

  // Add extension deliverable rows
  if (data.scopeOfWork?.extensionDeliverables && data.scopeOfWork.extensionDeliverables.length > 0) {
    data.scopeOfWork.extensionDeliverables.forEach((deliverable) => {
      // Process description - split by newlines
      const descriptionParagraphs = deliverable.description
        ? deliverable.description.split("\n").map(
            (line) =>
              new Paragraph({
                text: line.trim(),
                style: "tableCell",
              }),
          )
        : [
            new Paragraph({
              text: "To be defined",
              style: "tableCell",
            }),
          ]

      // Process timeline - split by newlines
      const timelineParagraphs = deliverable.timeline
        ? deliverable.timeline.split("\n").map(
            (line) =>
              new Paragraph({
                text: line.trim(),
                style: "tableCell",
              }),
          )
        : [
            new Paragraph({
              text: "(T1+ Months format)",
              style: "tableCell",
            }),
          ]

      extensionRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: descriptionParagraphs,
            }),
            new TableCell({
              children: timelineParagraphs,
            }),
          ],
        }),
      )
    })
  } else {
    // Add default empty row
    extensionRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: "To be defined",
                style: "tableCell",
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: "(T1+ Months format)",
                style: "tableCell",
              }),
            ],
          }),
        ],
      }),
    )
  }

  // Add the extension deliverables table
  children.push(
    new Table({
      rows: extensionRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        bottom: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        left: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        right: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        insideHorizontal: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        insideVertical: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
    }),
  )

  // Add T1 definition note
  children.push(
    new Paragraph({
      text: '"T1" is defined as 15 days from the date of Notice to proceed to be issued by GMDC if contract period is extended as per the provision of this RFP.',
      style: "italic",
      spacing: {
        before: 200,
        after: 400,
      },
    }),
  )

  // Add Section III: Instructions to Bidders
  children.push(
    new Paragraph({
      text: "SECTION III: INSTRUCTIONS TO BIDDERS",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      pageBreakBefore: true,
      spacing: {
        before: 400,
        after: 400,
      },
    }),
  )

  // Add Introduction subsection
  children.push(
    new Paragraph({
      text: "1. INTRODUCTION",
      heading: HeadingLevel.HEADING_2,
      spacing: {
        before: 300,
        after: 200,
      },
    }),
  )

  // Add Bidding Process section
  children.push(
    new Paragraph({
      text: "1.1. Bidding Process",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  // Add bidding process content with proper formatting
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "a. ", bold: true }),
        new TextRun({
          text: `GMDC has adopted a single stage two packet bidding system separately for Technical Bid and Price Bid with evaluation as per Quality cum Cost Based System (QCBS) Method as detailed out in Request for Proposal for the ${data.tenderTitle} (the "Bidding Process"). Price Bid shall be submitted online while Technical Bid shall be submitted physically in hard copy prior to the time, date and address provided in clause 1.6. Complete Bid shall be submitted on or before the time and date fixed for submission of Bid ("Bid Due Date"). Bid delivered after Bid Due Date will be rejected.`,
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "b. ", bold: true }),
        new TextRun({
          text: "The Bidders need to offer its Bid which conforms to Terms of Reference and Terms and Conditions provided as part of this RFP Document.",
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "c. ", bold: true }),
        new TextRun({
          text: "In a first step, evaluation of Technical Bid will be carried out as specified in Clause 6.2 of SECTION III. Based on Technical evaluation, the Price Bids of only Bidder's meeting Responsiveness Criteria, Pre-Qualification Criteria and Qualification criteria as specified in clause 6.2(a), 5.1 and 5.2 shall be opened.",
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "d. ", bold: true }),
        new TextRun({
          text: 'In the second stage, a Price Bid Evaluation of Technically Qualified Bidders will be carried out as per Clause 5.4 and 6.3. The Bids will finally be ranked from the highest to lowest according to their combined technical and price scores (the "Composite Score") derived based on Quality cum Cost based method (the "QCBS") specified in Clause 5.5 of RFP SECTION III. The Bidder obtaining Highest Composite score shall be considered as Preferred Bidder (the "Preferred Bidder").',
        }),
      ],
      spacing: {
        before: 100,
        after: 200,
      },
    }),
  )

  // Add Due Diligence section
  children.push(
    new Paragraph({
      text: "1.2. Due Diligence",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: "The Bidders are encouraged to examine and familiarize themselves fully about the nature of assignment, scope of work, all instructions, forms, terms and conditions of RFP, local condition and any other matters considered relevant by them before submitting the Bid, sending written queries to GMDC, and attending a Pre-Bid meeting.",
      spacing: {
        before: 100,
        after: 200,
      },
    }),
  )

  // Add Acknowledgement by Bidder section
  children.push(
    new Paragraph({
      text: "1.3. Acknowledgement by Bidder",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: "By submitted the bid or proposal, the bidder acknowledges that:",
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  // Add numbered list for acknowledgements
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "1) ", bold: true }),
        new TextRun({ text: "made a complete and careful examination of the RFP." }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "2) ", bold: true }),
        new TextRun({ text: "received all relevant information requested from GMDC." }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "3) ", bold: true }),
        new TextRun({
          text: "accepted the risk of inadequacy, error or mistake in the information provided in the RFP or furnished by or on behalf of GMDC relating to any of the matters referred to in Clause 1.2 above; and",
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "4) ", bold: true }),
        new TextRun({ text: "acknowledged that it does not have a Conflict of Interest" }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "5) ", bold: true }),
        new TextRun({ text: "Agreed to be bound by the undertakings provided by it under and in terms hereof." }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      text: "GMDC shall not be liable for any omission, mistake or error in respect of any of the above or on account of any matter or thing arising out of or concerning or relating to the RFP or the Bidding Process, including any error or mistake therein or in any information or data given by GMDC.",
      spacing: {
        before: 100,
        after: 200,
      },
    }),
  )

  // Add Cost of Bidding section
  children.push(
    new Paragraph({
      text: "1.4. Cost of Bidding",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: "The Bidders shall be responsible for all of the costs associated with the preparation of their Bids and their participation in the Bid Process. GMDC will not be responsible or in any way liable for such costs, regardless of the conduct or outcome of the Bidding Process.",
      spacing: {
        before: 100,
        after: 200,
      },
    }),
  )

  // Add RFP Fee section
  children.push(
    new Paragraph({
      text: "1.5. RFP Fee",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "a) ", bold: true }),
        new TextRun({
          text: `Bidder will need to submit non-refundable RFP Document/Tender Fee of INR ${data.rfpFeeAmount || "______"}/- (Rupees as applicable) (i.e. RFP Fees of INR ${data.rfpFeeAmount || "_______"} + 18% GST). The RFP Document Fees should be submitted in any one of following payment modes;`,
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "(i) ", bold: true }),
        new TextRun({
          text: 'In the form of a Demand Draft in favour of "Gujarat Mineral Development Corporation Limited" and payable at Ahmedabad, India. Such Demand shall be issued by any Approved Bank as provided in Annexure 13 (List of Approved Banks).',
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "(ii) ", bold: true }),
        new TextRun({
          text: "Depositing the stated amount directly into GMDC bank account through NEFT/RTGS/wire transfer in GMDC's Bank account specified below.",
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  // Add bank details
  children.push(
    new Paragraph({
      text: "Bank Name: ICICI Bank, Ahmedabad Branch",
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 1440 }, // 1 inch indent
    }),
  )

  children.push(
    new Paragraph({
      text: "Account Number: 002405019379",
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 1440 }, // 1 inch indent
    }),
  )

  children.push(
    new Paragraph({
      text: "IFS Code: ICIC0000024",
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 1440 }, // 1 inch indent
    }),
  )

  children.push(
    new Paragraph({
      text: "SWIFT Code: ICICINBBXXX",
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 1440 }, // 1 inch indent
    }),
  )

  children.push(
    new Paragraph({
      text: "If payment is made through electronic mode, then the Bidder shall submit the receipt of the same in the technical bid documents as evidence for the payment of RFP Fees.",
      spacing: {
        before: 100,
        after: 200,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  // Add Schedule of Bidding section
  children.push(
    new Paragraph({
      text: "1.6. Schedule of Bidding",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: "GMDC shall endeavour to adhere to the bidding schedule as specified in table below.",
      spacing: {
        before: 100,
        after: 200,
      },
    }),
  )

  // Create bidding schedule table with detailed information
  const biddingScheduleRows = [
    new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          width: {
            size: 10,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: "F2F2F2",
          },
          children: [
            new Paragraph({
              text: "Sr. No.",
              alignment: AlignmentType.CENTER,
              style: "tableHeader",
            }),
          ],
        }),
        new TableCell({
          width: {
            size: 30,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: "F2F2F2",
          },
          children: [
            new Paragraph({
              text: "Event Description",
              alignment: AlignmentType.CENTER,
              style: "tableHeader",
            }),
          ],
        }),
        new TableCell({
          width: {
            size: 60,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: "F2F2F2",
          },
          children: [
            new Paragraph({
              text: "Date, Time and Address",
              alignment: AlignmentType.CENTER,
              style: "tableHeader",
            }),
            new Paragraph({
              text: "(Dates are in DD/MM/YYYY formats)",
              alignment: AlignmentType.CENTER,
              style: "tableHeader",
            }),
          ],
        }),
      ],
    }),
    // Row 1
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              text: "1",
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "Date from which RFP documents will be available",
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: `RFP shall be available from ${data.rfpAvailableDate || "__/__/2025"} from website https://www.gmdcltd.com and https://gmdctender.nprocure.com. Interested Bidders can download the RFP documents from above specified websites.`,
            }),
          ],
        }),
      ],
    }),
    // Row 2
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              text: "2",
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "Last date for receiving Pre-Bid queries/clarifications",
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: `Bidders may send their queries by ${data.queryDeadlineDate || "__/__/2025"} upto 18:00 hrs. through email to following contacts or reach out for any assistance.`,
            }),
            new Paragraph({
              text: `Issuing Authority ${data.issuingAuthority || "___________________"}`,
            }),
            new Paragraph({
              text: `Email: ${data.contactEmail || "___________________"}`,
            }),
            new Paragraph({
              text: "Address: Khanij Bhavan, 132 ft Ring road, Gujarat University Ground, Vastrapur, Ahmedabad",
            }),
            new Paragraph({
              text: "Land Lines : 079-27913443",
            }),
            new Paragraph({
              text: "Board Lines : 079-27913501, 079-27913200",
            }),
          ],
        }),
      ],
    }),
    // Row 3
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              text: "3",
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "Pre-Bid Meeting",
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: `The Pre-Bid Meeting shall be held both physically and online at the same time and date at 12:00 hrs. on ${data.preBidMeetingDate || "__/__/2025"}. The venue for the physical meeting will be at GMDC office at Khanij Bhavan, 132 ft Ring road, Gujarat University Ground, Vastrapur, Ahmedabad.`,
            }),
            new Paragraph({
              text: "A video link for those who may wish to join online shall be uploaded on GMDC website i.e. https://www.gmdcltd.com prior to pre bid meeting.",
            }),
          ],
        }),
      ],
    }),
    // Row 4
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              text: "4",
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "Online Submission of Price Bid",
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: `The Price Bid is to be submitted online only at designated place https://gmdctender.nprocure.com on ${data.priceBidDeadlineDate || "__/__/2025"} up-to 18:00 hrs and (i) any submission of offline price bid (i.e., physical submission) or (ii) submission of price bid along with technical bid will lead to disqualification.`,
            }),
            new Paragraph({
              text: "Technical Bid is not to be submitted online, but should be submitted in physical offline at the designated address by the deadline mentioned.",
            }),
          ],
        }),
      ],
    }),
    // Row 5
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              text: "5",
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "Last Date and Time of Submission of Technical Bid, RFP Fees & EMD in Hard Copy",
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: `The Technical Bid is to be submitted offline or before ${data.technicalBidDeadlineDate || "__/__/2025"} up to 15:00 Hrs. at GMDC office situated at Khanij Bhavan, 132-ft. Ring Road, Gujarat University Ground, Vastrapur, Ahmedabad- 380052, by Speed Post/Registered Post/Courier or by hand in sealed cover duly super scribed as mentioned in the RFP.`,
            }),
          ],
        }),
      ],
    }),
    // Row 6
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              text: "6",
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "Opening of Technical Bid",
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: `On ${data.technicalBidOpeningDate || "__/__/2025"} at 16:00 Hrs. at GMDC office situated at Ahmedabad as per the address specified in sr. no 2`,
            }),
          ],
        }),
      ],
    }),
    // Row 7
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              text: "7",
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "Opening of Price Bid",
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "To be indicated to later after completion of Technical Evaluation",
            }),
          ],
        }),
      ],
    }),
    // Row 8
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              text: "8",
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "Signing of Agreement",
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              text: "Within 30 days from the date of issuance of LOA.",
            }),
          ],
        }),
      ],
    }),
  ]

  // Add the bidding schedule table
  children.push(
    new Table({
      rows: biddingScheduleRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        bottom: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        left: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        right: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        insideHorizontal: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
        insideVertical: {
          style: BorderStyle.SINGLE,
          size: 1,
        },
      },
    }),
  )

  // Add the additional text for Instructions to Bidders
  children.push(
    new Paragraph({
      text: "GMDC shall endeavour to adhere to the bidding schedule as specified in above. However, there may be changes due to unavoidable circumstances. Any change shall be informed by placing the Corrigendum on the website and n-procurement portal.",
      spacing: {
        before: 200,
        after: 200,
      },
    }),
  )

  // Add General section
  children.push(
    new Paragraph({
      text: "2. GENERAL",
      heading: HeadingLevel.HEADING_2,
      spacing: {
        before: 300,
        after: 200,
      },
    }),
  )

  // Add Bid Validity section
  children.push(
    new Paragraph({
      text: "2.1. Bid Validity",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "a) ", bold: true }),
        new TextRun({
          text: 'Bids shall remain valid for a period of not less than 180 days (One Hundred and Eighty days) from the Bid Due Date/Bid Submission Date (the "Bid Validity Period"). The Bid of the Bidder shall be considered non-responsive if such Bid is valid for a period less the Bid Validity Period.',
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "b) ", bold: true }),
        new TextRun({
          text: "In exceptional circumstances, prior to expiry of the original Bid Validity Period, Authority may request the Bidders to extend the period of validity for a specified additional period. The request and the responses thereto shall be made in writing. A Bidder may refuse the request. A Bidder agreeing to the request will not be required or permitted to modify his Bid. A Bidder may refuse the request without forfeiting his Bid Security/EMD. A Bidder agreeing to the request will not be required or permitted to modify his Bid but will be required to extend the validity of his Bid Security/EMD for the period of the extension, and in compliance with Clause 2.5 of RFP SECTION III in all respects.",
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  // Add Numbers of Bids by Bidder section
  children.push(
    new Paragraph({
      text: "2.2. Numbers of Bids by Bidder",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: "No Bidder shall submit more than one Bid pursuant to this RFP. If a Bidder submits or participates in more than one Bid, such Bids shall be disqualified.",
      spacing: {
        before: 100,
        after: 200,
      },
    }),
  )

  // Add Governing Law and Jurisdiction section
  children.push(
    new Paragraph({
      text: "2.3. Governing Law and Jurisdiction",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: "The Bidding Process shall be governed by, and construed in accordance with, the laws of India and the Courts at Ahmedabad/Gandhinagar in India shall have exclusive jurisdiction over all disputes arising under, pursuant to and/ or in connection with the Bidding Process.",
      spacing: {
        before: 100,
        after: 200,
      },
    }),
  )

  // Add Authority's Right to accept and Reject any Bids or all Bids section
  children.push(
    new Paragraph({
      text: "2.4. Authority's Right to accept and Reject any Bids or all Bids.",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "a) ", bold: true }),
        new TextRun({
          text: "Notwithstanding anything contained in this RFP, GMDC reserves the right to accept or reject any Bid and to annul the Bidding Process /Bid Evaluation Process and reject all Bids, at any time without any liability or any obligation for such acceptance, rejection or annulment, and without assigning any reasons thereof.",
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "b) ", bold: true }),
        new TextRun({
          text: "It shall be deemed that by submitting the Bids, the Bidder agrees and releases GMDC, its employees, agents and advisers, irrevocably, unconditionally, fully and finally from any and all liability for claims, losses, damages, costs, expenses or liabilities in any way related to or arising from the exercise of any rights and/ or performance of any obligations hereunder, pursuant hereto and/ or in connection with the Bidding Process and waives, to the fullest extent permitted by applicable laws, any and all rights and/or claims it may have in this respect, whether actual or contingent, whether present or in future.",
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "c) ", bold: true }),
        new TextRun({
          text: "Without prejudice to the generality of Clause (a) and (b) above, GMDC reserves the right to reject any Proposal/Bid if:",
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      text: "1) Bid does not meet the Pre-qualification and Qualification criteria specified in this RFP",
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      text: "2) at any time, a material misrepresentation is made or discovered, or",
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      text: "3) The Bidder found to be in indulging in Fraudulent and Corrupt Practices as defined in this RFP.",
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      text: "4) The Bidder does not provide, within the time specified by GMDC, the supplemental information sought by GMDC for evaluation of the Bid.",
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      text: "5) Bidder submits conditional Bid.",
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      text: "If such disqualification / rejection occurs after the Bids have been opened and the Preferred Bidder as per award criteria gets disqualified / rejected, then GMDC reserves the right to consider the next best Preferred Bidder or take any other measure as may be deemed fit in the sole discretion of GMDC, including annulment of the Selection Process.",
      spacing: {
        before: 100,
        after: 200,
      },
    }),
  )

  // Add Earnest Money Deposit (EMD)/Bid Security section
  children.push(
    new Paragraph({
      text: "2.5. Earnest Money Deposit (EMD)/Bid Security",
      heading: HeadingLevel.HEADING_3,
      spacing: {
        before: 200,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "a) ", bold: true }),
        new TextRun({
          text: `The bidder shall furnish, a separate Bid Security (also referred to as "Earnest Money Deposit" (EMD)/ Bid Security") for Captioned work as part of his Bid as per the given format. The Bid Security/EMD shall be sealed in a separate sealed envelope along with RFP Fees and super scribing "Earnest Money Deposit and RFP Fees ". An Earnest Money Deposit of an amount of INR ${data.emdAmount || "__________"}/- (Rupees as applicable) shall be provided in favour of "Gujarat Mineral Development Corporation Ltd", in any one of the following forms/formats. The List of Approved Bank except co -operative banks are provided in Annexure 14.`,
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "i. ", bold: true }),
        new TextRun({
          text: "Account payee Demand Draft /Banker's Cheque from any bank among the list of scheduled commercial Bank in India published by RBI.",
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "ii. ", bold: true }),
        new TextRun({
          text: 'An irrevocable Bank Guarantee (the "Bank Guarantee"), payable at Ahmedabad from Approved Bank to Authority as per the Annexure 14 except Co-operative Banks and valid for a period of 210 days (Two Hundred and Ten Days) from the Bid Due Date in the format prescribed in the bid documents. The validity of Bank Guarantee may be extended as may be mutually agreed between Authority and Bidder from time to time as per clause 2.1 of RFP SECTION III. In case Bidder intends to provide Bank Guarantee then it should be provided Compulsory e-Bank Guarantee Confirmation through ICICI Bank through SFMS1  under our IFS Code: ICIC0000024 and UIC GMDC530265584 for Field 7037. Bank Name: ICICI BANK LTD.',
        }),
      ],
      spacing: {
        before: 100,
        after: 100,
      },
      indent: { left: 720 }, // 0.5 inch indent
    }),
  )

  // Create the document with headers and footers
  const doc = new Document({
    title: `RFP - ${data.tenderTitle}`,
    description: `Request for Proposal - ${data.tenderTitle}`,
    creator: "GMDC Tender Generation System",
    styles: {
      paragraphStyles: [
        {
          id: "wellSpaced",
          name: "Well Spaced",
          basedOn: "Normal",
          next: "Normal",
          run: {
            size: 24, // 12pt
          },
          paragraph: {
            spacing: {
              line: 360, // 1.5 line spacing
              before: 240, // 12pt before
              after: 240, // 12pt after
            },
          },
        },
        {
          id: "tableHeader",
          name: "Table Header",
          basedOn: "Normal",
          next: "Normal",
          run: {
            bold: true,
            size: 24, // 12pt
          },
        },
        {
          id: "tableCell",
          name: "Table Cell",
          basedOn: "Normal",
          next: "Normal",
          run: {
            size: 24, // 12pt
          },
        },
        {
          id: "italic",
          name: "Italic",
          basedOn: "Normal",
          next: "Normal",
          run: {
            italics: true,
            size: 24, // 12pt
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440, // 1 inch
              bottom: 1440, // 1 inch
              left: 1440, // 1 inch
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "GMDC Tender Generation System",
                    size: 18, // 9pt
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18, // 9pt
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Cover page
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 2880, // 2 inches
              after: 240, // 12pt
            },
            children: [
              new TextRun({
                text: "Request for Proposal",
                bold: true,
                size: 32, // 16pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 240, // 12pt
              after: 240, // 12pt
            },
            children: [
              new TextRun({
                text: "for",
                size: 32, // 16pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 240, // 12pt
              after: 480, // 24pt
            },
            children: [
              new TextRun({
                text: data.tenderTitle || "(To be Inserted)",
                bold: true,
                size: 28, // 14pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 480, // 24pt
              after: 240, // 12pt
            },
            children: [
              new TextRun({
                text: `${data.month} ${data.year}`,
                size: 24, // 12pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 240, // 12pt
              after: 480, // 24pt
            },
            children: [
              new TextRun({
                text: `RFP No: ${data.rfpNumber}`,
                size: 24, // 12pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 720, // 36pt
              after: 240, // 12pt
            },
            children: [
              new TextRun({
                text: "Gujarat Mineral Development Corporation Limited",
                bold: true,
                size: 24, // 12pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 240, // 12pt
              after: 240, // 12pt
            },
            children: [
              new TextRun({
                text: "Khanij Bhavan, 132-ft Ring Road, Gujarat University Ground, Vastrapur,",
                size: 20, // 10pt
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 0,
              after: 0,
            },
            children: [
              new TextRun({
                text: "Ahmedabad- 380052, India",
                size: 20, // 10pt
              }),
            ],
          }),

          // Page break after cover page
          new Paragraph({
            text: "",
            pageBreakBefore: true,
          }),

          // Add all other content
          ...children,
        ],
      },
    ],
  })

  return doc
}

/**
 * Generates a Maintenance Service Work RFP document
 */
async function generateMaintenanceRfp(data: RfpDocumentData): Promise<Document> {
  // Create a basic document for now - this would be expanded in a full implementation
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "Request for Proposal",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "for",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: data.tenderTitle || "(Insert RFP Name)",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `RFP No: ${data.rfpNumber}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Gujarat Mineral Development Corporation Limited",
            alignment: AlignmentType.CENTER,
            bold: true,
          }),
          new Paragraph({
            text: "Khanij Bhavan, 132-ft Ring Road, Gujarat University Ground, Vastrapur,",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Ahmedabad- 380052",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${data.month}, ${data.year}`,
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  })

  return doc
}

/**
 * Generates a Supply and Maintenance Work RFP document
 */
async function generateSupplyRfp(data: RfpDocumentData): Promise<Document> {
  // Create a basic document for now - this would be expanded in a full implementation
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: "Request for Proposal",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "for",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "RFP for Supply, Installation and Commissioning with",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Comprehensive Annual Maintenance of",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: data.itemName || "(Insert the Item Name for which RFP is issued)",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `RFP No: ${data.rfpNumber}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Gujarat Mineral Development Corporation Limited",
            alignment: AlignmentType.CENTER,
            bold: true,
          }),
          new Paragraph({
            text: "Khanij Bhavan, 132-ft Ring Road, Gujarat University Ground,",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Vastrapur, Ahmedabad- 380052",
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `${data.year}`,
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  })

  return doc
}

/**
 * Process a custom document upload
 */
async function processCustomDocument(file: File, data: RfpDocumentData): Promise<string> {
  // For simplicity in this demo, we'll just return a data URL of the file
  // In a real implementation, you would process the document and add the RFP details

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target?.result) {
        // In a real implementation, you would modify the document here
        // For now, we'll just return the original document
        resolve(event.target.result as string)
      } else {
        reject(new Error("Failed to read file"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsDataURL(file)
  })
}
